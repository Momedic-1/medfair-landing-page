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
import {
  getStoredCallContext,
  getStoredPatientId,
  resolveVideoCallRole,
} from "../utils/videoCallDisplayInfo";
import {
  parseCallIdFromSearch,
  resolveVideoCallRoomUrl,
  normalizeWherebyRoomUrl,
} from "../utils/videoCallRoomUrl";
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
import {
  loadRoomUrlForCall,
  peekStashedVideoCallId,
} from "../utils/videoCallNavigation";
import { toast } from "react-toastify";

const JOIN_MAX_ATTEMPTS = 8;
const JOIN_RETRY_MS = 1200;

function isRoomConnected(connectionStatus) {
  const status = String(connectionStatus || "").toLowerCase();
  return (
    status.includes("connected") ||
    status === "joined" ||
    status === "connect"
  );
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

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
  const callId = resolveCallId(call) ?? loadPatientGpCall()?.callId ?? null;
  const expiresAt = Date.now() + 30 * 60 * 1000;
  const existing = loadPatientGpCall();
  const resolvedRoomUrl = roomUrl || existing?.roomUrl || null;

  // Without a callId the dashboard cannot verify ENDED — do not write a stale banner.
  if (callId == null || !resolvedRoomUrl) return;

  try {
    localStorage.setItem(
      "activeMeeting",
      JSON.stringify({
        roomUrl: resolvedRoomUrl,
        expiresAt,
        callId: String(callId),
      }),
    );
  } catch {
    // ignore
  }

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
  const callFromRedux = useSelector((state) => state.auth.call);
  const call = callFromRedux || getStoredCallContext();

  const initialRoomUrl = resolveVideoCallRoomUrl({
    search: location.search,
    reduxRoomUrl: roomUrlFromRedux,
  });
  const queryCallId =
    parseCallIdFromSearch(location.search) || peekStashedVideoCallId();

  const [roomUrl, setRoomUrlState] = useState(initialRoomUrl);
  const [resolvingRoom, setResolvingRoom] = useState(Boolean(queryCallId));

  // Canonical room URL: API by callId first, then local stash, then query/storage.
  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    const callId = queryCallId;

    const resolve = async () => {
      let next =
        normalizeWherebyRoomUrl(initialRoomUrl) ||
        normalizeWherebyRoomUrl(loadRoomUrlForCall(callId));

      if (callId && token) {
        const statusPayload = await fetchGpCallStatus(callId, token);
        if (cancelled) return;
        if (statusPayload?.roomUrl) {
          next = normalizeWherebyRoomUrl(statusPayload.roomUrl);
        }
      }

      if (!cancelled) {
        setRoomUrlState(next);
        setResolvingRoom(false);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, queryCallId]);

  if (resolvingRoom) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-center text-gray-700 px-6">Connecting to your consultation…</p>
      </div>
    );
  }

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
  const [isJoiningRoom, setIsJoiningRoom] = useState(true);
  const [joinAttempt, setJoinAttempt] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [consultationEndedNotice, setConsultationEndedNotice] = useState(null);

  const displayInfo = useVideoCallHeader(userData, call);
  const consultationPatientId =
    call?.patientId ?? getStoredPatientId() ?? null;
  const intentionalLeaveRef = useRef(false);
  const joinRoomRef = useRef(null);
  const leaveRoomRef = useRef(null);
  const joinGenerationRef = useRef(0);

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

  // Join with automatic retries. First attempt often fails before Whereby is ready;
  // Rejoin worked because it remounted — we now retry in-place instead.
  useEffect(() => {
    intentionalLeaveRef.current = false;
    setJoinError(null);
    setIsJoiningRoom(true);
    setJoinAttempt(0);

    const generation = ++joinGenerationRef.current;
    let cancelled = false;

    const waitForJoinFn = async () => {
      for (let i = 0; i < 40; i += 1) {
        if (cancelled || generation !== joinGenerationRef.current) return null;
        const join = joinRoomRef.current;
        if (typeof join === "function") return join;
        await delay(250);
      }
      return null;
    };

    const run = async () => {
      const join = await waitForJoinFn();
      if (!join || cancelled || generation !== joinGenerationRef.current) {
        if (!cancelled && generation === joinGenerationRef.current) {
          setIsJoiningRoom(false);
          setJoinError(
            "Could not start the video room. Tap Retry connection.",
          );
        }
        return;
      }

      for (let attempt = 1; attempt <= JOIN_MAX_ATTEMPTS; attempt += 1) {
        if (cancelled || generation !== joinGenerationRef.current) return;
        setJoinAttempt(attempt);
        setIsJoiningRoom(true);
        setJoinError(null);

        try {
          await Promise.resolve(joinRoomRef.current?.());
          if (cancelled || generation !== joinGenerationRef.current) return;
          // Give Whereby a moment to flip connection status after join().
          await delay(800);
          if (cancelled || generation !== joinGenerationRef.current) return;
          setIsJoiningRoom(false);
          setJoinError(null);
          return;
        } catch (error) {
          console.error(`Whereby join attempt ${attempt} failed`, error);
          if (cancelled || generation !== joinGenerationRef.current) return;
          if (attempt < JOIN_MAX_ATTEMPTS) {
            await delay(JOIN_RETRY_MS);
            continue;
          }
          setIsJoiningRoom(false);
          setJoinError(
            "Could not connect to the video room. Tap Retry connection, or Rejoin from your dashboard.",
          );
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (!intentionalLeaveRef.current) {
        if (!isDoctor) {
          ensurePatientRejoinPersistence(roomUrl, call);
        }
        leaveRoomRef.current?.();
      }
    };
  }, [roomUrl]);

  // If join() resolved but SDK later reports connected, clear transient errors.
  useEffect(() => {
    if (isRoomConnected(connectionStatus) || remoteParticipants.length > 0) {
      setIsJoiningRoom(false);
      setJoinError(null);
    }
  }, [connectionStatus, remoteParticipants.length]);

  const handleRetryJoin = () => {
    setJoinError(null);
    setIsJoiningRoom(true);
    // Remount join cycle by nudging roomUrl dependency via generation bump + re-run.
    joinGenerationRef.current += 1;
    const join = joinRoomRef.current;
    if (typeof join !== "function") {
      setJoinError("Video room is not ready yet. Wait a moment and try again.");
      setIsJoiningRoom(false);
      return;
    }
    (async () => {
      const generation = joinGenerationRef.current;
      for (let attempt = 1; attempt <= JOIN_MAX_ATTEMPTS; attempt += 1) {
        if (generation !== joinGenerationRef.current) return;
        setJoinAttempt(attempt);
        setIsJoiningRoom(true);
        try {
          await Promise.resolve(joinRoomRef.current?.());
          await delay(800);
          if (generation !== joinGenerationRef.current) return;
          setIsJoiningRoom(false);
          setJoinError(null);
          return;
        } catch (error) {
          console.error(`Whereby retry attempt ${attempt} failed`, error);
          if (attempt < JOIN_MAX_ATTEMPTS) {
            await delay(JOIN_RETRY_MS);
            continue;
          }
          setIsJoiningRoom(false);
          setJoinError(
            "Could not connect to the video room. Tap Retry connection again, or Rejoin from your dashboard.",
          );
        }
      }
    })();
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

  const feedbackCallId = callId;
  const roomConnected =
    isRoomConnected(connectionStatus) || remoteParticipants.length > 0;
  const statusText = joinError
    ? "Connection issue"
    : isJoiningRoom && !roomConnected
      ? "Connecting…"
      : connectionLabel(connectionStatus, remoteParticipants.length);

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

      {(joinError || isJoiningRoom) && (
        <div
          className={`px-3 py-2 text-center text-sm font-medium ${
            joinError
              ? "bg-amber-500 text-black"
              : "bg-blue-600 text-white"
          }`}
        >
          {joinError ? (
            <span className="inline-flex flex-wrap items-center justify-center gap-2">
              <span>{joinError}</span>
              <button
                type="button"
                onClick={handleRetryJoin}
                className="rounded-md bg-black/80 px-3 py-1 text-xs font-semibold text-white hover:bg-black"
              >
                Retry connection
              </button>
            </span>
          ) : (
            `Connecting to video room… (attempt ${Math.max(joinAttempt, 1)} of ${JOIN_MAX_ATTEMPTS})`
          )}
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
                {joinError ? (
                  <>
                    <p className="text-amber-200 text-xs sm:text-sm font-semibold leading-snug">
                      You are not in the video room yet
                    </p>
                    <p className="text-gray-300 text-[10px] sm:text-xs leading-snug">
                      Tap Retry connection above. Rejoin from your dashboard if
                      it still fails.
                    </p>
                  </>
                ) : isJoiningRoom || !isRoomConnected(connectionStatus) ? (
                  <>
                    <p className="text-white text-xs sm:text-sm font-semibold leading-snug">
                      Connecting to the consultation…
                    </p>
                    <p className="text-gray-300 text-[10px] sm:text-xs leading-snug">
                      Please wait — we automatically retry if the first attempt
                      fails.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white text-xs sm:text-sm font-semibold leading-snug">
                      Waiting for {otherPartyLabel}…
                    </p>
                    <p className="text-gray-300 text-[10px] sm:text-xs leading-snug">
                      They should tap Join or Rejoin on their dashboard if they
                      are not here yet.
                    </p>
                  </>
                )}
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
        patientId={consultationPatientId}
      />
    </div>
  );
}

export default VideoCall;
