import type { Transaction } from "./splurge-types";
import { txIsCompleted } from "./splurge-utils";

export const MS_PER_DAY = 86_400_000;

/** Composite idempotency key: category (merchant proxy) + amount + minute + spread window. */
export function buildIdempotencyKey(tx: Transaction): string {
  const minuteTimestamp = new Date(tx.timestamp).toISOString().slice(0, 16);
  const metaSpread = tx.metadata?.amortization_schedule?.spread_days;
  const legacy = tx.amortizeDays ?? tx.amortizationDays;
  const spreadDays =
    typeof metaSpread === "number" && metaSpread > 0
      ? metaSpread
      : typeof legacy === "number" && legacy > 1
        ? legacy
        : 0;
  return `${tx.category}:${tx.amountVND}:${minuteTimestamp}:${spreadDays}`;
}

export function buildIdempotencyKeyFromPending(
  input: { category: string; amountVND: number; amortizationDays?: number },
  timestampIso: string,
): string {
  const spreadDays =
    input.amortizationDays && input.amortizationDays > 1 ? Math.floor(input.amortizationDays) : 0;
  const minuteTimestamp = new Date(timestampIso).toISOString().slice(0, 16);
  return `${input.category}:${input.amountVND}:${minuteTimestamp}:${spreadDays}`;
}

/**
 * Validates agent-shaped metadata schedules, or legacy spread tags (amortizeDays) with timestamp.
 * spread_days === 0 is always rejected.
 */
export function validateAmortization(tx: Transaction): boolean {
  const sched = tx.metadata?.amortization_schedule;
  if (sched) {
    const hasValidDays =
      typeof sched.spread_days === "number" &&
      Number.isInteger(sched.spread_days) &&
      sched.spread_days > 0;

    const hasValidDate =
      typeof sched.amortization_start_date === "string" &&
      !Number.isNaN(Date.parse(sched.amortization_start_date));

    if (!hasValidDays || !hasValidDate) {
      console.error("[AMORTIZATION VALIDATION] Malformed schedule rejected:", tx.id, sched);
      return false;
    }
    return true;
  }

  const legacyDays = tx.amortizeDays ?? tx.amortizationDays;
  const hasLegacyDays =
    typeof legacyDays === "number" && Number.isInteger(legacyDays) && legacyDays > 1;
  const hasLegacyTs =
    typeof tx.timestamp === "string" && !Number.isNaN(Date.parse(tx.timestamp));

  if (!hasLegacyDays) return false;
  if (!hasLegacyTs) {
    console.error("[AMORTIZATION VALIDATION] Malformed legacy schedule rejected:", tx.id);
    return false;
  }
  return true;
}

function amortizationWindow(tx: Transaction): { startMs: number; expiryMs: number; spreadDays: number } | null {
  if (!validateAmortization(tx)) return null;
  const sched = tx.metadata?.amortization_schedule;
  if (sched) {
    const startMs = Date.parse(sched.amortization_start_date);
    return { startMs, expiryMs: startMs + sched.spread_days * MS_PER_DAY, spreadDays: sched.spread_days };
  }
  const days = tx.amortizeDays ?? tx.amortizationDays!;
  const startMs = Date.parse(tx.timestamp);
  return { startMs, expiryMs: startMs + days * MS_PER_DAY, spreadDays: days };
}

export function getActiveAmortizations(transactions: Transaction[]): Transaction[] {
  const now = Date.now();

  const valid = transactions.filter((tx) => {
    if (!txIsCompleted(tx)) return false;
    if (tx.metadata?.is_recurring_subscription === true) return false;
    if (!validateAmortization(tx)) return false;

    const win = amortizationWindow(tx);
    if (!win) return false;

    if (win.startMs > now) {
      console.warn("[AMORTIZATION] Future start date rejected:", tx.id);
      return false;
    }

    return now < win.expiryMs;
  });

  const seen = new Map<string, Transaction>();
  for (const tx of valid) {
    const win = amortizationWindow(tx)!;
    const dedupeKey = `${tx.category}:${tx.amountVND}:${win.spreadDays}`;

    const existing = seen.get(dedupeKey);
    if (!existing || Date.parse(tx.timestamp) > Date.parse(existing.timestamp)) {
      seen.set(dedupeKey, tx);
    }
  }

  return Array.from(seen.values());
}

export function getDailyDrain(tx: Transaction): number {
  const sched = tx.metadata?.amortization_schedule;
  const legacy = tx.amortizeDays ?? tx.amortizationDays;
  const spread = sched?.spread_days ?? (typeof legacy === "number" && legacy > 1 ? legacy : 0);
  if (!spread || spread <= 0) return 0;
  return tx.amountVND / spread;
}

export function getRemainingDays(tx: Transaction): number {
  const sched = tx.metadata?.amortization_schedule;
  const legacy = tx.amortizeDays ?? tx.amortizationDays;
  const spreadDays =
    sched?.spread_days ?? (typeof legacy === "number" && legacy > 1 ? legacy : 0);
  if (!spreadDays) return 0;
  const startIso = sched?.amortization_start_date ?? tx.timestamp;
  const elapsed = Math.floor((Date.now() - Date.parse(startIso)) / MS_PER_DAY);
  return Math.max(0, spreadDays - elapsed);
}
