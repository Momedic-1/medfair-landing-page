export function canUseNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission() {
  if (!canUseNotifications()) return "unsupported";
  return Notification.permission;
}

export function notificationsGranted() {
  return getNotificationPermission() === "granted";
}

/** Browsers cannot force notification permission — this only opens the native prompt. */
export async function requestNotificationPermission() {
  if (!canUseNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}
