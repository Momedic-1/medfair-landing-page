import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  buildCancellationReason,
  CANCELLATION_REASON_OPTIONS,
} from "../../utils/cancelAppointment";
import { formatAppointmentDate, formatTime } from "../../utils";
import { getAppointmentDateTime } from "../../utils/appointmentStatus";

export default function CancelAppointmentModal({
  open,
  appointment,
  audience = "patient",
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const [preset, setPreset] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (open) {
      setPreset("");
      setDetails("");
    }
  }, [open, appointment?.slotId]);

  if (!open || !appointment) return null;

  const dt = getAppointmentDateTime(appointment);
  const counterpart =
    audience === "doctor" ? appointment.name || "the patient" : appointment.name || "your clinician";
  const reasonText = buildCancellationReason(preset, details);
  const reasonValid = preset && (preset !== "other" || details.trim().length >= 3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonValid) return;
    onConfirm?.(reasonText);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-appointment-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 id="cancel-appointment-title" className="text-lg font-semibold text-[#020e7c]">
              Cancel appointment
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              With {audience === "doctor" ? "" : "Dr. "}
              {counterpart}
              {dt ? (
                <>
                  {" "}
                  · {formatAppointmentDate(appointment.date) || dt.toLocaleDateString()} at{" "}
                  {appointment.time ? formatTime(appointment.time) : formatTime(dt.toTimeString().slice(0, 5))}
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong>{audience === "doctor" ? "The patient" : "Your doctor"}</strong> will see the reason
            you provide. Cancellations are not allowed within 20 minutes of start time or after the
            clinician has joined.
          </div>

          <div>
            <label htmlFor="cancel-reason-preset" className="mb-1.5 block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="cancel-reason-preset"
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-[#020e7c] focus:outline-none focus:ring-1 focus:ring-[#020e7c]"
              required
            >
              <option value="">Select a reason…</option>
              {CANCELLATION_REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cancel-reason-details" className="mb-1.5 block text-sm font-medium text-gray-700">
              {preset === "other" ? "Please describe" : "Additional details (optional)"}
            </label>
            <textarea
              id="cancel-reason-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                preset === "other"
                  ? "At least 3 characters…"
                  : "Optional context for the other party"
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#020e7c] focus:outline-none focus:ring-1 focus:ring-[#020e7c]"
              required={preset === "other"}
              minLength={preset === "other" ? 3 : 0}
              maxLength={500}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Keep appointment
            </button>
            <button
              type="submit"
              disabled={!reasonValid || isSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isSubmitting ? "Cancelling…" : "Confirm cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
