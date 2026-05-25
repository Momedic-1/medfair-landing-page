import { stashVideoRoomUrl } from "./videoCallRoomUrl";

/**
 * Open the MedFair video call page in a new browser tab (custom UI + clinical notes).
 * Do not use noopener on window.open — it returns null and breaks popup detection.
 */
export function buildVideoCallUrl(roomUrl) {
  const base = `${window.location.origin}/video-call`;
  if (!roomUrl) return base;
  return `${base}?roomUrl=${encodeURIComponent(roomUrl)}`;
}

/** Same-tab fallback when pop-ups are blocked (common for doctors). */
export function navigateToVideoCall(roomUrl) {
  if (!roomUrl) return;
  stashVideoRoomUrl(roomUrl);
  window.location.href = buildVideoCallUrl(roomUrl);
}

/**
 * @returns {{ opened: boolean, blocked: boolean }}
 */
export function openVideoCallInNewTab(roomUrl) {
  if (!roomUrl) return { opened: false, blocked: false };

  stashVideoRoomUrl(roomUrl);
  const url = buildVideoCallUrl(roomUrl);
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
export function openVideoCallPreferNewTab(roomUrl) {
  const result = openVideoCallInNewTab(roomUrl);
  if (result.blocked) {
    navigateToVideoCall(roomUrl);
    return { ...result, usedSameTab: true };
  }
  return { ...result, usedSameTab: false };
}
