import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../../../env";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import NoCalls from "../../../assets/NoCalls";
import { getToken } from "../../../utils";
import {
  useIncomingCallSse,
  INCOMING_PAGE_POLL_MS,
} from "../../../hooks/useIncomingCallSse";
import {
  clearDoctorRejoinSession,
  loadDoctorRejoinSession,
  remainingRejoinMinutes,
} from "../../../utils/activeCallSession";
import {
  formatGpJoinError,
  joinGpCallAsDoctor,
} from "../../../utils/joinGpCallAsDoctor";
import { loadPickedCallIds } from "../../../utils/pickedCalls";
import {
  clearAllGpCallPersistence,
  fetchGpCallStatus,
} from "../../../utils/endGpConsultation";
import { Phone, RefreshCw, Video } from "lucide-react";

const IncomingCall = () => {
  const [joiningCallId, setJoiningCallId] = useState(null);
  const [rejoinData, setRejoinData] = useState(null);
  const [pickedCalls, setPickedCalls] = useState([]);
  const token = getToken();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const focusCallId = location.state?.focusCallId ?? null;
  const cardRefs = useRef({});

  const fetchBroadcastCalls = useCallback(async () => {
    if (!userData?.id || !token) return [];
    const response = await axios.get(
      `${baseUrl}/api/v1/video/broadcast-calls/${userData.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response?.data || [];
  }, [token, userData?.id]);

  const {
    calls: incomingCalls,
    setCalls,
    sseConnected,
    initialLoading,
    loadError,
    refreshCalls,
  } = useIncomingCallSse({
    doctorId: userData?.id,
    token,
    enabled: !!userData?.id && !!token,
    pickedCallIds: pickedCalls,
    fetchCalls: fetchBroadcastCalls,
    pollIntervalMs: INCOMING_PAGE_POLL_MS,
    fastRetry: true,
  });

  useEffect(() => {
    setPickedCalls(loadPickedCallIds());
    setRejoinData(loadDoctorRejoinSession());
  }, []);

  useEffect(() => {
    const seeded = location.state?.initialCalls;
    if (!Array.isArray(seeded) || seeded.length === 0) return;
    setCalls((prev) => (prev?.length ? prev : seeded));
  }, [location.state, setCalls]);

  useEffect(() => {
    if (!focusCallId || incomingCalls.length === 0) return;
    const el = cardRefs.current[focusCallId];
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [focusCallId, incomingCalls]);

  const navigateToDashboard = () => navigate("/doctor-dashboard");

  const formatTime = (time) => {
    if (!time) return "Just now";
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const waitLabel = (time) => {
    if (!time) return "Waiting";
    const mins = Math.max(
      0,
      Math.floor((Date.now() - new Date(time).getTime()) / 60000),
    );
    if (mins < 1) return "Waiting · under 1 min";
    return `Waiting · ${mins} min`;
  };

  const joinCall = async (call) => {
    const callId = call?.callId;
    if (!callId || !userData?.id) {
      toast.error("Unable to join. Please sign in again.");
      return;
    }
    setJoiningCallId(callId);
    try {
      const result = await joinGpCallAsDoctor({
        call,
        doctorId: userData.id,
        token,
        dispatch,
      });
      setRejoinData(result.session);
      setPickedCalls(loadPickedCallIds());
      toast.success(
        result.usedSameTab
          ? "You are in the call. The patient will join after they tap Join call."
          : "Call opened in a new tab. The patient joins after they tap Join call. Use Rejoin if you disconnect.",
      );
    } catch (error) {
      toast.error(formatGpJoinError(error));
    } finally {
      setJoiningCallId(null);
    }
  };

  const handleRejoin = async () => {
    const active = loadDoctorRejoinSession();
    if (!active?.joinRoomUrl) {
      setRejoinData(null);
      toast.error("Call session has expired.");
      return;
    }
    const callId = active?.call?.callId ?? active?.call?.id ?? null;
    if (callId != null && token) {
      const statusPayload = await fetchGpCallStatus(callId, token);
      if (statusPayload?.status === "ENDED") {
        clearAllGpCallPersistence();
        setRejoinData(null);
        toast.info("This consultation has already ended.");
        return;
      }
    }
    setRejoinData(active);
    joinGpCallAsDoctor({
      call: active.call,
      doctorId: userData?.id,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ToastContainer position="top-center" />

      {rejoinData?.doctorJoined && (
        <div className="sticky top-0 z-50 border-b border-blue-800 bg-[#020e7c] text-white shadow-md">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm sm:text-base">
              <span className="font-semibold">Active consultation</span>
              <span className="opacity-90">
                {" "}
                · {rejoinData.call?.patientFirstName}{" "}
                {rejoinData.call?.patientLastName}
                {" · "}
                {remainingRejoinMinutes(rejoinData.expiresAt)} min left to rejoin
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={handleRejoin}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#020e7c] hover:bg-blue-50"
              >
                <Video className="h-4 w-4" aria-hidden />
                Rejoin call
              </button>
              <button
                type="button"
                onClick={dismissRejoin}
                className="rounded-lg border border-white/40 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                End session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#020e7c] sm:text-3xl">
            Incoming GP calls
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Patients waiting for a general practitioner. Join opens the video call
            in a new tab.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sseConnected ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                Live updates on
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                Connecting live feed…
              </span>
            )}
            <button
              type="button"
              onClick={() => refreshCalls()}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Refresh
            </button>
          </div>
        </header>

        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {loadError}
          </div>
        )}

        {initialLoading && incomingCalls.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm"
              />
            ))}
            <p className="text-center text-sm text-gray-500">Loading waiting patients…</p>
          </div>
        ) : incomingCalls.length > 0 ? (
          <ul className="space-y-4">
            {incomingCalls.map((call) => {
              const isFocus =
                focusCallId != null &&
                String(call.callId) === String(focusCallId);
              const isJoining = joiningCallId === call.callId;
              return (
                <li
                  key={call.callId}
                  ref={(el) => {
                    cardRefs.current[call.callId] = el;
                  }}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                    isFocus
                      ? "border-[#020e7c] ring-2 ring-[#020e7c]/20"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-[#020e7c]">
                        {(call.patientFirstName?.[0] || "P").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {call.patientFirstName} {call.patientLastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {waitLabel(call.callInitiationTime)} · started{" "}
                          {formatTime(call.callInitiationTime)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => joinCall(call)}
                      disabled={!!joiningCallId}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
                    >
                      <Phone className="h-5 w-5" aria-hidden />
                      {isJoining ? "Joining…" : "Join call"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <NoCalls />
            <p className="mt-4 text-lg font-medium text-gray-800">
              No patients waiting right now
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              New calls appear here automatically when you are online. You can stay
              on this page or return to your dashboard.
            </p>
            <button
              type="button"
              onClick={navigateToDashboard}
              className="mt-8 rounded-xl bg-[#020e7c] px-8 py-3 text-base font-semibold text-white hover:bg-blue-800"
            >
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingCall;
