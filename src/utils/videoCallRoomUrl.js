const SESSION_KEY = "medfair_pending_video_room_url";

export function normalizeWherebyRoomUrl(raw) {
  if (raw == null) return null;
  let trimmed = String(raw).trim();
  if (!trimmed) return null;

  // Guard: older parser appended "&callId=123" onto the Whereby URL.
  const callIdTail = trimmed.search(/&callId=/i);
  if (callIdTail !== -1 && /^https?:\/\//i.test(trimmed)) {
    trimmed = trimmed.slice(0, callIdTail);
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes("whereby.com")) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
  return trimmed;
}

/**
 * Parse roomUrl from ?roomUrl=…&callId=…
 * Prefer URLSearchParams (encoded values). Fall back to manual parse for legacy
 * unencoded Whereby URLs that contain "?roomKey=…" as the last query param.
 */
export function parseRoomUrlFromSearch(search) {
  if (!search) return null;
  const raw = search.startsWith("?") ? search.slice(1) : search;

  const fromParams = new URLSearchParams(raw).get("roomUrl");
  if (fromParams) {
    return normalizeWherebyRoomUrl(fromParams);
  }

  const key = "roomUrl=";
  const idx = raw.indexOf(key);
  if (idx === -1) return null;

  let value = raw.slice(idx + key.length);
  // Legacy unencoded roomUrl was last; strip a trailing &callId= if present.
  const callIdIdx = value.search(/&callId=/i);
  if (callIdIdx !== -1) {
    value = value.slice(0, callIdIdx);
  }

  try {
    return normalizeWherebyRoomUrl(decodeURIComponent(value));
  } catch {
    return normalizeWherebyRoomUrl(value);
  }
}

export function stashVideoRoomUrl(roomUrl) {
  const normalized = normalizeWherebyRoomUrl(roomUrl);
  if (!normalized) return;
  try {
    sessionStorage.setItem(SESSION_KEY, normalized);
  } catch {
    // ignore
  }
}

export function consumeStashedVideoRoomUrl() {
  try {
    const url = sessionStorage.getItem(SESSION_KEY);
    if (url) sessionStorage.removeItem(SESSION_KEY);
    return normalizeWherebyRoomUrl(url);
  } catch {
    return null;
  }
}

export function peekStashedVideoRoomUrl() {
  try {
    return normalizeWherebyRoomUrl(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function getPersistedActiveRoomUrl() {
  try {
    const activeCall = JSON.parse(localStorage.getItem("activeCall") || "null");
    if (activeCall?.joinRoomUrl) {
      return normalizeWherebyRoomUrl(activeCall.joinRoomUrl);
    }
    const activeMeeting = JSON.parse(
      localStorage.getItem("activeMeeting") || "null",
    );
    if (activeMeeting?.roomUrl) {
      return normalizeWherebyRoomUrl(activeMeeting.roomUrl);
    }
  } catch {
    // ignore
  }
  return null;
}

export function resolveVideoCallRoomUrl({ search = "", reduxRoomUrl = null } = {}) {
  return (
    parseRoomUrlFromSearch(search) ||
    peekStashedVideoRoomUrl() ||
    normalizeWherebyRoomUrl(reduxRoomUrl) ||
    getPersistedActiveRoomUrl() ||
    null
  );
}

/** Extract callId from the video-call query string. */
export function parseCallIdFromSearch(search) {
  if (!search) return null;
  try {
    const raw = search.startsWith("?") ? search.slice(1) : search;
    const value = new URLSearchParams(raw).get("callId");
    return value != null && String(value).trim() !== ""
      ? String(value).trim()
      : null;
  } catch {
    return null;
  }
}
