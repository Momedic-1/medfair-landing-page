const STORAGE_KEY = "dismissedIncomingCallIds";
/** Match GP call visibility / room lifetime so dismissed ids do not hide future calls forever. */
const DISMISS_TTL_MS = 30 * 60 * 1000;

function normalizeId(id) {
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : id;
}

function pruneEntries(entries) {
  const now = Date.now();
  return (entries || [])
    .map((entry) => {
      if (entry != null && typeof entry === "object" && "id" in entry) {
        return {
          id: normalizeId(entry.id),
          at: typeof entry.at === "number" ? entry.at : now,
        };
      }
      // Legacy bare id
      return { id: normalizeId(entry), at: now };
    })
    .filter((e) => e.id != null && now - e.at < DISMISS_TTL_MS);
}

export function loadDismissedCallIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) return [];
    const pruned = pruneEntries(list);
    if (pruned.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    }
    return pruned.map((e) => e.id);
  } catch {
    return [];
  }
}

export function dismissIncomingCallId(callId) {
  const id = normalizeId(callId);
  if (id == null) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || "[]");
    const pruned = pruneEntries(Array.isArray(list) ? list : []);
    if (pruned.some((e) => e.id === id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
      return;
    }
    const next = [...pruned, { id, at: Date.now() }].slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function filterDismissedCalls(calls, dismissedIds = loadDismissedCallIds()) {
  if (!dismissedIds?.length) return calls || [];
  const hidden = new Set(dismissedIds);
  return (calls || []).filter((c) => !hidden.has(normalizeId(c.callId)));
}
