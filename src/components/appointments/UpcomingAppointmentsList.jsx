import { CalendarDays, Video, XCircle } from "lucide-react";
import { formatTime, formatAppointmentDate } from "../../utils";
import {
  APPOINTMENT_STATUS_STYLES,
  getAppointmentDateTime,
  getAppointmentStatus,
  sortAppointmentsByStatus,
} from "../../utils/appointmentStatus";
import { canCancelAppointment } from "../../utils/cancelAppointment";

function PersonAvatar({ imageUrl, name }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#020e7c] text-sm font-bold text-white ring-2 ring-white">
      {initials}
    </div>
  );
}

export default function UpcomingAppointmentsList({
  appointments = [],
  loading = false,
  emptyTitle = "No upcoming appointments",
  emptyHint = "Book a consultation to see it here.",
  personPrefix = "Dr.",
  onJoin,
  isJoiningId = null,
  onCancel,
  isCancellingId = null,
}) {
  const sorted = sortAppointmentsByStatus(appointments);
  const activeCount = sorted.filter((a) => getAppointmentStatus(a) === "active").length;

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-gray-100 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <CalendarDays className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">{emptyTitle}</p>
        <p className="mt-1 text-xs text-gray-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeCount > 0 && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-800">
          {activeCount === 1
            ? "1 consultation ready. Tap Join to open video in a new tab"
            : `${activeCount} consultations ready. Tap Join on each when needed`}
        </p>
      )}
      {sorted.map((apt) => {
        const status = getAppointmentStatus(apt);
        const styles = APPOINTMENT_STATUS_STYLES[status] || APPOINTMENT_STATUS_STYLES.unknown;
        const dt = getAppointmentDateTime(apt);
        const displayName = apt.name || "Unknown";
        const canJoin = status === "active";
        const showCancel = Boolean(onCancel) && canCancelAppointment(apt);

        const dateLabel = apt.date
          ? formatAppointmentDate(apt.date)
          : dt?.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
        const timeLabel = apt.time
          ? formatTime(apt.time)
          : dt
            ? formatTime(dt.toTimeString().slice(0, 5))
            : "";

        return (
          <article
            key={apt.slotId || apt.id || `${displayName}-${apt.date}`}
            className={`rounded-xl border-2 p-3 transition-shadow ${styles.card} ${
              canJoin ? "hover:shadow-md" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <PersonAvatar imageUrl={apt.imageUrl} name={displayName} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#020e7c]">
                  {personPrefix ? `${personPrefix} ` : ""}
                  {displayName}
                </p>
                <p className="mt-1 overflow-x-auto text-xs text-gray-600 whitespace-nowrap">
                  {dateLabel}
                  {timeLabel ? ` · ${timeLabel}` : ""}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
                >
                  {styles.label}
                </span>
              </div>
            </div>

            {(canJoin || showCancel) && (
              <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3">
                {canJoin ? (
                  <button
                    type="button"
                    disabled={isJoiningId === apt.slotId}
                    onClick={() => onJoin?.(apt)}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#020e7c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    <Video className="h-4 w-4 shrink-0" />
                    {isJoiningId === apt.slotId ? "Joining…" : "Join video call"}
                  </button>
                ) : null}
                {showCancel ? (
                  <button
                    type="button"
                    disabled={isCancellingId === apt.slotId}
                    onClick={() => onCancel?.(apt)}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4 shrink-0" />
                    {isCancellingId === apt.slotId ? "Cancelling…" : "Cancel appointment"}
                  </button>
                ) : null}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
