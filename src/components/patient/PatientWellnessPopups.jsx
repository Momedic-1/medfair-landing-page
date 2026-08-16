import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../env";
import { getId, getToken } from "../../utils";
import {
  getPeriodInsights,
  shouldShowPeriodReminder,
} from "../../utils/periodInsights";
import { notificationsGranted } from "../../utils/notificationPermission";
import { localTodayKey } from "../../utils/dailyHealthTipSchedule";
import { scheduleDailyHealthTipNotification } from "../../utils/dailyHealthTipNotifications";
import PeriodReminderModal from "./PeriodReminderModal";
import NotificationPermissionPrompt from "./NotificationPermissionPrompt";

const PERIOD_REMINDER_KEY = "medfair_period_reminder_popup_date";
const NOTIFICATION_PROMPT_SESSION = "medfair_notification_prompt_dismissed_session";

function todayKey() {
  return localTodayKey();
}

function wasShownToday(storageKey) {
  try {
    return localStorage.getItem(storageKey) === todayKey();
  } catch {
    return false;
  }
}

function markShownToday(storageKey) {
  try {
    localStorage.setItem(storageKey, todayKey());
  } catch {
    /* ignore */
  }
}

/** Period in-app popups + notification permission; daily health tips use system notifications. */
export default function PatientWellnessPopups() {
  const [periodInsights, setPeriodInsights] = useState(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    const patientId = getId();
    const token = getToken();
    if (!patientId || !token) return;

    let cancelled = false;

    const load = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/wellness/period-tracker/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled) return;

        const data = response?.data || {};
        const insights = getPeriodInsights({
          lastPeriodDate: data.lastPeriodDate,
          cycleLength: data.cycleLength,
          nextExpectedPeriod: data.nextExpectedPeriod,
        });
        setPeriodInsights(insights);

        if (
          insights &&
          shouldShowPeriodReminder(insights) &&
          !wasShownToday(PERIOD_REMINDER_KEY)
        ) {
          setShowPeriodModal(true);
        }
      } catch {
        /* period tracker optional */
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (notificationsGranted()) {
      const cleanup = scheduleDailyHealthTipNotification();
      return cleanup;
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (notificationsGranted()) return;
    if (sessionStorage.getItem(NOTIFICATION_PROMPT_SESSION) === "true") return;
    const timer = setTimeout(() => setShowNotificationPrompt(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const closePeriodModal = () => {
    markShownToday(PERIOD_REMINDER_KEY);
    setShowPeriodModal(false);
  };

  const closeNotificationPrompt = () => {
    sessionStorage.setItem(NOTIFICATION_PROMPT_SESSION, "true");
    setShowNotificationPrompt(false);
  };

  const onNotificationGranted = () => {
    sessionStorage.setItem(NOTIFICATION_PROMPT_SESSION, "true");
    scheduleDailyHealthTipNotification();
  };

  return (
    <>
      <NotificationPermissionPrompt
        open={showNotificationPrompt}
        onClose={closeNotificationPrompt}
        onGranted={onNotificationGranted}
      />
      <PeriodReminderModal
        open={showPeriodModal}
        onClose={closePeriodModal}
        insights={periodInsights}
      />
    </>
  );
}
