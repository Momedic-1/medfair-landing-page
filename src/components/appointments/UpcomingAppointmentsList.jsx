import { CalendarDays, Video } from "lucide-react";
import { formatTime, formatAppointmentDate } from "../../utils";
import {
  APPOINTMENT_STATUS_STYLES,
  getAppointmentDateTime,
  getAppointmentStatus,
  sortAppointmentsByStatus,
} from "../../utils/appointmentStatus";

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
            ? "1 consultation ready — tap Join to open video in a new tab"
            : `${activeCount} consultations ready — tap Join on each when needed`}
        </p>
      )}
      {sorted.map((apt) => {
        const status = getAppointmentStatus(apt);
        const styles = APPOINTMENT_STATUS_STYLES[status] || APPOINTMENT_STATUS_STYLES.unknown;
        const dt = getAppointmentDateTime(apt);
        const displayName = apt.name || "Unknown";
        const canJoin = status === "active";

        return (
          <article
            key={apt.slotId || apt.id || `${displayName}-${apt.date}`}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-shadow ${styles.card} ${
              canJoin ? "hover:shadow-md" : ""
            }`}
          >
            <PersonAvatar imageUrl={apt.imageUrl} name={displayName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#020e7c]">
                {personPrefix ? `${personPrefix} ` : ""}
                {displayName}
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                {apt.date ? formatAppointmentDate(apt.date) : dt?.toLocaleDateString()}{" "}
                · {apt.time ? formatTime(apt.time) : dt ? formatTime(dt.toTimeString().slice(0, 5)) : ""}
              </p>
              <span
                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
              >
                {styles.label}
              </span>
            </div>
            {canJoin ? (
              <button
                type="button"
                disabled={isJoiningId === apt.slotId}
                onClick={() => onJoin?.(apt)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#020e7c] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                <Video className="h-3.5 w-3.5" />
                {isJoiningId === apt.slotId ? "Joining…" : "Join"}
              </button>
            ) : status === "upcoming" ? (
              <p className="shrink-0 text-right text-[11px] text-gray-500">
                Opens 5 min
                <br />
                before start
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
