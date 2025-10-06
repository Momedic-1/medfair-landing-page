import { useState, useEffect, useRef } from "react";
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

const IncomingCall = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejoinData, setRejoinData] = useState(null);
  const token = getToken();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const incomingCallsRef = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize potential rejoin state from localStorage and auto-expire after 40 minutes
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

    const fetchIncomingCalls = async () => {
      try {
        const incomingResponse = await axios.get(
          `${baseUrl}/api/v1/video/recent-calls`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(incomingResponse?.data, " incomingResponse here");
        let incomingCallsData = incomingResponse?.data || [];
        setIncomingCalls(incomingResponse?.data || []);
        const pickedCalls =
          JSON.parse(localStorage.getItem("pickedCalls")) || [];
        incomingCallsData = incomingCallsData.filter(
          (call) => !pickedCalls.includes(call.callId)
        );

        incomingCallsRef.current = incomingCallsData;
        // setIncomingCalls(incomingCallsData);
      } catch (error) {
        // console.error(error?.response?.data, " response here");
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingCalls();
  }, [userData?.id]);

  const navigateToDashboard = () => {
    navigate("/doctor-dashboard");
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString();
  };

  const joinCall = async (call) => {
    const callId = call.callId;
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
      const { patientId, joinRoomUrl } = response.data;

      if (joinRoomUrl) {
        dispatch(setRoomUrl(joinRoomUrl));
        dispatch(setCall(call));
        localStorage.setItem("patientId", patientId);
        const pickedCalls =
          JSON.parse(localStorage.getItem("pickedCalls")) || [];
        pickedCalls.push(callId);
        localStorage.setItem("pickedCalls", JSON.stringify(pickedCalls));

        // Persist active call for potential rejoin within 40 minutes
        try {
          // Meeting duration counts from when the doctor joins, not initiation time
          const expiresAt = Date.now() + 40 * 60 * 1000;
          const activeCall = {
            call,
            joinRoomUrl,
            patientId,
            expiresAt,
          };
          localStorage.setItem("activeCall", JSON.stringify(activeCall));
          setRejoinData(activeCall);
        } catch (_) {
          // ignore storage errors
        }

        setIncomingCalls(
          incomingCalls.filter((call) => call.callId !== callId)
        );

        navigate("/video-call");
      } else {
        toast.error("Another doctor has already joined this call.");
      }
    } catch (error) {
      // console.error(error?.response?.data, " response here");
      toast.error(error?.response?.data);
    }
  };

  const handleRejoin = () => {
    try {
      const raw = localStorage.getItem("activeCall");
      if (!raw) return;
      const active = JSON.parse(raw);
      if (!active?.joinRoomUrl || !active?.call) return;
      const now = Date.now();
      if (active?.expiresAt && now >= active.expiresAt) {
        localStorage.removeItem("activeCall");
        setRejoinData(null);
        toast.error("Call session has expired.");
        return;
      }
      if (active?.patientId) {
        localStorage.setItem("patientId", active.patientId);
      }
      dispatch(setRoomUrl(active.joinRoomUrl));
      dispatch(setCall(active.call));
      navigate("/video-call");
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

  return (
    <div className="w-full p-6">
      <ToastContainer />
      {rejoinData ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-sm md:text-base">
              You have an ongoing call with {rejoinData?.call?.patientFirstName} {rejoinData?.call?.patientLastName}. {remainingMinutes(rejoinData?.expiresAt)} min left to rejoin.
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRejoin} className="bg-white text-blue-700 px-3 py-1 rounded">
                Rejoin
              </button>
              <button onClick={dismissRejoin} className="bg-blue-500 text-white px-3 py-1 rounded border border-white/30">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* <h1 className='text-2xl font-bold text-[#020e7c] mb-4'>Incoming Calls</h1> */}
      {loading ? (
        <div className="w-full h-[60vh] flex justify-center items-center">
          <Hourglass
            visible={true}
            height="60"
            width="60"
            ariaLabel="hourglass-loading"
            wrapperStyle={{}}
            wrapperClass=""
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
                  onClick={() => joinCall(call)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Join Call
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
