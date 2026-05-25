import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/** Same zone as backend AppointmentSlotService (Africa/Lagos) */
export const BOOKING_TIMEZONE = "Africa/Lagos";

/** Normalize API time strings (e.g. "9:30", "09:30", "09:30:00.123") */
function normalizeTimeString(time) {
  if (!time) return "";
  const trimmed = String(time).trim().split(".")[0];
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const s = parts.length > 2 ? parts[2].padStart(2, "0") : "00";
    return `${h}:${m}:${s}`;
  }
  return trimmed;
}

/** Ensure each slot has a date (from slot or parent day group) */
export function slotWithDate(slot, groupDate) {
  return {
    ...slot,
    date: slot?.date || groupDate,
  };
}

/** Parse slot date + time in Lagos — matches server slot times */
export function parseSlotDateTime(slot) {
  const date = slot?.date;
  if (!date || !slot?.time) return null;
  const time = normalizeTimeString(slot.time);
  let parsed = dayjs.tz(`${date}T${time}`, BOOKING_TIMEZONE);
  if (!parsed.isValid()) {
    parsed = dayjs.tz(`${date} ${time}`, BOOKING_TIMEZONE);
  }
  return parsed.isValid() ? parsed : null;
}

export function formatSlotTime(slot) {
  const parsed = parseSlotDateTime(slot);
  if (parsed) return parsed.format("h:mm A");
  const raw = String(slot?.time || "").trim();
  return raw.length >= 5 ? raw.slice(0, 5) : raw;
}

export function nowInBookingZone() {
  return dayjs().tz(BOOKING_TIMEZONE);
}

export function isSlotDateTimeExpired(slot, now = nowInBookingZone()) {
  if (slot?.expired === true) return true;
  const parsed = parseSlotDateTime(slot);
  if (!parsed) return false;
  return parsed.isBefore(now);
}

export function isSlotBookedFromApi(slot, isSlotBookedFn) {
  if (slot?.booked === true) return true;
  if (slot?.slotId != null && isSlotBookedFn) {
    return isSlotBookedFn(slot.slotId);
  }
  return false;
}

export function isTodayInBookingZone(dateStr) {
  if (!dateStr) return false;
  return dayjs.tz(dateStr, BOOKING_TIMEZONE).isSame(nowInBookingZone(), "day");
}

/** Available first, then expired, then booked — all still shown */
export function sortSlotsForDisplay(slots, isBooked, isExpired) {
  return [...slots].sort((a, b) => {
    const score = (s) => {
      if (isBooked(s.slotId)) return 2;
      if (isExpired(s)) return 1;
      return 0;
    };
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    const ta = parseSlotDateTime(a);
    const tb = parseSlotDateTime(b);
    if (ta && tb) return ta.valueOf() - tb.valueOf();
    return 0;
  });
}
