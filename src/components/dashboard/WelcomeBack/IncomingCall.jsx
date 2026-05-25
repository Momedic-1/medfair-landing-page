import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../../../env";
import { useNavigate } from "react-router-dom";
import { Hourglass } from "react-loader-spinner";
import { useDispatch } from "react-redux";
import { setCall, setRoomUrl } from "../../../features/authSlice";
import NoCalls from "../../../assets/NoCalls";
import { getToken } from "../../../utils";
import { openVideoCallPreferNewTab } from "../../../utils/videoCallNavigation";
import { useIncomingCallSse } from "../../../hooks/useIncomingCallSse";

const IncomingCall = () => {
  const [joiningCallId, setJoiningCallId] = useState(null);
  const [rejoinData, setRejoinData] = useState(null);
  const [pickedCalls, setPickedCalls] = useState([]);
  const token = getToken();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchRecentCalls = useCallback(async () => {
    const incomingResponse = await axios.get(
      `${baseUrl}/api/v1/video/recent-calls`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return incomingResponse?.data || [];
  }, [token]);

  const { calls: incomingCalls, sseConnected, ready } = useIncomingCallSse({
    doctorId: userData?.id,
    token,
    enabled: !!userData?.id && !!token,
    pickedCallIds: pickedCalls,
    fetchCalls: fetchRecentCalls,
  });

  const loadRejoinData = useCallback(() => {
    const rawActiveCall = localStorage.getItem("activeCall");
    if (!rawActiveCall) return;
    try {
      const parsed = JSON.parse(rawActiveCall);
      const now = Date.now();
      if (parsed?.expiresAt && now < parsed.expiresAt) {
        setRejoinData(parsed);
      } else {
        localStorage.removeItem("activeCall");
        setRejoinData(null);
      }
    } catch (_) {
      localStorage.removeItem("activeCall");
      setRejoinData(null);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pickedCalls")) || [];
    setPickedCalls(stored);
    loadRejoinData();
  }, [loadRejoinData]);

  const navigateToDashboard = () => {
    navigate("/doctor-dashboard");
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString();
  };

  const formatJoinError = (error) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return "Failed to join call. Please try again.";
  };

  const joinCall = async (call) => {
    const callId = call.callId;
    if (!callId || !userData?.id) {
      toast.error("Unable to join — please sign in again.");
      return;
    }
    setJoiningCallId(callId);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/video/join?callId=${callId}&doctorId=${userData?.id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { patientId, joinRoomUrl, patientFirstName, patientLastName } =
        response.data || {};

      if (joinRoomUrl) {
        const enrichedCall = {
          ...call,
          patientId: patientId ?? call.patientId,
          patientFirstName: patientFirstName ?? call.patientFirstName,
          patientLastName: patientLastName ?? call.patientLastName,
        };
        dispatch(setRoomUrl(joinRoomUrl));
        dispatch(setCall(enrichedCall));
        if (patientId != null) {
          localStorage.setItem("patientId", String(patientId));
        }
        const picked =
          JSON.parse(localStorage.getItem("pickedCalls")) || [];
        if (!picked.includes(callId)) {
          picked.push(callId);
          localStorage.setItem("pickedCalls", JSON.stringify(picked));
          setPickedCalls(picked);
        }

        try {
          const expiresAt = Date.now() + 40 * 60 * 1000;
          const activeCall = {
            call: enrichedCall,
            joinRoomUrl,
            patientId,
            patientFirstName: enrichedCall.patientFirstName,
            patientLastName: enrichedCall.patientLastName,
            expiresAt,
          };
          localStorage.setItem("activeCall", JSON.stringify(activeCall));
          setRejoinData(activeCall);
        } catch (_) {
          // ignore storage errors
        }

        const { usedSameTab } = openVideoCallPreferNewTab(joinRoomUrl);
        toast.success(
          usedSameTab
            ? "Call opened in this tab."
            : "Call opened in a new tab.",
        );
      } else {
        toast.error("Another doctor has already joined this call.");
      }
    } catch (error) {
      toast.error(formatJoinError(error));
    } finally {
      setJoiningCallId(null);
    }
  };

  const handleRejoin = () => {
    try {
      const raw = localStorage.getItem("activeCall");
      if (!raw) return;
      const active = JSON.parse(raw);
      const now = Date.now();
      if (active?.expiresAt && now >= active.expiresAt) {
        localStorage.removeItem("activeCall");
        setRejoinData(null);
        toast.error("Call session has expired.");
        return;
      }
      if (!active?.joinRoomUrl || !active?.call) return;
      if (active?.patientId) {
        localStorage.setItem("patientId", active.patientId);
      }
      dispatch(setRoomUrl(active.joinRoomUrl));
      dispatch(setCall(active.call));
      openVideoCallPreferNewTab(active.joinRoomUrl);
    } catch (_) {
      // fail silently
    }
  };

  const dismissRejoin = () => {
    localStorage.removeItem("activeCall");
    setRejoinData(null);
  };

  const remainingMinutes = (expiresAt) => {
    const diffMs = Math.max(0, (expiresAt || 0) - Date.now());
    return Math.ceil(diffMs / (60 * 1000));
  };

  const loading = !ready;

  return (
    <div className="w-full p-6">
      <ToastContainer />
      {sseConnected && (
        <p className="mb-3 text-xs font-medium text-emerald-700">
          Live updates on — new calls appear instantly
        </p>
      )}
      {rejoinData ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-sm md:text-base">
              You have an ongoing call with {rejoinData?.call?.patientFirstName}{" "}
              {rejoinData?.call?.patientLastName}.{" "}
              {remainingMinutes(rejoinData?.expiresAt)} min left to rejoin.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRejoin}
                className="bg-white text-blue-700 px-3 py-1 rounded"
              >
                Rejoin
              </button>
              <button
                type="button"
                onClick={dismissRejoin}
                className="bg-blue-500 text-white px-3 py-1 rounded border border-white/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {loading ? (
        <div className="w-full h-[60vh] flex justify-center items-center">
          <Hourglass
            visible={true}
            height="60"
            width="60"
            ariaLabel="hourglass-loading"
            colors={["#306cce", "#72a1ed"]}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {incomingCalls.length > 0 ? (
            incomingCalls.map((call) => (
              <div
                key={call.callId}
                className="w-full flex justify-between items-center border p-4 rounded lg:w-1/2"
              >
                <div>
                  <p className="font-bold">
                    Patient: {call.patientFirstName} {call.patientLastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Initiated at: {formatTime(call.callInitiationTime)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => joinCall(call)}
                  disabled={joiningCallId === call.callId}
                  className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joiningCallId === call.callId ? "Joining…" : "Join call"}
                </button>
              </div>
            ))
          ) : (
            <div className="w-full h-[80vh] flex flex-col justify-center items-center">
              <NoCalls />
              <p className="text-gray-950/60 text-lg">
                No incoming calls at the moment.
              </p>
              <button
                type="button"
                onClick={navigateToDashboard}
                className="w-[300px] h-[40px] bg-blue-600 rounded-lg text-lg text-white mt-10"
              >
                Return back to dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomingCall;
