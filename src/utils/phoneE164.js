/**
 * Normalize and validate international phone numbers as E.164 (+…).
 * National length ranges cover Medfair's preferred countries plus common dial codes.
 */

/** dialCode (no +) → allowed national significant number lengths (excluding country code). */
const NATIONAL_LENGTH_BY_DIAL = {
  1: [10], // US/CA
  44: [10], // UK
  233: [9], // Ghana
  234: [10], // Nigeria
  254: [9], // Kenya
  27: [9], // South Africa
  91: [10], // India
  61: [9], // Australia
  49: [10, 11], // Germany
  33: [9], // France
  971: [9], // UAE
  966: [9], // Saudi
};

const DIAL_CODES_LONGEST_FIRST = Object.keys(NATIONAL_LENGTH_BY_DIAL).sort(
  (a, b) => b.length - a.length,
);

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Store / compare as E.164 with leading +. */
export function toE164(value) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return `+${digits}`;
}

/**
 * Login identifier: leave emails alone; phones become E.164.
 */
export function normalizeLoginIdentifier(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("@")) return trimmed;
  return toE164(trimmed);
}

function resolveDialCode(allDigits, country) {
  const fromCountry = String(country?.dialCode || "").replace(/\D/g, "");
  if (fromCountry && allDigits.startsWith(fromCountry)) return fromCountry;
  for (const dial of DIAL_CODES_LONGEST_FIRST) {
    if (allDigits.startsWith(dial)) return dial;
  }
  return fromCountry || null;
}

/**
 * @param {string} value raw or E.164 phone
 * @param {{ dialCode?: string, iso2?: string, format?: string } | null} country from react-phone-input-2
 */
export function isValidPhoneE164(value, country = null) {
  const e164 = toE164(value);
  if (!e164.startsWith("+") || e164.length < 8 || e164.length > 16) {
    return false;
  }
  const allDigits = e164.slice(1);
  const dial = resolveDialCode(allDigits, country);

  if (dial && allDigits.startsWith(dial)) {
    const national = allDigits.slice(dial.length);
    const allowed = NATIONAL_LENGTH_BY_DIAL[dial];
    if (allowed) {
      return allowed.includes(national.length);
    }
    return national.length >= 4 && national.length <= 12;
  }

  return allDigits.length >= 8 && allDigits.length <= 15;
}

export function phoneValidationMessage(country = null) {
  const dial = country?.dialCode ? `+${country.dialCode}` : "your country";
  return `Enter a valid mobile number for ${dial}.`;
}
