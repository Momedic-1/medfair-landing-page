import { capitalizeFirstLetter } from "../utils";
import { normalizeDateOfBirth } from "./normalizeDateOfBirth";

export function resolveVideoCallRole(userData) {
  try {
    const role = userData?.role || localStorage.getItem("roleType");
    return String(role || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

function safeCap(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  if (!s) return "";
  try {
    return capitalizeFirstLetter(s);
  } catch {
    return s;
  }
}

function unwrapPatientProfile(apiData) {
  if (!apiData || typeof apiData !== "object") return {};
  if (apiData.profile && typeof apiData.profile === "object") {
    return apiData.profile;
  }
  return apiData;
}

export function calculateAgeFromDob(dob) {
  const normalized = normalizeDateOfBirth(dob);
  if (!normalized) return "N/A";
  const birthDate = new Date(`${normalized}T12:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "N/A";
}

function formatDobDisplay(dob) {
  const normalized = normalizeDateOfBirth(dob);
  if (!normalized) return "N/A";
  const [y, m, d] = normalized.split("-");
  return `${d}/${m}/${y}`;
}

function fullNameFromParts(first, last) {
  return [safeCap(first), safeCap(last)].filter(Boolean).join(" ").trim();
}

/** Doctor / specialist name shown to the patient. */
export function resolveDoctorDisplayName(call, userData) {
  if (!call) return "Specialist";

  const fromParts = fullNameFromParts(
    call.doctorFirstName || call.specialistFirstName,
    call.doctorLastName || call.specialistLastName,
  );
  if (fromParts) return fromParts;

  const doctorOnlyName = call.doctorName;
  const patientListName = call.name;

  if (doctorOnlyName) {
    const withTitle = [call.doctorTitle || call.title, doctorOnlyName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return safeCap(withTitle || doctorOnlyName);
  }

  if (patientListName) {
    const n = safeCap(patientListName);
    return n.toLowerCase().startsWith("dr") ? n : `Dr. ${n}`;
  }

  const titled = [call.doctorTitle || call.title, call.specialistName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (titled) return safeCap(titled);

  if (call.doctorName) return safeCap(call.doctorName);
  if (call.specialistName) return safeCap(call.specialistName);
  if (call.name) return safeCap(call.name);

  return "Specialist";
}

function nameMatchesDoctor(call, candidate, userData) {
  if (!candidate) return false;
  const c = String(candidate).toLowerCase().trim();
  const doctorBits = [
    call?.doctorName,
    call?.doctorFirstName,
    call?.doctorLastName,
    fullNameFromParts(call?.doctorFirstName, call?.doctorLastName),
    userData?.firstName,
    userData?.lastName,
    fullNameFromParts(userData?.firstName, userData?.lastName),
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase().trim());

  return doctorBits.some((d) => d && (c === d || c.includes(d) || d.includes(c)));
}

/** Patient name shown to the doctor (never the doctor's own name). */
export function resolvePatientDisplayName(call, userData) {
  if (!call) {
    return { displayName: "Patient", firstName: "Patient", lastName: "" };
  }

  const first = call.patientFirstName || call.firstName || call.patient?.firstName;
  const last = call.patientLastName || call.lastName || call.patient?.lastName;

  const fromParts = fullNameFromParts(first, last);
  if (fromParts) {
    return {
      displayName: fromParts,
      firstName: safeCap(first),
      lastName: safeCap(last),
    };
  }

  if (call.patientName && !nameMatchesDoctor(call, call.patientName, userData)) {
    const n = safeCap(call.patientName);
    return { displayName: n, firstName: n, lastName: "" };
  }

  if (call.name && !nameMatchesDoctor(call, call.name, userData)) {
    const n = safeCap(call.name);
    return { displayName: n, firstName: n, lastName: "" };
  }

  if (call.patientFullName) {
    const n = safeCap(call.patientFullName);
    return { displayName: n, firstName: n, lastName: "" };
  }

  return { displayName: "Patient", firstName: "Patient", lastName: "" };
}

export function resolvePatientDob(call, profileFromApi) {
  const fromCall =
    call?.patientDob ||
    call?.patientDateOfBirth ||
    call?.dob ||
    call?.dateOfBirth;

  if (fromCall) return fromCall;

  const profile = unwrapPatientProfile(profileFromApi);
  return profile.dateOfBirth || profile.dob || null;
}

export function resolvePatientAge(call, profileFromApi, dobRaw) {
  const profile = unwrapPatientProfile(profileFromApi);
  if (profile.age != null && profile.age !== "") {
    return String(profile.age);
  }
  return calculateAgeFromDob(dobRaw);
}

export function buildVideoCallHeaderDisplay(role, call, userData, profileFromApi) {
  const normalizedRole = String(role || resolveVideoCallRole(userData)).toUpperCase();
  const isDoctor = normalizedRole === "DOCTOR";

  if (isDoctor) {
    let patient = resolvePatientDisplayName(call, userData);
    const profile = unwrapPatientProfile(profileFromApi);
    const profileName = fullNameFromParts(profile.firstName, profile.lastName);

    if (profile.fullName) {
      const n = safeCap(profile.fullName);
      patient = { displayName: n, firstName: n, lastName: "" };
    } else if (profileName) {
      patient = {
        displayName: profileName,
        firstName: safeCap(profile.firstName),
        lastName: safeCap(profile.lastName),
      };
    }

    const dobRaw = resolvePatientDob(call, profileFromApi);
    return {
      mode: "doctor",
      label: "Patient",
      displayName: patient.displayName,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: formatDobDisplay(dobRaw),
      age: resolvePatientAge(call, profileFromApi, dobRaw),
      showDob: true,
      showAge: true,
    };
  }

  return {
    mode: "patient",
    label: "Doctor",
    displayName: resolveDoctorDisplayName(call, userData),
    showDob: false,
    showAge: false,
  };
}

export function getStoredCallContext() {
  try {
    const raw = localStorage.getItem("activeCall");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const call = parsed?.call || {};
    const patientId = parsed?.patientId ?? call.patientId;

    const merged = {
      ...call,
      patientId,
      patientFirstName:
        call.patientFirstName ?? parsed.patientFirstName ?? call.firstName,
      patientLastName:
        call.patientLastName ?? parsed.patientLastName ?? call.lastName,
      patientName:
        call.patientName ??
        parsed.patientName ??
        [call.patientFirstName, call.patientLastName].filter(Boolean).join(" "),
      patientDob:
        call.patientDob ??
        parsed.patientDob ??
        call.patientDateOfBirth ??
        call.dob,
    };

    if (!patientId && !merged.patientFirstName && !merged.patientName) {
      return Object.keys(call).length ? merged : null;
    }

    return merged;
  } catch {
    return null;
  }
}

export function getStoredPatientId() {
  try {
    const raw = localStorage.getItem("activeCall");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.patientId != null) return String(parsed.patientId);
      if (parsed?.call?.patientId != null) return String(parsed.call.patientId);
    }
    const stored = localStorage.getItem("patientId");
    return stored != null ? String(stored) : null;
  } catch {
    const stored = localStorage.getItem("patientId");
    return stored != null ? String(stored) : null;
  }
}
