const PREFIX = "mf_patient_page_cache_v1:";

function storageKey(key) {
  return `${PREFIX}${key}`;
}

/** Read cached payload; returns null if missing/invalid. */
export function readPatientPageCache(key) {
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function writePatientPageCache(key, data) {
  try {
    sessionStorage.setItem(
      storageKey(key),
      JSON.stringify({ data, savedAt: Date.now() })
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearPatientPageCache(key) {
  try {
    sessionStorage.removeItem(storageKey(key));
  } catch {
    // ignore
  }
}

/** True when both sides serialize to the same JSON. */
export function isSamePatientPageData(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
