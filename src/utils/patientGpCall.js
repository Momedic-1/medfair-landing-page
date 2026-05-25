const STORAGE_KEY = "patientGpCall";

/** @returns {{ callId: string|number, roomUrl?: string, status: string, startedAt: number } | null} */
export function loadPatientGpCall() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.callId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePatientGpCall({ callId, roomUrl, status = "WAITING" }) {
  if (callId == null) return;
  const payload = {
    callId: String(callId),
    roomUrl: roomUrl || null,
    status,
    startedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPatientGpCall() {
  localStorage.removeItem(STORAGE_KEY);
}

/** True while patient has an outstanding GP instant call (waiting or in session). */
export function isPatientGpCallActive(stored = loadPatientGpCall()) {
  if (!stored?.callId) return false;
  return stored.status === "WAITING" || stored.status === "IN_CALL";
}
