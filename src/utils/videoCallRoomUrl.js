const SESSION_KEY = "medfair_pending_video_room_url";

export function normalizeWherebyRoomUrl(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes("whereby.com")) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
  return trimmed;
}

/** Parse roomUrl from ?roomUrl=… even when the value contains & or ? */
export function parseRoomUrlFromSearch(search) {
  if (!search) return null;
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const key = "roomUrl=";
  const idx = raw.indexOf(key);
  if (idx === -1) {
    const value = new URLSearchParams(raw).get("roomUrl");
    return normalizeWherebyRoomUrl(value ? decodeURIComponent(value) : null);
  }
  const encoded = raw.slice(idx + key.length);
  try {
    return normalizeWherebyRoomUrl(decodeURIComponent(encoded));
  } catch {
    return normalizeWherebyRoomUrl(encoded);
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
