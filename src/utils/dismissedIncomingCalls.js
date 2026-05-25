const STORAGE_KEY = "dismissedIncomingCallIds";

function normalizeId(id) {
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : id;
}

export function loadDismissedCallIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) return [];
    return list.map(normalizeId).filter((id) => id != null);
  } catch {
    return [];
  }
}

export function dismissIncomingCallId(callId) {
  const id = normalizeId(callId);
  if (id == null) return;
  const existing = loadDismissedCallIds();
  if (existing.some((x) => x === id)) return;
  const next = [...existing, id].slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function filterDismissedCalls(calls, dismissedIds = loadDismissedCallIds()) {
  if (!dismissedIds?.length) return calls || [];
  const hidden = new Set(dismissedIds);
  return (calls || []).filter((c) => !hidden.has(normalizeId(c.callId)));
}
