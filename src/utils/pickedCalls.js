const STORAGE_KEY = "pickedCalls";
const PICKED_TTL_MS = 45 * 60 * 1000;

function normalizeId(id) {
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : id;
}

function prunePickedEntries(entries) {
  const now = Date.now();
  return (entries || [])
    .map((entry) => {
      if (entry != null && typeof entry === "object" && "id" in entry) {
        return {
          id: normalizeId(entry.id),
          at: typeof entry.at === "number" ? entry.at : now,
        };
      }
      return { id: normalizeId(entry), at: now };
    })
    .filter((e) => e.id != null && now - e.at < PICKED_TTL_MS);
}

/** Returns call ids the doctor already picked (within TTL). */
export function loadPickedCallIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) return [];
    const pruned = prunePickedEntries(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    return pruned.map((e) => e.id);
  } catch {
    return [];
  }
}

export function rememberPickedCallId(callId) {
  const id = normalizeId(callId);
  if (id == null) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(raw || "[]");
    const pruned = prunePickedEntries(Array.isArray(list) ? list : []);
    if (!pruned.some((e) => e.id === id)) {
      pruned.push({ id, at: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned.slice(-200)));
  } catch {
    // ignore
  }
}
