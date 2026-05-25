/** Shared appointment window: join from 5 min before until 45 min after start */

export function getAppointmentDateTime(appointment) {
  if (!appointment) return null;
  if (appointment.startTime) {
    return new Date(appointment.startTime);
  }
  if (appointment.date && appointment.time) {
    const time =
      String(appointment.time).length === 5
        ? `${appointment.time}:00`
        : appointment.time;
    return new Date(`${appointment.date}T${time}`);
  }
  return null;
}

export function getAppointmentStatus(appointment, now = new Date()) {
  const appointmentTime = getAppointmentDateTime(appointment);
  if (!appointmentTime || Number.isNaN(appointmentTime.getTime())) {
    return "unknown";
  }

  const minutesDiff = Math.floor(
    (now.getTime() - appointmentTime.getTime()) / 60000
  );

  if (minutesDiff > 45) return "over";
  if (minutesDiff >= -5 && minutesDiff <= 45) return "active";
  return "upcoming";
}

export const APPOINTMENT_STATUS_STYLES = {
  over: {
    card: "border-red-200 bg-red-50/80 opacity-70",
    badge: "bg-red-100 text-red-800",
    label: "Ended",
  },
  active: {
    card: "border-emerald-300 bg-emerald-50",
    badge: "bg-emerald-600 text-white",
    label: "Join now",
  },
  upcoming: {
    card: "border-blue-200 bg-blue-50/80",
    badge: "bg-blue-100 text-[#020e7c]",
    label: "Upcoming",
  },
  unknown: {
    card: "border-gray-200 bg-gray-50",
    badge: "bg-gray-100 text-gray-600",
    label: "Scheduled",
  },
};

export function sortAppointmentsByStatus(appointments, getStatus = getAppointmentStatus) {
  const order = { active: 0, upcoming: 1, over: 2, unknown: 3 };
  return [...(appointments || [])].sort((a, b) => {
    const sa = getStatus(a);
    const sb = getStatus(b);
    if (order[sa] !== order[sb]) return order[sa] - order[sb];
    const ta = getAppointmentDateTime(a)?.getTime() ?? 0;
    const tb = getAppointmentDateTime(b)?.getTime() ?? 0;
    return ta - tb;
  });
}
