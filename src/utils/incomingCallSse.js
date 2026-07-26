/**
 * SSE client for GP incoming-call notifications (Authorization header supported).
 * Video still uses Whereby via existing join API — this only pushes alert events.
 */

function parseSseBlock(block) {
  if (!block?.trim()) return null;
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * @param {object} options
 * @param {string} options.baseUrl
 * @param {number} options.doctorId
 * @param {string} options.token
 * @param {(payload: object) => void} options.onEvent
 * @param {(err?: unknown) => void} [options.onError]
 * @param {() => void} [options.onOpen]
 * @returns {() => void} disconnect
 */
export function connectIncomingCallSse({
  baseUrl,
  doctorId,
  token,
  onEvent,
  onError,
  onOpen,
}) {
  const controller = new AbortController();
  let buffer = "";
  let closed = false;

  const url = `${baseUrl}/api/v1/video/incoming-calls/stream?doctorId=${doctorId}`;

  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`SSE failed (${response.status})`);
      }
      onOpen?.();
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("SSE stream not supported");
      }
      const decoder = new TextDecoder();
      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\n\n/);
        buffer = parts.pop() || "";
        for (const part of parts) {
          const payload = parseSseBlock(part);
          if (payload) onEvent?.(payload);
        }
      }
      if (buffer.trim()) {
        const payload = parseSseBlock(buffer);
        if (payload) onEvent?.(payload);
      }
    })
    .catch((err) => {
      if (!closed && err?.name !== "AbortError") {
        onError?.(err);
      }
    });

  return () => {
    closed = true;
    controller.abort();
  };
}

function normalizeCallId(id) {
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : id;
}

function isHiddenCallId(id, hiddenIds) {
  const normalized = normalizeCallId(id);
  return hiddenIds.some((h) => normalizeCallId(h) === normalized);
}

/** Apply SSE payload to a call list (CallResponse / VideoCallResponse shape). */
export function applyIncomingCallEvent(
  calls,
  event,
  pickedCallIds = [],
  dismissedCallIds = [],
) {
  const list = Array.isArray(calls) ? [...calls] : [];
  const hiddenIds = [...pickedCallIds, ...dismissedCallIds];
  const isHidden = (id) => isHiddenCallId(id, hiddenIds);
  const GRACE_MS = 20000;

  if (!event?.type) return list.filter((c) => !isHidden(c.callId));

  switch (event.type) {
    case "CONNECTED":
    case "REFRESH": {
      const fromServer = (event.calls || []).filter((c) => !isHidden(c.callId));
      const serverIds = new Set(
        fromServer.map((c) => normalizeCallId(c.callId)),
      );
      const now = Date.now();
      // Keep very recent SSE-only calls so an empty/racy poll cannot flash-remove them.
      const pendingLocal = list.filter((c) => {
        const id = normalizeCallId(c.callId);
        if (id == null || serverIds.has(id) || isHidden(id)) return false;
        const at = typeof c._sseAt === "number" ? c._sseAt : 0;
        return at > 0 && now - at < GRACE_MS;
      });
      return [...fromServer, ...pendingLocal];
    }
    case "NEW_CALL":
      if (event.call && !isHidden(event.call.callId)) {
        const exists = list.some(
          (c) =>
            normalizeCallId(c.callId) === normalizeCallId(event.call.callId),
        );
        if (!exists) {
          list.unshift({ ...event.call, _sseAt: Date.now() });
        }
      }
      return list.filter((c) => !isHidden(c.callId));
    case "CALL_CLAIMED":
    case "CALL_ENDED":
      return list.filter(
        (c) =>
          normalizeCallId(c.callId) !== normalizeCallId(event.callId),
      );
    case "HEARTBEAT":
    default:
      return list;
  }
}
