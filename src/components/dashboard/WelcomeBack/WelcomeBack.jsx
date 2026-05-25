import "./WelcomeBack.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { baseUrl } from "../../../env";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useIncomingCallSse } from "../../../hooks/useIncomingCallSse";
import { toast } from "react-toastify";
import {
  clearDoctorRejoinSession,
  loadDoctorRejoinSession,
} from "../../../utils/activeCallSession";
import {
  formatGpJoinError,
  joinGpCallAsDoctor,
} from "../../../utils/joinGpCallAsDoctor";

function WelcomeBack({ status, onAlertsChange }) {
  const [pickedCalls, setPickedCalls] = useState(new Set());
  const [callTimer, setCallTimer] = useState(null);
  const [rejoinData, setRejoinData] = useState(null);
  const [answeringCallId, setAnsweringCallId] = useState(null);
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const online = "Online";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const prevCallCountRef = useRef(0);
  const ringtone =
    "https://res.cloudinary.com/da79pzyla/video/upload/v1737819241/galaxy_bells_s25_ywq7j0.mp3";

  const fetchBroadcastCalls = useCallback(async () => {
    const response = await axios.get(
      `${baseUrl}/api/v1/video/broadcast-calls/${userData?.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response?.data || [];
  }, [token, userData?.id]);

  const pickedList = [...pickedCalls];

  const { calls: activeCalls, sseConnected } = useIncomingCallSse({
    doctorId: userData?.id,
    token,
    enabled: status === online && !!userData?.id && !!token,
    pickedCallIds: pickedList,
    fetchCalls: fetchBroadcastCalls,
  });

  useEffect(() => {
    const storedPickedCalls =
      JSON.parse(localStorage.getItem("pickedCalls")) || [];
    setPickedCalls(new Set(storedPickedCalls));
    setRejoinData(loadDoctorRejoinSession());

    const unlockAudio = () => {
      if (!audioRef.current) return;
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        })
        .catch(() => {});
    };
    unlockAudio();
    document.addEventListener("click", unlockAudio, { once: true });

    return () => {
      document.removeEventListener("click", unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      clearCallTimer();
    };
  }, []);

  useEffect(() => {
    if (activeCalls.length > prevCallCountRef.current && status === online) {
      playRingtone();
    }
    prevCallCountRef.current = activeCalls.length;

    if (activeCalls.length > 0 && status === online) {
      startCallTimer();
      playRingtone();
    } else {
      clearCallTimer();
      stopRingtone();
    }
  }, [activeCalls, status]);

  const handleRejoin = () => {
    const active = loadDoctorRejoinSession();
    if (!active?.joinRoomUrl || !userData?.id || !token) {
      setRejoinData(null);
      toast.error("Call session has expired.");
      return;
    }
    joinGpCallAsDoctor({
      call: active.call,
      doctorId: userData.id,
      token,
      dispatch,
    })
      .then((result) => {
        setRejoinData(result.session);
        toast.success("Rejoining consultation…");
      })
      .catch((err) => toast.error(formatGpJoinError(err)));
  };

  const dismissRejoin = () => {
    clearDoctorRejoinSession();
    setRejoinData(null);
  };

  const answerCall = async (callId) => {
    stopRingtone();
    const call = activeCalls.find(
      (c) => String(c.callId) === String(callId),
    );
    if (!call || !userData?.id || !token) {
      navigate("/incoming-call", { state: { focusCallId: callId } });
      return;
    }

    setAnsweringCallId(callId);
    try {
      const result = await joinGpCallAsDoctor({
        call,
        doctorId: userData.id,
        token,
        dispatch,
      });
      setRejoinData(result.session);
      setPickedCalls((prev) => new Set([...prev, callId]));
      toast.success(
        result.usedSameTab
          ? "Call opened in this tab."
          : "Call opened in a new tab.",
      );
    } catch (error) {
      toast.error(formatGpJoinError(error));
      navigate("/incoming-call", { state: { focusCallId: callId } });
    } finally {
      setAnsweringCallId(null);
    }
  };

  const navigateToIncomingCalls = (callId) => {
    stopRingtone();
    navigate("/incoming-call", {
      state: callId != null ? { focusCallId: callId } : undefined,
    });
  };

  const playRingtone = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const startCallTimer = () => {
    clearCallTimer();
    const timer = setTimeout(() => {
      stopRingtone();
    }, 60000);
    setCallTimer(timer);
  };

  const clearCallTimer = () => {
    if (callTimer) {
      clearTimeout(callTimer);
      setCallTimer(null);
    }
  };

  useEffect(() => {
    if (!onAlertsChange) return;
    const hasIncoming = activeCalls.length > 0 && status === online;
    onAlertsChange({
      rejoinData: rejoinData?.doctorJoined ? rejoinData : null,
      activeCalls,
      hasIncoming,
      sseConnected,
      answeringCallId,
      onRejoin: handleRejoin,
      onDismissRejoin: dismissRejoin,
      onIncomingClick: answerCall,
      onViewAllCalls: () => navigateToIncomingCalls(),
    });
  }, [
    rejoinData,
    activeCalls,
    status,
    sseConnected,
    answeringCallId,
    onAlertsChange,
  ]);

  return <audio ref={audioRef} src={ringtone} preload="auto" loop className="hidden" />;
}

export default WelcomeBack;
