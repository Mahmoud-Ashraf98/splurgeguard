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
