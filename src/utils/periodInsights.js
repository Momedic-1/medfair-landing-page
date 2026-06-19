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

export function getPeriodInsights({ lastPeriodDate, cycleLength = 28 }) {
  const lastDate = toDate(lastPeriodDate);
  if (!lastDate) return null;

  const nextPeriod = addDays(lastDate, Number(cycleLength || 28));
  const fertileStart = addDays(nextPeriod, -14);
  const fertileEnd = addDays(fertileStart, 5);
  const daysUntilNext = Math.ceil(
    (startOfDay(nextPeriod).getTime() - startOfDay(new Date()).getTime()) /
      86_400_000
  );

  return { nextPeriod, fertileStart, fertileEnd, daysUntilNext };
}

/** Show popup when period is within this many days (including today). */
export function shouldShowPeriodReminder(insights, withinDays = 3) {
  if (!insights) return false;
  return insights.daysUntilNext >= 0 && insights.daysUntilNext <= withinDays;
}
