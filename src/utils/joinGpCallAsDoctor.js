import axios from "axios";
import { baseUrl } from "../env";
import { setCall, setRoomUrl } from "../features/authSlice";
import { openVideoCallPreferNewTab } from "./videoCallNavigation";
import { dismissIncomingCallId } from "./dismissedIncomingCalls";
import { saveDoctorJoinedSession } from "./activeCallSession";
import { rememberPickedCallId } from "./pickedCalls";

function pickErrorText(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  if (error?.message) return String(error.message);
  return "";
}

export function formatGpJoinError(error) {
  const status = error?.response?.status;
  const raw = pickErrorText(error);
  const lower = raw.toLowerCase();

  if (
    status === 409 ||
    lower.includes("already assigned") ||
    lower.includes("another doctor") ||
    lower.includes("already joined")
  ) {
    if (lower.includes("inactive")) {
      return "This call is no longer active.";
    }
    return (
      raw ||
      "Another doctor has already joined this call. Refresh the incoming list and pick a different one."
    );
  }

  if (lower.includes("inactive")) {
    return "This call is no longer active.";
  }

  if (
    status === 503 ||
    status === 504 ||
    /connection is not available|hikari|timed? ?out|could not get a resource/i.test(lower)
  ) {
    return "Could not join right now — the server is busy. Wait a few seconds and try again.";
  }

  if (status >= 500) {
    return raw || "Could not join the call. Please try again in a moment.";
  }

  return raw || "Failed to join call. Please try again.";
}

/**
 * Doctor joins a GP instant call — opens video and persists rejoin session.
 */
export async function joinGpCallAsDoctor({
  call,
  doctorId,
  token,
  dispatch,
}) {
  const callId = call?.callId;
  if (!callId || !doctorId || !token) {
    throw new Error("Missing call or sign-in details.");
  }

  const response = await axios.post(
    `${baseUrl}/api/v1/video/join?callId=${callId}&doctorId=${doctorId}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const { patientId, joinRoomUrl, patientFirstName, patientLastName } =
    response.data || {};

  if (!joinRoomUrl) {
    throw new Error("Another doctor has already joined this call.");
  }

  const enrichedCall = {
    ...call,
    callId,
    patientId: patientId ?? call.patientId,
    patientFirstName: patientFirstName ?? call.patientFirstName,
    patientLastName: patientLastName ?? call.patientLastName,
  };

  dispatch(setRoomUrl(joinRoomUrl));
  dispatch(setCall(enrichedCall));

  if (patientId != null) {
    localStorage.setItem("patientId", String(patientId));
  }

  rememberPickedCallId(callId);
  dismissIncomingCallId(callId);

  const session = saveDoctorJoinedSession({
    call: enrichedCall,
    joinRoomUrl,
    patientId,
    patientFirstName: enrichedCall.patientFirstName,
    patientLastName: enrichedCall.patientLastName,
  });

  const { usedSameTab } = openVideoCallPreferNewTab(joinRoomUrl, callId);

  return { enrichedCall, session, usedSameTab, joinRoomUrl };
}
