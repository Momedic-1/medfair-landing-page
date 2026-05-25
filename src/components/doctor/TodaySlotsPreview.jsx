import {
  formatSlotTime,
  isSlotBookedFromApi,
  isSlotDateTimeExpired,
  nowInBookingZone,
  slotWithDate,
} from "../../utils/slotDateTime";
import {
  countUpcomingDays,
  getTodaySlotsFromGroups,
} from "../../utils/normalizeSpecialistSlots";
import { SlotTimeButton } from "./DoctorSlotsByDate";

export function getTodaySlotGroup(slotGroups) {
  return getTodaySlotsFromGroups(slotGroups);
}

export function countFutureDays(slotGroups) {
  return countUpcomingDays(slotGroups);
}

export default function TodaySlotsPreview({
  slotGroups = [],
  isSlotBooked,
  isSlotExpired,
  onSlotClick,
  onViewProfile,
  maxVisible = 12,
}) {
  const todayGroup = getTodaySlotGroup(slotGroups);
  const otherDays = countFutureDays(slotGroups);
  const totalSlots = (slotGroups || []).reduce(
    (n, g) => n + (g.slots?.length || 0),
    0
  );

  const checkExpired = (slot) =>
    isSlotExpired?.(slot) ?? isSlotDateTimeExpired(slot);

  if (!todayGroup?.slots?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-3 py-4">
        <p className="text-center text-sm font-medium text-gray-600">
          {totalSlots > 0
            ? "No open times left today"
            : "No slots today"}
        </p>
        {totalSlots > 0 && (
          <p className="mt-1 text-center text-xs text-gray-500">
            {totalSlots} time{totalSlots !== 1 ? "s" : ""} on other days
          </p>
        )}
        {otherDays > 0 && onViewProfile ? (
          <button
            type="button"
            onClick={onViewProfile}
            className="mt-2 w-full text-center text-xs font-semibold text-[#020e7c] hover:underline"
          >
            View {otherDays} upcoming day{otherDays !== 1 ? "s" : ""} on profile →
          </button>
        ) : (
          <p className="mt-1 text-center text-xs text-gray-500">
            Check back later or view full profile
          </p>
        )}
      </div>
    );
  }

  const enriched = (todayGroup.slots || []).map((s) =>
    slotWithDate(s, todayGroup.date)
  );
  const isBookedSlot = (slot) =>
    isSlotBookedFromApi(slot, (id) => isSlotBooked?.(id));

  const available = enriched.filter(
    (s) => !isBookedSlot(s) && !checkExpired(s)
  );
  const expired = enriched.filter((s) => !isBookedSlot(s) && checkExpired(s));
  const booked = enriched.filter((s) => isBookedSlot(s));
  const ordered = [...available, ...expired, ...booked];
  const visible = ordered.slice(0, maxVisible);
  const hidden = ordered.length - visible.length;

  return (
    <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-white p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#020e7c]">
          Today · {nowInBookingZone().format("ddd, MMM D")}
        </p>
        <span className="text-[11px] text-gray-500">
          {available.length} bookable
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map((slot) => (
          <SlotTimeButton
            key={slot.slotId}
            slot={slot}
            isBooked={isBookedSlot(slot)}
            isExpired={checkExpired(slot)}
            onClick={(e) => {
              if (!isBookedSlot(slot) && !checkExpired(slot)) {
                onSlotClick?.(e, slot);
              }
            }}
          />
        ))}
        {hidden > 0 && (
          <span className="self-center rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600">
            +{hidden} more today
          </span>
        )}
      </div>
      {otherDays > 0 && onViewProfile && (
        <button
          type="button"
          onClick={onViewProfile}
          className="mt-3 w-full text-left text-xs font-semibold text-[#020e7c] hover:underline"
        >
          More dates on full profile ({otherDays} day{otherDays !== 1 ? "s" : ""}) →
        </button>
      )}
    </div>
  );
}
