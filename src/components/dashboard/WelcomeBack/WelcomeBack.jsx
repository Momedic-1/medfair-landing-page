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
import { loadPickedCallIds } from "../../../utils/pickedCalls";
import {
  ensureDoctorPushSubscription,
  showIncomingCallNotification,
} from "../../../utils/doctorPushNotifications";
import { getToken } from "../../../utils";

function WelcomeBack({ status, onAlertsChange }) {
  const [pickedCalls, setPickedCalls] = useState(new Set());
  const [callTimer, setCallTimer] = useState(null);
  const [rejoinData, setRejoinData] = useState(null);
  const [answeringCallId, setAnsweringCallId] = useState(null);
  const token = getToken();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const online = "Online";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const prevCallCountRef = useRef(0);
  const notifiedCallIdsRef = useRef(new Set());
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
    setPickedCalls(new Set(loadPickedCallIds()));
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
    if (!userData?.id || !token || status !== online) return;
    ensureDoctorPushSubscription(token).catch(() => {});
  }, [userData?.id, token, status]);

  useEffect(() => {
    if (activeCalls.length > prevCallCountRef.current && status === online) {
      playRingtone();
    }

    if (status === online && activeCalls.length > 0) {
      activeCalls.forEach((call) => {
        const callId = String(call?.callId ?? "");
        if (!callId || notifiedCallIdsRef.current.has(callId)) return;
        notifiedCallIdsRef.current.add(callId);
        const patientName =
          `${call?.patientFirstName || ""} ${call?.patientLastName || ""}`.trim() || "A patient";
        showIncomingCallNotification({
          title: "Incoming patient call",
          body: `${patientName} is calling now.`,
          url: "/incoming-call",
          callId,
        }).catch(() => {});
      });
    }

    const liveIds = new Set(activeCalls.map((c) => String(c?.callId ?? "")));
    notifiedCallIdsRef.current.forEach((id) => {
      if (!liveIds.has(id)) notifiedCallIdsRef.current.delete(id);
    });

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
      setPickedCalls(new Set(loadPickedCallIds()));
      toast.success(
        result.usedSameTab
          ? "You are in the call. The patient will join after they tap Join call."
          : "Call opened in a new tab. The patient joins after they tap Join call. Use Rejoin if you disconnect.",
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
      state: {
        focusCallId: callId ?? null,
        initialCalls: activeCalls,
      },
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
      onViewAllCalls: navigateToIncomingCalls,
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
