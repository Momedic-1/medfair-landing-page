const STORAGE_KEY = "patientGpCall";

/** @returns {{ callId: string|number, roomUrl?: string, status: string, startedAt: number, doctorName?: string } | null} */
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

export function savePatientGpCall({
  callId,
  roomUrl,
  status = "WAITING",
  startedAt,
  doctorName,
}) {
  if (callId == null) return;
  const existing = loadPatientGpCall();
  const sameCall =
    existing && String(existing.callId) === String(callId) ? existing : null;
  const payload = {
    callId: String(callId),
    roomUrl: roomUrl || sameCall?.roomUrl || null,
    status,
    startedAt: startedAt ?? sameCall?.startedAt ?? Date.now(),
    doctorName: doctorName ?? sameCall?.doctorName ?? null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPatientGpCall() {
  localStorage.removeItem(STORAGE_KEY);
}

/** True while patient has an outstanding GP instant call (waiting, ready, or in session). */
export function isPatientGpCallActive(stored = loadPatientGpCall()) {
  if (!stored?.callId) return false;
  return (
    stored.status === "WAITING" ||
    stored.status === "DOCTOR_JOINED" ||
    stored.status === "IN_CALL"
  );
}
