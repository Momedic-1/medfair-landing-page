export function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatPeriodDate(date) {
  return (
    date?.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) || "-"
  );
}

/**
 * Roll last period forward by cycle length until the next expected date is today or later
 * (matches backend PeriodTrackerService.computeNextExpectedPeriod).
 */
export function computeNextExpectedPeriod(lastPeriodDate, cycleLength = 28) {
  const lastDate = toDate(lastPeriodDate);
  if (!lastDate) return null;
  const cycle = Number(cycleLength) >= 20 && Number(cycleLength) <= 40 ? Number(cycleLength) : 28;
  let candidate = addDays(lastDate, cycle);
  const today = startOfDay(new Date());
  while (startOfDay(candidate).getTime() < today.getTime()) {
    candidate = addDays(candidate, cycle);
  }
  return candidate;
}

export function getPeriodInsights({ lastPeriodDate, cycleLength = 28, nextExpectedPeriod }) {
  const nextPeriod =
    toDate(nextExpectedPeriod) || computeNextExpectedPeriod(lastPeriodDate, cycleLength);
  if (!nextPeriod) return null;

  const fertileStart = addDays(nextPeriod, -14);
  const fertileEnd = addDays(fertileStart, 5);
  const daysUntilNext = Math.ceil(
    (startOfDay(nextPeriod).getTime() - startOfDay(new Date()).getTime()) / 86_400_000
  );

  return { nextPeriod, fertileStart, fertileEnd, daysUntilNext };
}

/** Show popup when period is within this many days (including today). Matches backend REMINDER_LEAD_DAYS. */
export const PERIOD_REMINDER_LEAD_DAYS = 3;

export function shouldShowPeriodReminder(
  insights,
  withinDays = PERIOD_REMINDER_LEAD_DAYS,
) {
  if (!insights) return false;
  return insights.daysUntilNext >= 0 && insights.daysUntilNext <= withinDays;
}
