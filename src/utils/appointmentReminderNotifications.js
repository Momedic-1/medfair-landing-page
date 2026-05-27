import { getAppointmentDateTime, getAppointmentStatus } from "./appointmentStatus";

const REMINDER_STORAGE_KEY = "appointmentReminderNotified";

const readNotified = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

const writeNotified = (set) => {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([...set].slice(-500)));
  } catch {
    // ignore storage errors
  }
};

async function showReminderNotification(title, body, url = "/") {
  try {
    if (!("Notification" in window)) return;
    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
    if (permission !== "granted") return;

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url, type: "APPOINTMENT_REMINDER" },
      });
      return;
    }

    new Notification(title, { body, icon: "/icons/icon-192.png" });
  } catch {
    // never break dashboard flow because of notification issues
  }
}

function reminderMessage(appointment, audience) {
  const dt = getAppointmentDateTime(appointment);
  const status = getAppointmentStatus(appointment);
  const counterpart =
    audience === "doctor"
      ? `${appointment?.patientFirstName || ""} ${appointment?.patientLastName || ""}`.trim() || "your patient"
      : `Dr. ${appointment?.doctorFirstName || ""} ${appointment?.doctorLastName || ""}`.trim() || "your doctor";

  if (status === "active") {
    return {
      title: "Appointment ready to join",
      body: `You can join now with ${counterpart}.`,
      kind: "active",
      at: dt,
    };
  }

  if (!dt) return null;
  const minutesToStart = Math.ceil((dt.getTime() - Date.now()) / 60000);
  if (minutesToStart > 10 || minutesToStart < 1) return null;
  return {
    title: "Appointment reminder",
    body: `Your appointment with ${counterpart} starts in ${minutesToStart} minute${minutesToStart > 1 ? "s" : ""}.`,
    kind: "soon",
    at: dt,
  };
}

export async function notifyAppointmentReminders({ appointments = [], audience = "patient", url }) {
  if (!Array.isArray(appointments) || appointments.length === 0) return;
  const notified = readNotified();

  for (const appointment of appointments) {
    const slotId = appointment?.slotId ?? appointment?.id;
    const reminder = reminderMessage(appointment, audience);
    if (!slotId || !reminder?.at) continue;

    const key = `${audience}:${slotId}:${reminder.kind}:${reminder.at.toISOString()}`;
    if (notified.has(key)) continue;

    await showReminderNotification(reminder.title, reminder.body, url);
    notified.add(key);
  }

  writeNotified(notified);
}

