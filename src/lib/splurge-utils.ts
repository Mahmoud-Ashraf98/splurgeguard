import type { UserState, Transaction } from "./splurge-types";
import { getDaysSinceFrom } from "./dateUtils";

export const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

export const fmtUSD = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

export const fmtMoney = (vnd: number, currency: "VND" | "USD", rate: number) => {
  if (currency === "USD") return fmtUSD(vnd / rate);
  return fmtVND(vnd);
};

export const dayKey = (d: Date | string) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

export const daysBetween = (a: Date | string, b: Date | string) => {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  const ka = new Date(da.getFullYear(), da.getMonth(), da.getDate()).getTime();
  const kb = new Date(db.getFullYear(), db.getMonth(), db.getDate()).getTime();
  return Math.round((kb - ka) / 86400000);
};

/** Resolve a transaction's amortization lifespan in days, defaulting to 1. */
export const txLifespan = (tx: Transaction): number =>
  Math.max(1, tx.amortizeDays ?? tx.amortizationDays ?? 1);

const dateFromKey = (k: string) => new Date(`${k}T12:00:00`);

export const calcSmartDailyLimit = (us: UserState, today = new Date(), txs: Transaction[] = []) => {
  const daysUntilPayday = Math.max(1, daysBetween(today, us.paydayDate));
  const totalCycleDays = Math.max(1, daysBetween(us.cycleStartDate, us.paydayDate));
  const daysPassed = Math.max(0, daysBetween(us.cycleStartDate, today));
  const proximityWeighting = Math.min(1.2, 1.0 + 0.2 * (daysPassed / totalCycleDays));
  const totalUnAmortized = txs.reduce((sum, tx) => {
    const lifespan = txLifespan(tx);
    if (lifespan <= 1) return sum;
    const daysSince = (today.getTime() - new Date(tx.timestamp).getTime()) / 86400000;
    if (daysSince >= lifespan || daysSince < 0) return sum;
    return sum + tx.amountVND * (1 - daysSince / lifespan);
  }, 0);
  const virtualBalance = us.currentBalanceVND + totalUnAmortized;
  return Math.floor((virtualBalance / daysUntilPayday) * proximityWeighting);
};

const matchesHabit = (cat: string, habit?: string) =>
  !!habit && cat.toLowerCase().trim() === habit.toLowerCase().trim();

/**
 * Discretionary "spent on a given day" — counts the per-day slice of every
 * active amortization that overlaps that day. Habits and essentials excluded.
 */
export const discretionarySpentOn = (txs: Transaction[], dKey: string, targetHabit?: string) => {
  const anchor = dateFromKey(dKey);
  return txs.reduce((total, tx) => {
    if (tx.isEssential) return total;
    if (matchesHabit(tx.category, targetHabit)) return total;
    const lifespan = txLifespan(tx);
    const daysSince = getDaysSinceFrom(tx.timestamp, anchor);
    if (daysSince < 0 || daysSince >= lifespan) return total;
    return total + tx.amountVND / lifespan;
  }, 0);
};

/**
 * Habit spend over a sliding 7-day window ending today. Counts the per-day
 * slice for each of the last 7 days (inclusive) the transaction was active.
 */
export const weeklyHabitSpent = (txs: Transaction[], targetHabit: string, today = new Date()) => {
  const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return txs.reduce((total, tx) => {
    if (!matchesHabit(tx.category, targetHabit)) return total;
    const lifespan = txLifespan(tx);
    const dailySlice = tx.amountVND / lifespan;
    const daysSince = getDaysSinceFrom(tx.timestamp, anchor);
    if (daysSince < 0) return total;
    let overlappingDays = 0;
    for (let d = 0; d <= 6; d++) {
      if (d >= daysSince && d < daysSince + lifespan) overlappingDays++;
    }
    return total + dailySlice * overlappingDays;
  }, 0);
};

export const habitSpentLastNDays = (txs: Transaction[], targetHabit: string, days = 7, today = new Date()) => {
  const cutoff = today.getTime() - days * 86400000;
  return txs
    .filter((t) => matchesHabit(t.category, targetHabit) && new Date(t.timestamp).getTime() >= cutoff)
    .reduce((s, t) => s + t.amountVND, 0);
};

export const uuid = () =>
  (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2) + Date.now();

export const dpForAmount = (amountVND: number, category: string, fromVault: boolean, targetHabit?: string) => {
  if (matchesHabit(category, targetHabit) && !fromVault) return 0;
  if (amountVND < 50000) return 5;
  if (amountVND <= 200000) return 3;
  return 1;
};

export const milestoneBonus = (streak: number) => {
  if (streak === 3) return 100;
  if (streak === 7) return 300;
  if (streak === 14) return 750;
  return 0;
};

export const nextMilestone = (streak: number) => {
  if (streak < 3) return 3;
  if (streak < 7) return 7;
  if (streak < 14) return 14;
  return Math.ceil((streak + 1) / 7) * 7;
};
