import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../env";
import { getTipForToday } from "../../data/dailyHealthTips";
import { getId, getToken } from "../../utils";
import {
  getPeriodInsights,
  shouldShowPeriodReminder,
} from "../../utils/periodInsights";
import { notificationsGranted } from "../../utils/notificationPermission";
import { localTodayKey, scheduleDailyHealthTip } from "../../utils/dailyHealthTipSchedule";
import DailyHealthTipModal from "./DailyHealthTipModal";
import PeriodReminderModal from "./PeriodReminderModal";
import NotificationPermissionPrompt from "./NotificationPermissionPrompt";

const HEALTH_TIP_KEY = "medfair_daily_health_tip_date";
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

/** Orchestrates wellness popups: notifications prompt, daily tip, period reminder. */
export default function PatientWellnessPopups() {
  const [periodInsights, setPeriodInsights] = useState(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showHealthTip, setShowHealthTip] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const dailyTip = getTipForToday();

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
    if (notificationsGranted()) return;
    if (sessionStorage.getItem(NOTIFICATION_PROMPT_SESSION) === "true") return;
    const timer = setTimeout(() => setShowNotificationPrompt(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = scheduleDailyHealthTip({
      onShow: () => setShowHealthTip(true),
      wasShownToday: () => wasShownToday(HEALTH_TIP_KEY),
    });
    return cleanup;
  }, []);

  const closePeriodModal = () => {
    markShownToday(PERIOD_REMINDER_KEY);
    setShowPeriodModal(false);
  };

  const closeHealthTip = () => {
    markShownToday(HEALTH_TIP_KEY);
    setShowHealthTip(false);
  };

  const closeNotificationPrompt = () => {
    sessionStorage.setItem(NOTIFICATION_PROMPT_SESSION, "true");
    setShowNotificationPrompt(false);
  };

  return (
    <>
      <NotificationPermissionPrompt
        open={showNotificationPrompt}
        onClose={closeNotificationPrompt}
        onGranted={() => sessionStorage.setItem(NOTIFICATION_PROMPT_SESSION, "true")}
      />
      <DailyHealthTipModal open={showHealthTip} onClose={closeHealthTip} tip={dailyTip} />
      <PeriodReminderModal
        open={showPeriodModal}
        onClose={closePeriodModal}
        insights={periodInsights}
      />
    </>
  );
}
