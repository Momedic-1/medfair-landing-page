import { stashVideoRoomUrl } from "./videoCallRoomUrl";

const CALL_ID_SESSION_KEY = "medfair_pending_video_call_id";

/**
 * Open the MedFair video call page in a new browser tab (custom UI + clinical notes).
 * Do not use noopener on window.open — it returns null and breaks popup detection.
 */
export function buildVideoCallUrl(roomUrl, callId = null) {
  const base = `${window.location.origin}/video-call`;
  const params = new URLSearchParams();
  if (roomUrl) params.set("roomUrl", roomUrl);
  if (callId != null && String(callId).trim() !== "") {
    params.set("callId", String(callId));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function stashVideoCallId(callId) {
  if (callId == null) return;
  try {
    sessionStorage.setItem(CALL_ID_SESSION_KEY, String(callId));
  } catch {
    // ignore
  }
}

export function peekStashedVideoCallId() {
  try {
    return sessionStorage.getItem(CALL_ID_SESSION_KEY);
  } catch {
    return null;
  }
}

/** Same-tab fallback when pop-ups are blocked (common for doctors). */
export function navigateToVideoCall(roomUrl, callId = null) {
  if (!roomUrl) return;
  stashVideoRoomUrl(roomUrl);
  stashVideoCallId(callId);
  window.location.href = buildVideoCallUrl(roomUrl, callId);
}

/**
 * @returns {{ opened: boolean, blocked: boolean }}
 */
export function openVideoCallInNewTab(roomUrl, callId = null) {
  if (!roomUrl) return { opened: false, blocked: false };

  stashVideoRoomUrl(roomUrl);
  stashVideoCallId(callId);
  const url = buildVideoCallUrl(roomUrl, callId);
  const newTab = window.open(url, "_blank");

  if (!newTab) {
    return { opened: false, blocked: true };
  }

  try {
    newTab.opener = null;
  } catch {
    // ignore
  }
  newTab.focus?.();
  return { opened: true, blocked: false };
}

/**
 * Open video call in a new tab, or same tab if the browser blocks pop-ups.
 * @returns {{ opened: boolean, blocked: boolean, usedSameTab: boolean }}
 */
export function openVideoCallPreferNewTab(roomUrl, callId = null) {
  const result = openVideoCallInNewTab(roomUrl, callId);
  if (result.blocked) {
    navigateToVideoCall(roomUrl, callId);
    return { ...result, usedSameTab: true };
  }
  return { ...result, usedSameTab: false };
}
