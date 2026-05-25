import dayjs from "dayjs";
import {
  BOOKING_TIMEZONE,
  nowInBookingZone,
  slotWithDate,
} from "./slotDateTime";

/** Normalize API date values to YYYY-MM-DD (Lagos calendar day). */
export function normalizeSlotDate(raw) {
  if (raw == null || raw === "") return null;

  if (Array.isArray(raw) && raw.length >= 3) {
    const [y, m, d] = raw;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  let parsed = dayjs.tz(s, BOOKING_TIMEZONE);
  if (!parsed.isValid()) parsed = dayjs(s);
  if (!parsed.isValid()) return null;

  return parsed.tz(BOOKING_TIMEZONE).format("YYYY-MM-DD");
}

function normalizeSlotFields(slot) {
  if (!slot || typeof slot !== "object") return slot;
  let time =
    slot.time ??
    slot.startTime ??
    slot.slotTime ??
    slot.appointmentTime;
  if (!time && slot.appointmentDateTime) {
    const s = String(slot.appointmentDateTime);
    if (s.includes("T")) time = s.split("T")[1]?.slice(0, 8);
  }
  let date = slot.date ?? slot.slotDate ?? slot.appointmentDate;
  if (!date && slot.appointmentDateTime) {
    date = String(slot.appointmentDateTime).slice(0, 10);
  }
  return {
    ...slot,
    slotId: slot.slotId ?? slot.id,
    date,
    time,
  };
}

function collectRawSlots(specialist) {
  const lists = [
    specialist?.slots,
    specialist?.availableSlots,
    specialist?.appointmentSlots,
    specialist?.openSlots,
  ].filter(Array.isArray);
  return lists.flat().map(normalizeSlotFields);
}

function groupSlotsByDate(slots) {
  const map = new Map();
  for (const raw of slots) {
    const slot = normalizeSlotFields(raw);
    const date =
      normalizeSlotDate(slot?.date) ||
      normalizeSlotDate(slot?.slotDate) ||
      normalizeSlotDate(slot?.appointmentDate);
    if (!date) continue;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(slotWithDate(slot, date));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slotsForDay]) => ({ date, slots: slotsForDay }));
}

/**
 * Ensures specialist has slotGroups with normalized dates.
 * Supports flat `slots` array from API and Java [y,m,d] date arrays.
 */
export function normalizeSpecialistSlotGroups(specialist) {
  if (!specialist) return specialist;

  let groups = specialist.slotGroups;
  const flatSlots = collectRawSlots(specialist);

  if ((!groups || !groups.length) && flatSlots.length) {
    groups = groupSlotsByDate(flatSlots);
  }

  if (!groups?.length) {
    return { ...specialist, slotGroups: [] };
  }

  const normalized = groups
    .map((group) => {
      const date =
        normalizeSlotDate(group.date) ||
        normalizeSlotDate(group.slots?.[0]?.date);
      const slots = (group.slots || [])
        .map((s) =>
          slotWithDate(
            normalizeSlotFields(s),
            normalizeSlotDate(s.date) || date
          )
        )
        .filter((s) => s.date && (s.slotId != null || s.time));
      return { ...group, date, slots };
    })
    .filter((g) => g.date && g.slots?.length);

  return { ...specialist, slotGroups: normalized };
}

/** Collect all slots that fall on today in Lagos, even if grouped under another date key. */
export function getTodaySlotsFromGroups(slotGroups) {
  const todayStr = nowInBookingZone().format("YYYY-MM-DD");
  const byGroup = slotGroups?.find(
    (g) => normalizeSlotDate(g.date) === todayStr
  );
  if (byGroup?.slots?.length) {
    return {
      date: todayStr,
      slots: byGroup.slots.map((s) => slotWithDate(s, todayStr)),
    };
  }

  const todaySlots = [];
  for (const group of slotGroups || []) {
    for (const slot of group.slots || []) {
      const slotDay = normalizeSlotDate(slot.date) || normalizeSlotDate(group.date);
      if (slotDay === todayStr) {
        todaySlots.push(slotWithDate(slot, todayStr));
      }
    }
  }

  if (!todaySlots.length) return null;

  todaySlots.sort((a, b) => {
    const ta = `${a.date}T${a.time}`;
    const tb = `${b.date}T${b.time}`;
    return ta.localeCompare(tb);
  });

  return { date: todayStr, slots: todaySlots };
}

export function isTodayInBookingZone(dateStr) {
  const d = normalizeSlotDate(dateStr);
  if (!d) return false;
  return d === nowInBookingZone().format("YYYY-MM-DD");
}

export function countUpcomingDays(slotGroups) {
  const todayStr = nowInBookingZone().format("YYYY-MM-DD");
  const days = new Set();
  for (const group of slotGroups || []) {
    const d = normalizeSlotDate(group.date);
    if (d && d > todayStr) days.add(d);
    for (const slot of group.slots || []) {
      const sd = normalizeSlotDate(slot.date) || d;
      if (sd && sd > todayStr) days.add(sd);
    }
  }
  return days.size;
}

export function specialistHasVisibleSlots(specialist) {
  const normalized = normalizeSpecialistSlotGroups(specialist);
  return (normalized.slotGroups || []).some((g) => g.slots?.length > 0);
}
