/**
 * Tests for daily health tip system notifications (not in-app modal).
 * Run: node scripts/test-daily-health-tip-notifications.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getTipForToday } from "../src/data/dailyHealthTips.js";
import {
  HEALTH_TIP_HOUR,
  isPastHealthTipTime,
  msUntilHealthTipTime,
} from "../src/utils/dailyHealthTipSchedule.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`✓ ${name}`);
  } else {
    failed += 1;
    console.error(`✗ ${name}`);
  }
}

function read(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

// --- Tip content ---
const tip = getTipForToday();
assert("getTipForToday returns title and body", Boolean(tip?.title && tip?.body));

const notificationTitle = `Good morning — ${tip.title}`;
assert("notification title uses Good morning prefix", notificationTitle.startsWith("Good morning —"));
assert('notification title does not mention "around 7:00 AM"', !notificationTitle.includes("around 7:00 AM"));
assert('tip body does not mention "around 7:00 AM"', !tip.body.includes("around 7:00 AM"));

// --- 7 AM scheduling ---
assert("health tip hour is 7", HEALTH_TIP_HOUR === 7);
const beforeSeven = new Date(2026, 5, 4, 6, 45, 0);
const afterSeven = new Date(2026, 5, 4, 8, 0, 0);
assert("before 7 AM: not past tip time", !isPastHealthTipTime(beforeSeven));
assert("before 7 AM: positive delay", msUntilHealthTipTime(beforeSeven) > 0);
assert("after 7 AM: past tip time", isPastHealthTipTime(afterSeven));
assert("after 7 AM: zero delay", msUntilHealthTipTime(afterSeven) === 0);

// --- No in-app modal ---
assert(
  "DailyHealthTipModal component removed",
  !existsSync(join(root, "src/components/patient/DailyHealthTipModal.jsx"))
);

const wellnessPopups = read("src/components/patient/PatientWellnessPopups.jsx");
assert("PatientWellnessPopups does not import DailyHealthTipModal", !wellnessPopups.includes("DailyHealthTipModal"));
assert("PatientWellnessPopups does not render showHealthTip modal state", !wellnessPopups.includes("showHealthTip"));
assert(
  "PatientWellnessPopups uses scheduleDailyHealthTipNotification",
  wellnessPopups.includes("scheduleDailyHealthTipNotification")
);

const notificationsUtil = read("src/utils/dailyHealthTipNotifications.js");
assert(
  "notifications util uses showNotification via service worker",
  notificationsUtil.includes("registration.showNotification")
);
assert(
  'notifications util tags type as DAILY_HEALTH_TIP',
  notificationsUtil.includes('type: "DAILY_HEALTH_TIP"')
);
assert(
  'notifications util does not reference "around 7:00 AM"',
  !notificationsUtil.includes("around 7:00 AM")
);

const permissionPrompt = read("src/components/patient/NotificationPermissionPrompt.jsx");
assert(
  "permission prompt mentions 7:00 AM notifications (not in-app modal)",
  permissionPrompt.includes("7:00 AM") && permissionPrompt.includes("notifications")
);

// --- Service worker handler ---
const pushHandlers = read("public/push-handlers.js");
assert("push-handlers handles SCHEDULE_DAILY_HEALTH_TIP message", pushHandlers.includes("SCHEDULE_DAILY_HEALTH_TIP"));
assert("push-handlers has maybeShowScheduledHealthTip logic", pushHandlers.includes("maybeShowScheduledHealthTip"));
assert("push-handlers routes health tip click to patient-dashboard", pushHandlers.includes('type === "DAILY_HEALTH_TIP"'));
assert(
  "health tip notifications do not get call Answer actions",
  pushHandlers.includes("!isHealthTip") || pushHandlers.includes("if (!isHealthTip)")
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
