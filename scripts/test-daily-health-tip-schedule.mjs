/**
 * Quick sanity checks for daily health tip 7 AM scheduling.
 * Run: node scripts/test-daily-health-tip-schedule.mjs
 */
import {
  HEALTH_TIP_HOUR,
  isPastHealthTipTime,
  localTodayKey,
  msUntilHealthTipTime,
} from "../src/utils/dailyHealthTipSchedule.js";

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

// Before 7 AM → should wait
const sixAm = new Date(2026, 5, 4, 6, 30, 0);
assert("6:30 AM is before tip time", !isPastHealthTipTime(sixAm));
assert("6:30 AM has positive delay", msUntilHealthTipTime(sixAm) === 30 * 60 * 1000);

// At 7 AM → should show
const sevenAm = new Date(2026, 5, 4, 7, 0, 0);
assert("7:00 AM is tip time", isPastHealthTipTime(sevenAm));
assert("7:00 AM has zero delay", msUntilHealthTipTime(sevenAm) === 0);

// After 7 AM → should show immediately
const nineAm = new Date(2026, 5, 4, 9, 15, 0);
assert("9:15 AM is past tip time", isPastHealthTipTime(nineAm));
assert("9:15 AM has zero delay", msUntilHealthTipTime(nineAm) === 0);

assert("local today key uses local date", localTodayKey(new Date(2026, 5, 4, 23, 0, 0)) === "2026-06-04");
assert("health tip hour is 7", HEALTH_TIP_HOUR === 7);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
