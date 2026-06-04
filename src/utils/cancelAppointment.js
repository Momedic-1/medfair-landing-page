import axios from "axios";
import { baseUrl } from "../env";
import { getAppointmentDateTime } from "./appointmentStatus";

const CANCEL_LOCK_MINUTES = 20;

export const CANCELLATION_REASON_OPTIONS = [
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "feeling_better", label: "Feeling better / no longer need visit" },
  { value: "found_another_provider", label: "Found another provider" },
  { value: "technical_issues", label: "Technical issues" },
  { value: "other", label: "Other (describe below)" },
];

export function buildCancellationReason(preset, details) {
  if (preset === "other") {
    return (details || "").trim();
  }
  const option = CANCELLATION_REASON_OPTIONS.find((o) => o.value === preset);
  const base = option ? option.label : preset;
  const extra = (details || "").trim();
  return extra ? `${base}: ${extra}` : base;
}

export function canCancelAppointment(appointment, now = new Date()) {
  if (!appointment) return false;
  if (appointment.canCancel === true) return true;
  if (appointment.canCancel === false) return false;

  const dt = getAppointmentDateTime(appointment);
  if (!dt) return false;
  const minutesUntil = (dt.getTime() - now.getTime()) / 60000;
  return minutesUntil > CANCEL_LOCK_MINUTES;
}

export async function cancelAppointment({ slotId, userId, reason, token }) {
  const response = await axios.post(
    `${baseUrl}/api/appointments/slots/${slotId}/cancel`,
    { reason },
    {
      params: { userId },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export { parseCancelError } from "./parseApiError";
