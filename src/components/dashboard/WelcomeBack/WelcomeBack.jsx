import "./WelcomeBack.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { baseUrl } from "../../../env";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCall, setRoomUrl } from "../../../features/authSlice";
import { openVideoCallInNewTab } from "../../../utils/videoCallNavigation";
import { useIncomingCallSse } from "../../../hooks/useIncomingCallSse";

function WelcomeBack({ status, onAlertsChange }) {
  const [pickedCalls, setPickedCalls] = useState(new Set());
  const [callTimer, setCallTimer] = useState(null);
  const [rejoinData, setRejoinData] = useState(null);
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const userData = JSON.parse(localStorage.getItem("userData"));
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
      { headers: { Authorization: `Bearer ${token}` } }
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

    const rawActiveCall = localStorage.getItem("activeCall");
    if (rawActiveCall) {
      try {
        const parsed = JSON.parse(rawActiveCall);
        const now = Date.now();
        if (parsed?.expiresAt && now < parsed.expiresAt) {
          setRejoinData(parsed);
        } else {
          localStorage.removeItem("activeCall");
        }
      } catch (_) {
        localStorage.removeItem("activeCall");
      }
    }

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
      if (activeCalls.length > 0) playRingtone();
    } else {
      clearCallTimer();
      stopRingtone();
    }
  }, [activeCalls, status]);

  const handleRejoin = () => {
    try {
      const raw = localStorage.getItem("activeCall");
      if (!raw) return;
      const active = JSON.parse(raw);
      const now = Date.now();
      if (active?.expiresAt && now >= active.expiresAt) {
        localStorage.removeItem("activeCall");
        setRejoinData(null);
        return;
      }
      if (active?.patientId) {
        localStorage.setItem("patientId", active.patientId);
      }
      if (active?.joinRoomUrl) dispatch(setRoomUrl(active.joinRoomUrl));
      if (active?.call) dispatch(setCall(active.call));
      openVideoCallInNewTab(active.joinRoomUrl);
    } catch (_) {
      // fail silently
    }
  };

  const dismissRejoin = () => {
    localStorage.removeItem("activeCall");
    setRejoinData(null);
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

  const navigateToIncomingCalls = () => {
    stopRingtone();
    navigate("/incoming-call");
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
      rejoinData,
      activeCalls,
      hasIncoming,
      sseConnected,
      onRejoin: handleRejoin,
      onDismissRejoin: dismissRejoin,
      onIncomingClick: navigateToIncomingCalls,
    });
  }, [rejoinData, activeCalls, status, sseConnected, onAlertsChange]);

  return <audio ref={audioRef} src={ringtone} preload="auto" loop className="hidden" />;
}

export default WelcomeBack;
