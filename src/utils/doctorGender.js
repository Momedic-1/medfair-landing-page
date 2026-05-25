/** Human-readable gender for doctor profile (registration uses MALE / FEMALE). */
export function formatDoctorGender(raw) {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  if (!s) return "";
  const upper = s.toUpperCase();
  if (upper === "MALE" || upper === "M") return "Male";
  if (upper === "FEMALE" || upper === "F") return "Female";
  if (s === "Male" || s === "Female") return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Pick gender from profile API, nested user, or login cache. */
export function resolveDoctorGender(source) {
  if (!source || typeof source !== "object") return "";
  const raw =
    source.gender ??
    source.sex ??
    source.userGender ??
    source.user?.gender ??
    source.user?.sex;
  return formatDoctorGender(raw);
}
