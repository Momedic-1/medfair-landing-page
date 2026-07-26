import { useCallback, useEffect, useRef, useState } from "react";
import { baseUrl } from "../env";
import {
  applyIncomingCallEvent,
  connectIncomingCallSse,
} from "../utils/incomingCallSse";
import {
  dismissIncomingCallId,
  loadDismissedCallIds,
} from "../utils/dismissedIncomingCalls";

const DEFAULT_POLL_MS = 8000;
const INCOMING_PAGE_POLL_MS = 4000;
const RECONNECT_DELAY_MS = 3000;
const FAST_RETRY_MS = 1500;

/**
 * Real-time incoming GP calls via SSE, with polling fallback.
 */
export function useIncomingCallSse({
  doctorId,
  token,
  enabled = true,
  pickedCallIds = [],
  fetchCalls,
  pollIntervalMs,
  fastRetry = false,
}) {
  const [calls, setCalls] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [ready, setReady] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const pollMs = pollIntervalMs ?? DEFAULT_POLL_MS;
  const disconnectRef = useRef(null);
  const pollRef = useRef(null);
  const reconnectRef = useRef(null);
  const pickedRef = useRef(pickedCallIds);
  const dismissedRef = useRef(loadDismissedCallIds());

  pickedRef.current = pickedCallIds;

  const loadCalls = useCallback(async () => {
    if (!fetchCalls) {
      setInitialLoading(false);
      setLoadError(null);
      return;
    }
    try {
      const data = await fetchCalls();
      const picked = pickedRef.current || [];
      const dismissed = dismissedRef.current || [];
      setCalls(
        applyIncomingCallEvent(data || [], { type: "REFRESH", calls: data || [] }, picked, dismissed),
      );
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err?.message === "Network Error"
          ? "Could not load incoming calls. Check your connection."
          : "Could not load incoming calls. Tap refresh to try again.",
      );
    } finally {
      setInitialLoading(false);
      setReady(true);
    }
  }, [fetchCalls]);

  const handleEvent = useCallback((event) => {
    if (event.type === "HEARTBEAT") return;
    if (event.type === "CALL_ENDED" && event.callId != null) {
      dismissIncomingCallId(event.callId);
      dismissedRef.current = loadDismissedCallIds();
    }
    if (event.type === "CALL_CLAIMED" && event.callId != null) {
      dismissIncomingCallId(event.callId);
      dismissedRef.current = loadDismissedCallIds();
    }
    setCalls((prev) =>
      applyIncomingCallEvent(
        prev,
        event,
        pickedRef.current,
        dismissedRef.current,
      ),
    );
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !doctorId || !token) return;

    disconnectRef.current?.();
    clearTimeout(reconnectRef.current);

    disconnectRef.current = connectIncomingCallSse({
      baseUrl,
      doctorId,
      token,
      onOpen: () => setSseConnected(true),
      onEvent: handleEvent,
      onError: () => {
        setSseConnected(false);
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      },
    });
  }, [enabled, doctorId, token, handleEvent]);

  useEffect(() => {
    if (!enabled) {
      disconnectRef.current?.();
      setSseConnected(false);
      setInitialLoading(false);
      return undefined;
    }

    setInitialLoading(true);
    loadCalls();
    connect();

    let fastRetryTimer;
    if (fastRetry) {
      fastRetryTimer = setTimeout(loadCalls, FAST_RETRY_MS);
    }

    pollRef.current = setInterval(loadCalls, pollMs);

    return () => {
      disconnectRef.current?.();
      clearInterval(pollRef.current);
      clearTimeout(reconnectRef.current);
      if (fastRetryTimer) clearTimeout(fastRetryTimer);
      setSseConnected(false);
    };
  }, [enabled, connect, loadCalls, pollMs, fastRetry]);

  useEffect(() => {
    dismissedRef.current = loadDismissedCallIds();
    setCalls((prev) =>
      applyIncomingCallEvent(
        prev,
        { type: "REFRESH", calls: prev },
        pickedCallIds,
        dismissedRef.current,
      ),
    );
  }, [pickedCallIds]);

  return {
    calls,
    setCalls,
    sseConnected,
    ready,
    initialLoading,
    loadError,
    refreshCalls: loadCalls,
  };
}

export { INCOMING_PAGE_POLL_MS };
