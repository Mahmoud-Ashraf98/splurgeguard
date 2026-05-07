import type { UserState, Transaction } from "./splurge-types";

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

export const calcSmartDailyLimit = (us: UserState, today = new Date(), txs: Transaction[] = []) => {
  const daysUntilPayday = Math.max(1, daysBetween(today, us.paydayDate));
  const totalCycleDays = Math.max(1, daysBetween(us.cycleStartDate, us.paydayDate));
  const daysPassed = Math.max(0, daysBetween(us.cycleStartDate, today));
  const proximityWeighting = Math.min(1.2, 1.0 + 0.2 * (daysPassed / totalCycleDays));
  const totalUnAmortized = txs.reduce((sum, tx) => {
    if (!tx.amortizationDays || tx.amortizationDays <= 1) return sum;
    const daysSince = (today.getTime() - new Date(tx.timestamp).getTime()) / 86400000;
    if (daysSince >= tx.amortizationDays || daysSince < 0) return sum;
    return sum + tx.amountVND * (1 - daysSince / tx.amortizationDays);
  }, 0);
  const virtualBalance = us.currentBalanceVND + totalUnAmortized;
  return Math.floor((virtualBalance / daysUntilPayday) * proximityWeighting);
};

export const discretionarySpentOn = (txs: Transaction[], dKey: string) =>
  txs
    .filter(
      (t) =>
        !t.isEssential &&
        t.category !== "Weed" &&
        (!t.amortizationDays || t.amortizationDays <= 1) &&
        dayKey(t.timestamp) === dKey
    )
    .reduce((s, t) => s + t.amountVND, 0);

export const weeklyWeedSpent = (txs: Transaction[], today = new Date()) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dow = d.getDay();
  const diffToMonday = (dow + 6) % 7;
  const monday = new Date(d.getTime() - diffToMonday * 86400000);
  return txs
    .filter((t) => t.category === "Weed" && new Date(t.timestamp) >= monday)
    .reduce((s, t) => s + t.amountVND, 0);
};

export const uuid = () =>
  (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2) + Date.now();

export const dpForAmount = (amountVND: number, category: string, fromVault: boolean) => {
  if (category === "Weed" && !fromVault) return 0;
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
