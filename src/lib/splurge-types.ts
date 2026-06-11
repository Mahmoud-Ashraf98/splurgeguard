import type { Subscription, TransactionMetadata } from "./schemas";

export type Currency = "VND" | "USD";
export type VaultStatus = "cooling" | "ready" | "approved" | "discarded";
export type TransactionStatus = "completed" | "frozen" | "rejected";

/** Ledger entry for savings withdrawals (impulse vs genuine emergency). */
export type RaidRecord =
  | {
      type: "impulse";
      amount_cents: number;
      justification: null;
      timestamp: string;
      cycle_id: string;
    }
  | {
      type: "emergency";
      amount_cents: number;
      justification: string;
      timestamp: string;
      cycle_id: string;
    };

export interface DailyContract {
  id: string;
  title: string;
  subtitle: string;
  reward: number;
  penalty: number;
  status: 'available' | 'secured' | 'yielded';
  iconType: string;
}

export interface UserState {
  userName: string;
  currentBalanceVND: number;
  essentialSpentVND: number;
  cycleStartDate: string;
  paydayDate: string;
  /** Gross take-home allocated to this cycle (integer currency units, same scale as VND). */
  total_income_cents: number;
  /** Fixed unavoidable costs for the cycle (same scale). */
  fixed_overhead_cents: number;
  /** Pay-yourself-first: amount pledged to savings this cycle. */
  savings_base_cents: number;
  /** Optional sweeps into savings (e.g. automated); net savings includes this. */
  savings_sweeps_cents: number;
  /** Cumulative withdrawn from savings back into the spending pool this cycle. */
  savings_raided_cents: number;
  raid_history: RaidRecord[];
  /** Stable id for the active budget cycle (raids, exports). */
  current_cycle_id: string;
  totalDP: number;
  lifetimeDP: number;
  currentLevel: number;
  ascensionXP: number;
  currentStreakDays: number;
  lastLoginDate: string;
  weeklyHabitLimitVND: number;
  targetHabit: string;
  usdExchangeRate: number;
  displayCurrency: Currency;
  dailyContracts: DailyContract[];
  lastContractRefreshDate: string;
  /** Set by migration when `total_income_cents` was inferred from legacy data — user should verify in Settings. */
  pyfIncomeInferred?: boolean;
  /** Local day key (YYYY-MM-DD) of the last breach penalty — the −25 DP / streak reset applies at most once per day. */
  lastBreachDate?: string;
  /** Smart Daily Limit snapshot per local day key, recorded once at first computation. Pruned to the most recent 30 days. */
  dailyLimitHistory?: Record<string, number>;
}

/** Alias for budget-cycle shape (same as `UserState`). */
export type CycleState = UserState;

export interface Transaction {
  id: string;
  timestamp: string;
  amountVND: number;
  originalAmount?: number;
  originalCurrency: Currency;
  category: string;
  isEssential: boolean;
  justification: string;
  fromVault: boolean;
  /** Ledger lifecycle. Omitted in legacy persisted data — treated as completed when read. */
  status?: TransactionStatus;
  /** Vault cooling deadline (ISO). Null for non-vault rows. */
  vault_expires_at?: string | Date | null;
  /** Canonical lifespan field. New transactions write this. */
  amortizeDays?: number;
  /** Legacy field (older entries) — readers fall back to this. */
  amortizationDays?: number;
  /** Parsed agent metadata (optional). Legacy rows rely on amortizeDays / amortizationDays only. */
  metadata?: TransactionMetadata;
}

export interface VaultItem {
  id: string;
  itemName: string;
  estimatedAmountVND: number;
  category: string;
  createdAt: string;
  delayHours: number;
  justification: string;
  status: VaultStatus;
  /** Frozen `Transaction` row created when the item enters the vault. */
  frozenTransactionId?: string;
  /** Set when the user discards an impulse (trophy room). */
  discardedAt?: string;
}

export interface Reward {
  id: string;
  archetypeId: string;
  emoji: string;
  title: string;
  costDP: number;
  createdAt: string;
  redeemedAt?: string;
  status: "active" | "redeemed";
}

export interface AppData {
  userState: UserState | null;
  transactions: Transaction[];
  vaultItems: VaultItem[];
  rewards: Reward[];
  /** Auto-pay subscriptions (local-first); merged with D1-backed loader data on /stats. */
  subscriptions: Subscription[];
  _isMigrationLoad?: boolean;
}

export const ESSENTIAL_CATEGORIES = [
  "Meat and chicken",
  "Other essential home groceries",
  "Motorbike expenses",
  "Rent",
  "Visa and documents fees",
  "Utilities, Phone & Internet",
  "Medical & Pharmacy",
  "Other Essentials",
];

export const DISCRETIONARY_CATEGORIES = [
  "Diet soda and bottled cold tea soft drinks",
  "Clothes",
  "Travelling",
  "Dining Out & Street Food",
  "Software & Digital Subscriptions",
  "Tech & Hardware Upgrades",
  "Fitness & Supplements",
  "Other Splurges",
];

export const ALL_CATEGORIES = [...ESSENTIAL_CATEGORIES, ...DISCRETIONARY_CATEGORIES];

export const isEssentialCategory = (cat: string) => ESSENTIAL_CATEGORIES.includes(cat);

export const STORAGE_KEY = "splurgeGuardData_v1";

export const DEFAULT_USD_EXCHANGE_RATE = 26310;

// NOTE: the single source of truth for rank/level progression is RANKS in
// src/lib/ranks.tsx (driven by ascensionXP). The legacy LEVELS table that
// previously lived here has been removed to avoid two diverging systems.
