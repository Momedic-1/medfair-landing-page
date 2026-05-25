import dayjs from "dayjs";
import {
  formatSlotTime,
  isSlotBookedFromApi,
  isSlotDateTimeExpired,
  nowInBookingZone,
  slotWithDate,
} from "../../utils/slotDateTime";
import { isTodayInBookingZone } from "../../utils/slotDateTime";

export function SlotTimeButton({ slot, isBooked, isExpired, disabled, onClick }) {
  const isDisabled = disabled || isBooked || isExpired;

  let slotClass =
    "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ";
  if (isBooked) {
    slotClass += "cursor-not-allowed bg-red-400 text-white opacity-80";
  } else if (isExpired) {
    slotClass +=
      "cursor-not-allowed border border-gray-500 bg-gray-400 text-white opacity-80 line-through decoration-white/80";
  } else {
    slotClass += "bg-[#020e7c] text-white hover:bg-blue-800 shadow-sm";
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={slotClass}
      title={isExpired ? "This time has passed" : undefined}
      onClick={onClick}
    >
      {formatSlotTime(slot)}
      {isBooked && (
        <span className="mt-0.5 block text-[10px] font-medium text-red-100 no-underline">
          Booked
        </span>
      )}
      {isExpired && !isBooked && (
        <span className="mt-0.5 block text-[10px] font-semibold text-gray-100 no-underline">
          Expired
        </span>
      )}
    </button>
  );
}

/**
 * One horizontal row per calendar day — today's slots in one row, tomorrow's in the next, etc.
 */
export default function DoctorSlotsByDate({
  slotGroups = [],
  isSlotBooked,
  isSlotExpired,
  onSlotClick,
  emptyMessage = "No open slots right now.",
  excludeToday = false,
}) {
  const checkExpired = (slot) =>
    isSlotExpired?.(slot) ?? isSlotDateTimeExpired(slot);

  if (!slotGroups?.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {slotGroups.map((slotGroup) => {
        const isToday = isTodayInBookingZone(slotGroup.date);
        if (excludeToday && isToday) return null;
        const enrichedSlots = (slotGroup.slots || []).map((s) =>
          slotWithDate(s, slotGroup.date)
        );
        const isBookedSlot = (slot) =>
          isSlotBookedFromApi(slot, (id) => isSlotBooked?.(id));

        const available = enrichedSlots.filter(
          (s) => !isBookedSlot(s) && !checkExpired(s)
        );
        const expired = enrichedSlots.filter(
          (s) => !isBookedSlot(s) && checkExpired(s)
        );
        const booked = enrichedSlots.filter((s) => isBookedSlot(s));
        const allForRow = [...available, ...expired, ...booked];

        if (allForRow.length === 0) return null;

        return (
          <section
            key={slotGroup.date}
            className={`rounded-xl border p-4 sm:p-5 ${
              isToday
                ? "border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-white"
                : "border-gray-100 bg-white"
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#020e7c] sm:text-base">
                {isToday
                  ? `Today · ${nowInBookingZone().format("dddd, MMM D")}`
                  : dayjs(slotGroup.date).format("dddd, MMMM D")}
              </h3>
              <span className="text-xs text-gray-500">
                {available.length} available
                {expired.length > 0 ? ` · ${expired.length} expired` : ""}
                {booked.length > 0 ? ` · ${booked.length} booked` : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {allForRow.map((slot) => (
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
            </div>
          </section>
        );
      })}
    </div>
  );
}
