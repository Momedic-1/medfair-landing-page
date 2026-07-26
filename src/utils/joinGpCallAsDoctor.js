import axios from "axios";
import { baseUrl } from "../env";
import { setCall, setRoomUrl } from "../features/authSlice";
import { openVideoCallPreferNewTab } from "./videoCallNavigation";
import { dismissIncomingCallId } from "./dismissedIncomingCalls";
import { saveDoctorJoinedSession } from "./activeCallSession";
import { rememberPickedCallId } from "./pickedCalls";

export function formatGpJoinError(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return "Failed to join call. Please try again.";
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
