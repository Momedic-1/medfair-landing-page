import { useEffect, useRef, useState } from "react";
import { VideoView, useRoomConnection } from "@whereby.com/browser-sdk/react";
import micOn from "../assets/mic_on_image.png";
import micOff from "../assets/mic_off_image.png";
import videoOn from "../assets/video-camera_on.png";
import videoOff from "../assets/video-camera_off.png";
import note from "../assets/call_note.png";
import { MdCallEnd, MdSwapHoriz } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import AddNoteModal from "../pages/AddNote";
import { useSelector, useDispatch } from "react-redux";
import { setRoomUrl, setCall } from "../features/authSlice";
import ConsultationFeedbackModal from "./ConsultationFeedbackModal";
import { getStoredCallContext } from "../utils/videoCallDisplayInfo";
import { resolveVideoCallRoomUrl } from "../utils/videoCallRoomUrl";
import { useVideoCallHeader } from "../hooks/useVideoCallHeader";
import { dismissIncomingCallId } from "../utils/dismissedIncomingCalls";
import { clearPatientGpCall } from "../utils/patientGpCall";
import {
  clearDoctorRejoinSession,
  clearPatientGpVideoContext,
} from "../utils/activeCallSession";

function formatHeaderParticipantName(displayInfo) {
  if (!displayInfo) return "Loading...";
  if (displayInfo.displayName) return displayInfo.displayName;
  const full = [displayInfo.firstName, displayInfo.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || "Loading...";
}

function clearCallPersistence() {
  localStorage.removeItem("activeMeeting");
}

function clearCallPersistenceForRole(role) {
  if (role === "DOCTOR") {
    clearDoctorRejoinSession();
  } else {
    clearPatientGpVideoContext();
  }
}

function connectionLabel(connectionStatus, remoteCount) {
  if (remoteCount > 0) return "Connected";
  const status = String(connectionStatus || "").toLowerCase();
  if (!status || status === "ready" || status === "connecting") {
    return "Connecting…";
  }
  if (status.includes("knock") || status === "room_locked") {
    return "Waiting to be let in…";
  }
  if (status.includes("disconnect") || status.includes("left")) {
    return "Disconnected";
  }
  if (status.includes("error") || status.includes("fail")) {
    return "Connection issue";
  }
  if (status.includes("connect") || status === "connected" || status === "joined") {
    return "In room — waiting for the other person";
  }
  return "In room — waiting for the other person";
}

/** Shell: resolve room URL only — Whereby hooks run in VideoCallRoom. */
const VideoCall = () => {
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  });

  const location = useLocation();
  const roomUrlFromRedux = useSelector((state) => state.auth.roomUrl);
  const roomUrl = resolveVideoCallRoomUrl({
    search: location.search,
    reduxRoomUrl: roomUrlFromRedux,
  });

  const callFromRedux = useSelector((state) => state.auth.call);
  const call = callFromRedux || getStoredCallContext();

  if (!roomUrl) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-center text-gray-700 px-6">
          No meeting link found. Close this tab, return to your dashboard, and
          tap Rejoin.
        </p>
      </div>
    );
  }

  return (
    <VideoCallRoom
      roomUrl={roomUrl}
      userData={userData}
      call={call}
      callFromRedux={callFromRedux}
    />
  );
};

/** Whereby session — mounts only when roomUrl is valid. */
function VideoCallRoom({ roomUrl, userData, call, callFromRedux }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLocalVideoFullscreen, setIsLocalVideoFullscreen] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [joinError, setJoinError] = useState(null);

  const displayInfo = useVideoCallHeader(userData, call);
  const intentionalLeaveRef = useRef(false);
  const joinRoomRef = useRef(null);
  const leaveRoomRef = useRef(null);

  const roomConnection = useRoomConnection(roomUrl, {
    localMediaOptions: {
      audio: true,
      video: true,
    },
  });

  const actions = roomConnection?.actions;
  const state = roomConnection?.state;
  const localParticipant = state?.localParticipant;
  const remoteParticipants = state?.remoteParticipants ?? [];
  const connectionStatus =
    state?.connectionStatus ?? state?.connectionState ?? "";
  const joinRoom = actions?.joinRoom;
  const leaveRoomAction = actions?.leaveRoom;
  const toggleCamera = actions?.toggleCamera;
  const toggleMicrophone = actions?.toggleMicrophone;

  joinRoomRef.current = joinRoom ?? null;
  leaveRoomRef.current = leaveRoomAction ?? null;

  const otherPartyLabel =
    userData?.role === "DOCTOR" ? "the patient" : "the doctor";

  const finishLeaveAndRedirect = (redirectPath) => {
    const endedCallId =
      call?.callId ?? call?.id ?? call?.meetingId ?? null;
    if (endedCallId != null) {
      dismissIncomingCallId(endedCallId);
    }
    clearCallPersistence();
    clearCallPersistenceForRole(userData?.role);
    clearPatientGpCall();
    dispatch(setRoomUrl(null));
    dispatch(setCall(null));

    if (userData?.role === "PATIENT") {
      setPendingRedirect(redirectPath);
      setShowFeedbackModal(true);
      return;
    }
    navigate(redirectPath);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    if (pendingRedirect) {
      navigate(pendingRedirect);
      setPendingRedirect(null);
    }
  };

  useEffect(() => {
    if (callFromRedux || !call) return;
    dispatch(setCall(call));
  }, [call, callFromRedux, dispatch]);

  useEffect(() => {
    dispatch(setRoomUrl(roomUrl));
  }, [roomUrl, dispatch]);

  // Join once per roomUrl. Leave only on real unmount / room change — not on
  // transient action identity changes (which previously dropped live calls).
  useEffect(() => {
    intentionalLeaveRef.current = false;
    setJoinError(null);

    let cancelled = false;
    let didJoin = false;
    let attempts = 0;
    let retryId = null;

    const tryJoin = () => {
      const join = joinRoomRef.current;
      if (!join || cancelled || didJoin) return false;
      didJoin = true;
      Promise.resolve(join())
        .then(() => {
          if (!cancelled) setJoinError(null);
        })
        .catch((error) => {
          console.error("Could not join room", error);
          didJoin = false;
          if (!cancelled) {
            setJoinError(
              "Could not connect to the video room. Use Rejoin on your dashboard.",
            );
          }
        });
      return true;
    };

    if (!tryJoin()) {
      retryId = window.setInterval(() => {
        attempts += 1;
        if (cancelled || tryJoin() || attempts > 20) {
          window.clearInterval(retryId);
        }
      }, 250);
    }

    return () => {
      cancelled = true;
      if (retryId != null) window.clearInterval(retryId);
      // Skip leave when the user already ended the call intentionally.
      if (!intentionalLeaveRef.current) {
        leaveRoomRef.current?.();
      }
    };
  }, [roomUrl]);

  const leaveRoom = async () => {
    intentionalLeaveRef.current = true;
    try {
      if (isVideoOn && toggleCamera) {
        await toggleCamera();
        setIsVideoOn(false);
      }
      if (isAudioOn && toggleMicrophone) {
        await toggleMicrophone();
        setIsAudioOn(false);
      }

      await leaveRoomRef.current?.();

      if (localParticipant?.stream) {
        localParticipant.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      const redirectPath =
        userData?.role === "DOCTOR"
          ? "/doctor-dashboard"
          : "/patient-dashboard";
      finishLeaveAndRedirect(redirectPath);
    } catch (error) {
      console.error("Error leaving room:", error);
      const redirectPath =
        userData?.role === "DOCTOR"
          ? "/doctor-dashboard"
          : "/patient-dashboard";
      finishLeaveAndRedirect(redirectPath);
    }
  };

  const handleToggleAudio = () => {
    toggleMicrophone?.();
    setIsAudioOn((prev) => !prev);
  };

  const handleToggleVideo = () => {
    toggleCamera?.();
    setIsVideoOn((prev) => !prev);
  };

  const getDisplayName = (id) => {
    return remoteParticipants.find((p) => p.id === id)?.displayName || "Guest";
  };

  const feedbackCallId =
    call?.callId ?? call?.id ?? call?.meetingId ?? null;

  const statusText = connectionLabel(
    connectionStatus,
    remoteParticipants.length,
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-gradient-to-b from-blue-800 via-blue-950/40 to-white/50">
      <ConsultationFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleFeedbackClose}
        userData={userData}
        callId={feedbackCallId}
      />
      <div className="bg-black h-16 md:h-20 flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between text-white px-2 py-1 md:px-5 md:py-0 space-y-1 md:space-y-0">
        <p className="text-xs sm:text-sm md:text-base">
          <span className="font-bold">
            {displayInfo?.label ||
              (userData?.role === "DOCTOR" ? "Patient" : "Doctor")}
            :{" "}
          </span>
          {formatHeaderParticipantName(displayInfo)}
        </p>
        <p className="text-xs sm:text-sm text-gray-300">
          <span className="font-semibold text-white">Status: </span>
          {statusText}
        </p>
        {displayInfo?.showDob && (
          <p className="text-xs sm:text-sm md:text-base">
            <span className="font-bold">DOB: </span>
            {displayInfo.dob ?? "N/A"}
          </p>
        )}
        {displayInfo?.showAge && (
          <p className="text-xs sm:text-sm md:text-base">
            <span className="font-bold">Age: </span>
            {displayInfo.age ?? "N/A"}
          </p>
        )}
      </div>

      {joinError && (
        <div className="bg-amber-500 px-3 py-2 text-center text-sm font-medium text-black">
          {joinError}
        </div>
      )}

      <div className="relative flex-1 w-full">
        <div className="absolute inset-0">
          {isLocalVideoFullscreen ? (
            localParticipant?.stream ? (
              <VideoView
                muted
                stream={localParticipant.stream}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-900">
                <p className="px-4 text-center text-sm text-gray-300">
                  Connecting… Allow camera and microphone when prompted.
                </p>
              </div>
            )
          ) : (
            remoteParticipants.map((participant) => {
              if (!participant.stream) return null;
              return (
                <VideoView
                  key={participant.id}
                  stream={participant.stream}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              );
            })
          )}
          <p className="absolute bottom-4 right-6 font-bold text-white bg-black/50 px-3 py-1 rounded">
            {isLocalVideoFullscreen ? "You" : "Remote"}
          </p>
        </div>

        <div className="absolute top-2 right-2 z-10 w-[160px] h-[120px] sm:w-[200px] sm:h-[150px] md:w-[250px] md:h-[180px] lg:w-[300px] lg:h-[200px] rounded-xl overflow-hidden shadow-lg">
          {isLocalVideoFullscreen ? (
            remoteParticipants.length > 0 ? (
              remoteParticipants.map((participant) => {
                if (!participant.stream) return null;
                return (
                  <div key={participant.id} className="w-full h-full relative">
                    <VideoView
                      stream={participant.stream}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                    <p className="absolute top-2 left-2 font-bold text-white bg-black/50 px-2 py-1 rounded text-xs sm:text-sm">
                      {getDisplayName(participant.id)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full bg-gray-900/95 flex flex-col items-center justify-center gap-2 p-3 text-center">
                <p className="text-white text-xs sm:text-sm font-semibold leading-snug">
                  Waiting for {otherPartyLabel}…
                </p>
                <p className="text-gray-300 text-[10px] sm:text-xs leading-snug">
                  They should tap Join or Rejoin on their dashboard if they are
                  not here yet.
                </p>
              </div>
            )
          ) : (
            localParticipant?.stream && (
              <div className="w-full h-full relative">
                <VideoView
                  muted
                  stream={localParticipant.stream}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
                <p className="absolute top-2 left-2 font-bold text-white bg-black/50 px-2 py-1 rounded text-xs sm:text-sm">
                  You
                </p>
              </div>
            )
          )}
        </div>

        {remoteParticipants.length > 0 && (
          <button
            type="button"
            onClick={() => setIsLocalVideoFullscreen((prev) => !prev)}
            className="absolute top-2 left-2 z-20 bg-gray-800/70 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
            title="Switch view"
          >
            <MdSwapHoriz size={24} />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 w-full py-4 flex justify-center items-center gap-4 md:gap-8 bg-black/30">
        <button
          type="button"
          className={`rounded-full p-3 cursor-pointer ${
            isAudioOn ? "bg-gray-400" : "bg-red-500"
          } text-white`}
          onClick={handleToggleAudio}
        >
          <img src={isAudioOn ? micOn : micOff} alt="mic" height={25} width={25} />
        </button>

        <button
          type="button"
          className={`rounded-full p-3 cursor-pointer ${
            isVideoOn ? "bg-gray-400" : "bg-red-500"
          } text-white`}
          onClick={handleToggleVideo}
        >
          <img
            src={isVideoOn ? videoOn : videoOff}
            alt="video"
            height={25}
            width={25}
          />
        </button>

        {userData?.role === "DOCTOR" && (
          <button
            type="button"
            className="rounded-full p-3 bg-gray-400 cursor-pointer"
            onClick={() => setIsNoteModalOpen(true)}
          >
            <img src={note} alt="note" height={25} width={25} />
          </button>
        )}

        <button
          type="button"
          className="rounded-full p-3 bg-red-500 cursor-pointer"
          onClick={leaveRoom}
        >
          <MdCallEnd width={25} height={25} className="text-white" />
        </button>
      </div>

      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteAdded={() => setIsNoteModalOpen(false)}
      />
    </div>
  );
};

export default VideoCall;
