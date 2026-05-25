/** Active GP consultation window (Whereby room + rejoin). */
export const ACTIVE_CALL_REJOIN_MS = 45 * 60 * 1000;

export function saveDoctorJoinedSession({
  call,
  joinRoomUrl,
  patientId,
  patientFirstName,
  patientLastName,
}) {
  if (!joinRoomUrl) return;
  const payload = {
    call,
    joinRoomUrl,
    patientId: patientId ?? call?.patientId ?? null,
    patientFirstName: patientFirstName ?? call?.patientFirstName ?? null,
    patientLastName: patientLastName ?? call?.patientLastName ?? null,
    doctorJoined: true,
    joinedAt: Date.now(),
    expiresAt: Date.now() + ACTIVE_CALL_REJOIN_MS,
  };
  localStorage.setItem("activeCall", JSON.stringify(payload));
  return payload;
}

/** Rejoin is only for doctors who already joined a live consultation. */
export function loadDoctorRejoinSession() {
  try {
    const raw = localStorage.getItem("activeCall");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.doctorJoined || !parsed?.joinRoomUrl) return null;
    if (parsed.expiresAt && Date.now() >= parsed.expiresAt) {
      localStorage.removeItem("activeCall");
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem("activeCall");
    return null;
  }
}

export function clearDoctorRejoinSession() {
  localStorage.removeItem("activeCall");
}

/** Patient-side video header context after a doctor joins. */
export function savePatientGpVideoContext({
  callId,
  roomUrl,
  doctorId,
  doctorFirstName,
  doctorLastName,
}) {
  const call = {
    callId,
    doctorId,
    doctorFirstName,
    doctorLastName,
  };
  localStorage.setItem(
    "patientGpVideoContext",
    JSON.stringify({
      call,
      joinRoomUrl: roomUrl,
      expiresAt: Date.now() + ACTIVE_CALL_REJOIN_MS,
    }),
  );
  return call;
}

export function loadPatientGpVideoContext() {
  try {
    const raw = localStorage.getItem("patientGpVideoContext");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.expiresAt && Date.now() >= parsed.expiresAt) {
      localStorage.removeItem("patientGpVideoContext");
      return null;
    }
    return parsed?.call ?? null;
  } catch {
    return null;
  }
}

export function clearPatientGpVideoContext() {
  localStorage.removeItem("patientGpVideoContext");
}

export function remainingRejoinMinutes(expiresAt) {
  const diffMs = Math.max(0, (expiresAt || 0) - Date.now());
  return Math.ceil(diffMs / (60 * 1000));
}
