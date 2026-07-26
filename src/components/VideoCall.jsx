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
import { getStoredCallContext, resolveVideoCallRole } from "../utils/videoCallDisplayInfo";
import { resolveVideoCallRoomUrl } from "../utils/videoCallRoomUrl";
import { useVideoCallHeader } from "../hooks/useVideoCallHeader";
import { dismissIncomingCallId } from "../utils/dismissedIncomingCalls";
import {
  loadPatientGpCall,
  savePatientGpCall,
} from "../utils/patientGpCall";
import {
  loadDoctorRejoinSession,
  loadPatientGpVideoContext,
  savePatientGpVideoContext,
} from "../utils/activeCallSession";
import { getToken } from "../utils";
import {
  clearAllGpCallPersistence,
  endGpConsultationByDoctor,
  fetchGpCallStatus,
  parseEndConsultationError,
} from "../utils/endGpConsultation";
import { peekStashedVideoCallId } from "../utils/videoCallNavigation";
import { toast } from "react-toastify";

function formatHeaderParticipantName(displayInfo) {
  if (!displayInfo) return "Loading...";
  if (displayInfo.displayName) return displayInfo.displayName;
  const full = [displayInfo.firstName, displayInfo.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || "Loading...";
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
  if (
    status.includes("connect") ||
    status === "connected" ||
    status === "joined"
  ) {
    return "In room — waiting for the other person";
  }
  return "In room — waiting for the other person";
}

function resolveCallId(call) {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("callId");
    if (fromQuery) return fromQuery;
  } catch {
    // ignore
  }

  return (
    call?.callId ??
    call?.id ??
    call?.meetingId ??
    peekStashedVideoCallId() ??
    loadPatientGpCall()?.callId ??
    loadPatientGpVideoContext()?.callId ??
    loadDoctorRejoinSession()?.call?.callId ??
    null
  );
}

/**
 * Reload the doctor dashboard after ending a call. A full navigation
 * reinitializes auth/dashboard providers that can otherwise remain blank
 * after the video tab clears its call-specific Redux state.
 */
function redirectToDoctorDashboard() {
  window.location.replace(`${window.location.origin}/doctor-dashboard`);
}

/** Persist patient rejoin markers. Never clears — Leave must not remove these. */
function ensurePatientRejoinPersistence(roomUrl, call) {
  const callId = resolveCallId(call);
  const expiresAt = Date.now() + 45 * 60 * 1000;
  const existing = loadPatientGpCall();
  const resolvedRoomUrl = roomUrl || existing?.roomUrl || null;

  if (resolvedRoomUrl) {
    try {
      localStorage.setItem(
        "activeMeeting",
        JSON.stringify({ roomUrl: resolvedRoomUrl, expiresAt, callId }),
      );
    } catch {
      // ignore
    }
  }

  if (callId != null) {
    savePatientGpCall({
      callId,
      roomUrl: resolvedRoomUrl,
      status: "IN_CALL",
      doctorName: existing?.doctorName || null,
      startedAt: existing?.startedAt,
    });
    const ctx = loadPatientGpVideoContext();
    savePatientGpVideoContext({
      callId,
      roomUrl: resolvedRoomUrl,
      doctorId: call?.doctorId ?? ctx?.doctorId,
      doctorFirstName: call?.doctorFirstName ?? ctx?.doctorFirstName,
      doctorLastName: call?.doctorLastName ?? ctx?.doctorLastName,
    });
  }
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
  const isDoctor = resolveVideoCallRole(userData) === "DOCTOR";

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLocalVideoFullscreen, setIsLocalVideoFullscreen] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  const [consultationEndedNotice, setConsultationEndedNotice] = useState(null);

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

  const otherPartyLabel = isDoctor ? "the patient" : "the doctor";
  const callId = resolveCallId(call);

  const detachLocalMedia = async () => {
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
        localParticipant.stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Error detaching media:", error);
    }
  };

  const handleFeedbackClose = () => {
    // Rating closed — rejoin markers must still be present.
    ensurePatientRejoinPersistence(roomUrl, call);
    setShowFeedbackModal(false);
    const target = pendingRedirect || "/patient-dashboard";
    setPendingRedirect(null);
    navigate(target);
  };

  /**
   * Patient Leave call — exit Whereby only. Keep Rejoin until doctor ends.
   * Rating is optional; it must not clear the active consultation.
   */
  const handlePatientLeave = async () => {
    intentionalLeaveRef.current = true;
    ensurePatientRejoinPersistence(roomUrl, call);
    await detachLocalMedia();
    dispatch(setRoomUrl(null));
    dispatch(setCall(null));
    // Persist again after media teardown in case anything raced.
    ensurePatientRejoinPersistence(roomUrl, call);
    toast.info("You left the call. Use Rejoin on your dashboard to return.");
    setPendingRedirect("/patient-dashboard");
    setShowFeedbackModal(true);
  };

  const confirmDoctorEndCall = async () => {
    if (isEnding) return;
    setIsEnding(true);
    intentionalLeaveRef.current = true;

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Please sign in again before ending the consultation.");
      }

      // Scheduled appointments: local leave only (no GP video_calls row).
      if (call?.slotId) {
        clearAllGpCallPersistence();
        if (callId != null) dismissIncomingCallId(callId);
        await detachLocalMedia();
        dispatch(setRoomUrl(null));
        dispatch(setCall(null));
        setShowEndConfirm(false);
        toast.success("You left the appointment call.");
        redirectToDoctorDashboard();
        return;
      }

      const resolvedCallId = resolveCallId(call);
      if (resolvedCallId == null) {
        throw new Error(
          "Missing call id — cannot end this consultation. Rejoin from your dashboard and try End call again.",
        );
      }

      // Must succeed against the backend before clearing doctor rejoin state.
      await endGpConsultationByDoctor({ callId: resolvedCallId, token });
      dismissIncomingCallId(resolvedCallId);
      await detachLocalMedia();
      dispatch(setRoomUrl(null));
      dispatch(setCall(null));
      setShowEndConfirm(false);
      toast.success("Consultation ended.");
      redirectToDoctorDashboard();
    } catch (error) {
      console.error("End consultation failed:", error);
      toast.error(parseEndConsultationError(error));
      // Keep doctor on the call page with rejoin session intact.
      setIsEnding(false);
      intentionalLeaveRef.current = false;
      setShowEndConfirm(true);
    }
  };

  /** Remote party ended — leave room and clear local rejoin. */
  const handleRemoteConsultationEnded = async (message) => {
    if (intentionalLeaveRef.current) return;
    intentionalLeaveRef.current = true;
    setConsultationEndedNotice(message);
    clearAllGpCallPersistence();
    if (callId != null) {
      dismissIncomingCallId(callId);
    }
    await detachLocalMedia();
    dispatch(setRoomUrl(null));
    dispatch(setCall(null));

    if (!isDoctor) {
      setPendingRedirect("/patient-dashboard");
      setShowFeedbackModal(true);
      toast.info(message);
      return;
    }
    toast.info(message);
    redirectToDoctorDashboard();
  };

  useEffect(() => {
    if (callFromRedux || !call) return;
    dispatch(setCall(call));
  }, [call, callFromRedux, dispatch]);

  useEffect(() => {
    dispatch(setRoomUrl(roomUrl));
  }, [roomUrl, dispatch]);

  // Keep patient rejoin markers fresh while they are in the room.
  useEffect(() => {
    if (isDoctor || !roomUrl) return undefined;
    ensurePatientRejoinPersistence(roomUrl, call);
    return undefined;
  }, [isDoctor, roomUrl, call]);

  // Poll backend so patient learns when doctor ends the consultation.
  useEffect(() => {
    if (!callId) return undefined;
    const token = getToken();
    if (!token) return undefined;

    let cancelled = false;
    const tick = async () => {
      const statusPayload = await fetchGpCallStatus(callId, token);
      if (cancelled || !statusPayload) return;
      if (statusPayload.status === "ENDED") {
        await handleRemoteConsultationEnded(
          isDoctor
            ? "This consultation has ended."
            : "The doctor ended the consultation.",
        );
      }
    };

    tick();
    const interval = window.setInterval(tick, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, isDoctor]);

  // Join once per roomUrl. Leave only on real unmount / room change.
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
      if (!intentionalLeaveRef.current) {
        // Accidental unmount / refresh: keep rejoin for both roles.
        if (!isDoctor) {
          ensurePatientRejoinPersistence(roomUrl, call);
        }
        leaveRoomRef.current?.();
      }
    };
  }, [roomUrl]);

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

  const feedbackCallId = callId;
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
            {displayInfo?.label || (isDoctor ? "Patient" : "Doctor")}:{" "}
          </span>
          {formatHeaderParticipantName(displayInfo)}
        </p>
        <p className="text-xs sm:text-sm text-gray-300">
          <span className="font-semibold text-white">Status: </span>
          {consultationEndedNotice || statusText}
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

      <div className="absolute bottom-0 w-full py-4 flex flex-col items-center gap-2 bg-black/30">
        <div className="flex justify-center items-center gap-4 md:gap-8">
          <button
            type="button"
            className={`rounded-full p-3 cursor-pointer ${
              isAudioOn ? "bg-gray-400" : "bg-red-500"
            } text-white`}
            onClick={handleToggleAudio}
            aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
          >
            <img
              src={isAudioOn ? micOn : micOff}
              alt="mic"
              height={25}
              width={25}
            />
          </button>

          <button
            type="button"
            className={`rounded-full p-3 cursor-pointer ${
              isVideoOn ? "bg-gray-400" : "bg-red-500"
            } text-white`}
            onClick={handleToggleVideo}
            aria-label={isVideoOn ? "Turn camera off" : "Turn camera on"}
          >
            <img
              src={isVideoOn ? videoOn : videoOff}
              alt="video"
              height={25}
              width={25}
            />
          </button>

          {isDoctor && (
            <button
              type="button"
              className="rounded-full p-3 bg-gray-400 cursor-pointer"
              onClick={() => setIsNoteModalOpen(true)}
              aria-label="Add clinical note"
            >
              <img src={note} alt="note" height={25} width={25} />
            </button>
          )}

          <button
            type="button"
            className="rounded-full p-3 bg-red-500 cursor-pointer disabled:opacity-60"
            onClick={
              isDoctor ? () => setShowEndConfirm(true) : handlePatientLeave
            }
            disabled={isEnding}
            aria-label={isDoctor ? "End call" : "Leave call"}
            title={isDoctor ? "End call" : "Leave call"}
          >
            <MdCallEnd width={25} height={25} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-white/90 font-medium">
          {isDoctor
            ? isEnding
              ? "Ending consultation…"
              : "End call"
            : "Leave call"}
        </p>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#020e7c]">End consultation?</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              This will permanently end the call for you and the patient. The
              patient will not be able to rejoin, and they will be able to start
              a new call afterward.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Finish any clinical notes before ending if you still need them.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowEndConfirm(false)}
                disabled={isEnding}
              >
                Cancel — stay on call
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                onClick={confirmDoctorEndCall}
                disabled={isEnding}
              >
                {isEnding ? "Ending…" : "Yes, end consultation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteAdded={() => setIsNoteModalOpen(false)}
      />
    </div>
  );
}

export default VideoCall;
