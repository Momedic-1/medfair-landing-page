import { getTipForToday } from "../data/dailyHealthTips";
import {
  HEALTH_TIP_HOUR,
  HEALTH_TIP_MINUTE,
  isPastHealthTipTime,
  localTodayKey,
  msUntilHealthTipTime,
} from "./dailyHealthTipSchedule";
import { notificationsGranted } from "./notificationPermission";

const HEALTH_TIP_KEY = "medfair_daily_health_tip_date";

export function wasHealthTipNotifiedToday() {
  try {
    return localStorage.getItem(HEALTH_TIP_KEY) === localTodayKey();
  } catch {
    return false;
  }
}

export function markHealthTipNotifiedToday() {
  try {
    localStorage.setItem(HEALTH_TIP_KEY, localTodayKey());
  } catch {
    /* ignore */
  }
}

function formatNotificationTitle(tip) {
  return `Good morning — ${tip.title}`;
}

/** Show today's health tip as a system notification (lock screen / notification shade). */
export async function showDailyHealthTipNotification(tip = getTipForToday()) {
  if (!tip || wasHealthTipNotifiedToday()) return false;
  if (!notificationsGranted()) return false;

  const title = formatNotificationTitle(tip);
  const body = tip.body;

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: `daily-health-tip-${localTodayKey()}`,
        data: { url: "/patient-dashboard", type: "DAILY_HEALTH_TIP" },
      });
    } else {
      new Notification(title, { body, icon: "/icons/icon-192.png" });
    }
    markHealthTipNotifiedToday();
    await syncHealthTipScheduleWithServiceWorker(tip);
    return true;
  } catch {
    return false;
  }
}

/** Persist schedule in the service worker so a tip can fire when the app is in the background. */
export async function syncHealthTipScheduleWithServiceWorker(tip = getTipForToday()) {
  if (!("serviceWorker" in navigator) || !tip) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const payload = {
      dateKey: localTodayKey(),
      title: formatNotificationTitle(tip),
      body: tip.body,
      hour: HEALTH_TIP_HOUR,
      minute: HEALTH_TIP_MINUTE,
      shownDateKey: wasHealthTipNotifiedToday() ? localTodayKey() : null,
    };

    registration.active?.postMessage({
      type: "SCHEDULE_DAILY_HEALTH_TIP",
      payload,
    });

    if ("periodicSync" in registration) {
      try {
        await registration.periodicSync.register("daily-health-tip", {
          minInterval: 12 * 60 * 60 * 1000,
        });
      } catch {
        /* periodic sync requires permission and installed PWA on some browsers */
      }
    }
  } catch {
    /* never break app flow */
  }
}

/**
 * Schedule today's health tip notification at 7:00 AM local time.
 * Uses a system notification — not an in-app modal.
 */
export function scheduleDailyHealthTipNotification() {
  if (wasHealthTipNotifiedToday()) return () => {};

  const tip = getTipForToday();
  syncHealthTipScheduleWithServiceWorker(tip);

  const fire = async () => {
    if (!isPastHealthTipTime() || wasHealthTipNotifiedToday()) return;
    await showDailyHealthTipNotification(tip);
  };

  const delay = msUntilHealthTipTime();
  if (delay === 0) {
    fire();
    return () => {};
  }

  const timer = setTimeout(fire, delay);
  return () => clearTimeout(timer);
}
