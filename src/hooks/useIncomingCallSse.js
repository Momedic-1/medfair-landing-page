import { useCallback, useEffect, useRef, useState } from "react";
import { baseUrl } from "../env";
import {
  applyIncomingCallEvent,
  connectIncomingCallSse,
} from "../utils/incomingCallSse";

const FALLBACK_POLL_MS = 30000;
const RECONNECT_DELAY_MS = 5000;

/**
 * Real-time incoming GP calls via SSE, with polling fallback.
 */
export function useIncomingCallSse({
  doctorId,
  token,
  enabled = true,
  pickedCallIds = [],
  fetchCalls,
}) {
  const [calls, setCalls] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const disconnectRef = useRef(null);
  const pollRef = useRef(null);
  const reconnectRef = useRef(null);
  const pickedRef = useRef(pickedCallIds);

  pickedRef.current = pickedCallIds;

  const loadCalls = useCallback(async () => {
    if (!fetchCalls) return;
    try {
      const data = await fetchCalls();
      const picked = pickedRef.current || [];
      setCalls(
        (data || []).filter((c) => !picked.includes(c.callId))
      );
    } finally {
      setReady(true);
    }
  }, [fetchCalls]);

  const handleEvent = useCallback((event) => {
    if (event.type === "HEARTBEAT") return;
    setCalls((prev) =>
      applyIncomingCallEvent(prev, event, pickedRef.current)
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
      return undefined;
    }

    loadCalls();
    connect();

    pollRef.current = setInterval(loadCalls, FALLBACK_POLL_MS);

    return () => {
      disconnectRef.current?.();
      clearInterval(pollRef.current);
      clearTimeout(reconnectRef.current);
      setSseConnected(false);
    };
  }, [enabled, connect, loadCalls]);

  useEffect(() => {
    setCalls((prev) =>
      prev.filter((c) => !pickedCallIds.includes(c.callId))
    );
  }, [pickedCallIds]);

  return { calls, setCalls, sseConnected, ready, refreshCalls: loadCalls };
}
