import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { formatTime } from "../../utils";
import { formatAppointmentDate } from "../../utils";
import { getAppointmentDateTime } from "../../utils/appointmentStatus";

export default function UpcomingAppointmentJoinModal({
  open,
  appointment,
  counterpartLabel = "your specialist",
  onDismiss,
  onJoin,
  isJoining,
  variant = "reminder",
}) {
  if (!open || !appointment) return null;

  const dt = getAppointmentDateTime(appointment);
  const dateText = appointment.date
    ? formatAppointmentDate(appointment.date)
    : dt
      ? dt.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "";
  const timeText = appointment.time
    ? formatTime(appointment.time)
    : dt
      ? formatTime(dt.toTimeString().slice(0, 5))
      : "";

  const name =
    appointment.name ||
    appointment.patientName ||
    appointment.doctorName ||
    counterpartLabel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <LiaPhoneVolumeSolid className="text-3xl text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {variant === "active" ? "Your consultation is ready" : "Appointment starting soon"}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {variant === "active"
              ? `Join your video call with ${name}.`
              : `Your appointment with ${name} starts in about 5 minutes.`}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
            {dateText && <span>📅 {dateText}</span>}
            {timeText && <span>⏰ {timeText}</span>}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onJoin}
            disabled={isJoining}
            className="rounded-lg bg-[#020e7c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {isJoining ? "Joining…" : "Join in new tab"}
          </button>
        </div>
      </div>
    </div>
  );
}
