/** Local hour (24h) when the daily health tip notification should appear. */
export const HEALTH_TIP_HOUR = 7;
export const HEALTH_TIP_MINUTE = 0;

export function localTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isPastHealthTipTime(date = new Date()) {
  const target = new Date(date);
  target.setHours(HEALTH_TIP_HOUR, HEALTH_TIP_MINUTE, 0, 0);
  return date.getTime() >= target.getTime();
}

/** Milliseconds until today's 7:00 AM local time, or 0 if already past. */
export function msUntilHealthTipTime(date = new Date()) {
  const target = new Date(date);
  target.setHours(HEALTH_TIP_HOUR, HEALTH_TIP_MINUTE, 0, 0);
  const diff = target.getTime() - date.getTime();
  return diff > 0 ? diff : 0;
}
