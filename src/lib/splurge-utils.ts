import type { UserState, Transaction } from "./splurge-types";
import type { Subscription } from "./schemas";
import { getDaysSinceFrom } from "./dateUtils";

/** Sum of active subscriptions expressed as an equivalent monthly total (integer minor units / VND). */
export function calculateSubscriptionMonthlyTotalCents(subs: Subscription[]): number {
  return subs
    .filter((s) => s.isActive)
    .reduce((total, sub) => {
      const monthlyEquivalent =
        sub.billingCycle === "yearly" ? Math.round(sub.amountCents / 12) : sub.amountCents;
      return total + monthlyEquivalent;
    }, 0);
}

/** Dailyized subscription overhead from the monthly equivalent (integer VND, rounded). */
export function subscriptionDailyOverheadVND(subs: Subscription[] | undefined): number {
  const monthly = calculateSubscriptionMonthlyTotalCents(subs ?? []);
  return Math.round(monthly / 30);
}

/** Aggregations and spend curves only include settled (completed) rows. */
export const txIsCompleted = (t: Transaction): boolean => (t.status ?? "completed") === "completed";

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

/** Hard allowance: flexible pool ÷ days until payday (midnight / streak settlement). */
export const calcBaseDailyAllowance = (us: UserState, today = new Date()) => {
  const daysUntilPayday = Math.max(1, daysBetween(today, us.paydayDate));
  return Math.floor(us.currentBalanceVND / daysUntilPayday);
};

/** Sum of vault amounts still frozen whose commitment `timestamp` falls on this local day. */
export const sumFrozenTransactionsToday = (txs: Transaction[], today = new Date()) => {
  const key = dayKey(today);
  return txs
    .filter((t) => (t.status ?? "completed") === "frozen" && dayKey(new Date(t.timestamp)) === key)
    .reduce((s, t) => s + t.amountVND, 0);
};

/** UI daily cap: base allowance minus today's frozen vault totals. */
export const calcVisualDailyAllowance = (us: UserState, today: Date, txs: Transaction[]) =>
  Math.max(0, calcBaseDailyAllowance(us, today) - sumFrozenTransactionsToday(txs, today));

// SUBSCRIPTION AMOUNTS ARE HANDLED IN OVERHEAD PHASE ONLY.
// DO NOT deduct subscription amounts from current_flexible_pool or daily_allowance.
// Subscription overhead reduces only the derived smart daily cap below; it is not mixed into discretionarySpentOn.

export const calcSmartDailyLimit = (
  us: UserState,
  today = new Date(),
  txs: Transaction[] = [],
  subscriptionDailyOverheadVND = 0,
) => Math.max(0, calcVisualDailyAllowance(us, today, txs) - subscriptionDailyOverheadVND);

const matchesHabit = (cat: string, habit?: string) =>
  !!habit && cat.toLowerCase().trim() === habit.toLowerCase().trim();

/**
 * Discretionary "spent on a given day" — counts the per-day slice of every
 * active amortization that overlaps that day. Habits and essentials excluded.
 */
export const discretionarySpentOn = (txs: Transaction[], dKey: string, targetHabit?: string) => {
  const anchor = dateFromKey(dKey);
  return txs.reduce((total, tx) => {
    if (!txIsCompleted(tx)) return total;
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
    if (!txIsCompleted(tx)) return total;
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
    .filter(
      (t) =>
        txIsCompleted(t) &&
        matchesHabit(t.category, targetHabit) &&
        new Date(t.timestamp).getTime() >= cutoff,
    )
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
