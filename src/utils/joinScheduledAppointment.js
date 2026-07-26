import axios from "axios";
import { baseUrl } from "../env";
import { openVideoCallPreferNewTab } from "./videoCallNavigation";

export function parseJoinError(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return "Failed to join call. Please try again.";
}

/**
 * Join a scheduled (booked) appointment video call — same flow for patient and doctor.
 */
export async function joinScheduledAppointment({
  slotId,
  userId,
  token,
  call,
  patientIdForStorage,
}) {
  if (!slotId || !userId || !token) {
    throw new Error("Missing required information to join this call.");
  }

  const postUrl = `${baseUrl}/api/appointment/meetings/${slotId}/users/${userId}/join`;
  const postResponse = await axios.post(
    postUrl,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let meetingUrl = postResponse.data?.meetingUrl;
  if (!meetingUrl) {
    const getUrl = `${baseUrl}/api/appointment/meetings/${slotId}/users/${userId}/url`;
    const getResponse = await axios.get(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    meetingUrl = getResponse.data?.meetingUrl;
  }
  if (!meetingUrl) {
    throw new Error("Meeting URL is not available yet. Try again in a moment.");
  }

  if (patientIdForStorage != null) {
    localStorage.setItem("patientId", String(patientIdForStorage));
  }

  try {
    const expiresAt = Date.now() + 40 * 60 * 1000;
    const callPayload = call || { slotId };
    localStorage.setItem(
      "activeCall",
      JSON.stringify({
        call: callPayload,
        joinRoomUrl: meetingUrl,
        patientId: patientIdForStorage,
        patientFirstName: callPayload.patientFirstName ?? callPayload.firstName,
        patientLastName: callPayload.patientLastName ?? callPayload.lastName,
        patientName:
          callPayload.patientName ||
          [callPayload.patientFirstName, callPayload.patientLastName]
            .filter(Boolean)
            .join(" "),
        expiresAt,
      })
    );
    // Keep scheduled rejoin separate from GP instant-call `activeMeeting`
    // so a GP callId is never paired with a scheduled roomUrl.
    localStorage.setItem(
      "activeScheduledMeeting",
      JSON.stringify({ roomUrl: meetingUrl, expiresAt, kind: "scheduled", slotId })
    );
  } catch {
    // ignore storage errors
  }

  const { opened, blocked, usedSameTab } = openVideoCallPreferNewTab(meetingUrl);
  return { meetingUrl, opened, blocked, usedSameTab };
}
