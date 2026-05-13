// Timezone-safe day-difference helper.
// Returns the integer number of days between today (00:00 local) and `date`.
// Negative for future dates.
export const getDaysSince = (date: string | Date): number => {
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const dateMs = new Date(date).setHours(0, 0, 0, 0);
  const diff = todayMs - dateMs;
  if (diff < 0) return -1;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Generic variant that lets callers pass an explicit "today" anchor (also at 00:00 local).
export const getDaysSinceFrom = (date: string | Date, anchor: Date): number => {
  const anchorMs = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate()).getTime();
  const dateMs = new Date(date).setHours(0, 0, 0, 0);
  const diff = anchorMs - dateMs;
  if (diff < 0) return -1;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/** Parse HTML date `YYYY-MM-DD` as local end-of-day and return UTC ISO (avoids implicit UTC parsing). */
export function paydayInputToIsoEndOfLocalDay(dateStr: string): string {
  const parts = dateStr.split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return new Date().toISOString();
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

/** True when the chosen payday (local calendar) is strictly after today (local). */
export function isPaydayStrictlyInFuture(dateStr: string): boolean {
  const parts = dateStr.split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return false;
  const [y, m, d] = parts;
  const p = new Date(y, m - 1, d);
  p.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return p.getTime() > t.getTime();
}
