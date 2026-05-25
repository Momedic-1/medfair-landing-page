import { getDoctorDisplayName } from "../PatientDashboard/components/DoctorAvatar";

const CREDENTIAL_TOKENS = new Set([
  "md",
  "mbbs",
  "phd",
  "fnmc",
  "mbchb",
  "do",
  "dds",
  "dvm",
]);

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\./g, "")
    .trim();
}

function nameTokens(displayName, profile) {
  const fromDisplay = String(displayName || "")
    .toLowerCase()
    .split(/[\s,.]+/)
    .map(normalizeToken)
    .filter(Boolean);
  const first = normalizeToken(profile?.firstName);
  const last = normalizeToken(profile?.lastName);
  return new Set([...fromDisplay, first, last].filter(Boolean));
}

function isDuplicateOfName(part, displayNameLower, profile) {
  const token = normalizeToken(part);
  if (!token) return true;
  if (displayNameLower.includes(token)) return true;
  if (nameTokens(displayNameLower, profile).has(token)) return true;

  const first = normalizeToken(profile?.firstName);
  const last = normalizeToken(profile?.lastName);
  const title = normalizeToken(profile?.title);

  if (token === first || token === last) return true;
  if (title && token === title) return true;
  if (CREDENTIAL_TOKENS.has(token) && displayNameLower.includes("dr")) return true;

  return false;
}

/** Subtitle under doctor name — avoids redundant lines like "John · MD". */
export function getDoctorSubtitle(profile) {
  if (!profile) return null;

  const displayName = getDoctorDisplayName(profile);
  const displayLower = displayName.toLowerCase();
  const parts = [];

  const first = normalizeToken(profile?.firstName);
  const last = normalizeToken(profile?.lastName);
  const practice = profile.practiceName?.trim();
  const practiceNorm = normalizeToken(practice);
  if (
    practice &&
    practiceNorm !== first &&
    practiceNorm !== last &&
    !isDuplicateOfName(practice, displayLower, profile)
  ) {
    parts.push(practice);
  }

  const qualifications = profile.qualifications?.trim();
  if (qualifications) {
    const qualParts = qualifications.split(/[,;]/).map((q) => q.trim());
    qualParts.forEach((q) => {
      if (q && !isDuplicateOfName(q, displayLower, profile)) {
        const already = parts.some(
          (p) => p.toLowerCase() === q.toLowerCase()
        );
        if (!already) parts.push(q);
      }
    });
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Booking cards: hide lone practice names (often a mistaken first name like "John"). */
export function getDoctorSubtitleForBookingCard(profile) {
  const subtitle = getDoctorSubtitle(profile);
  if (!subtitle) return null;

  const practice = profile?.practiceName?.trim();
  if (practice && subtitle === practice && !/\s/.test(practice)) {
    return null;
  }

  return subtitle;
}
