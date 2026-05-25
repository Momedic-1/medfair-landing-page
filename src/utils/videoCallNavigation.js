/**
 * Open the video call page in a new browser tab (room URL in query string).
 * Falls back to same-tab navigation if the popup is blocked.
 */
export function buildVideoCallUrl(roomUrl) {
  const base = `${window.location.origin}/video-call`;
  if (!roomUrl) return base;
  return `${base}?roomUrl=${encodeURIComponent(roomUrl)}`;
}

export function openVideoCallInNewTab(roomUrl) {
  const url = buildVideoCallUrl(roomUrl);
  const newTab = window.open(url, "_blank", "noopener,noreferrer");
  if (!newTab) {
    window.location.href = url;
    return false;
  }
  newTab.focus?.();
  return true;
}
