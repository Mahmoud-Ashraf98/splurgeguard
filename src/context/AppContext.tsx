import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  AppData,
  STORAGE_KEY,
  Transaction,
  UserState,
  VaultItem,
  Reward,
  isEssentialCategory,
  levelForLifetimeDP,
  DEFAULT_USD_EXCHANGE_RATE,
} from "@/lib/splurge-types";
import {
  advanceBillingDate,
  applyWithdrawFromSavingsState,
  calcBaseDailyAllowance,
  calcSmartDailyLimit,
  dayKey,
  daysBetween,
  discretionarySpentOn,
  dpForAmount,
  isoWeekKey,
  milestoneBonus,
  mostRecentMonday,
  subscriptionDailyOverheadVND,
  txIsCompleted,
  uuid,
} from "@/lib/splurge-utils";
import { buildIdempotencyKey, buildIdempotencyKeyFromPending } from "@/lib/amortization";
import { transactionMetadataSchema } from "@/lib/schemas";
import { RANKS, getRankForXP } from "@/lib/ranks";
import { generateDailyContracts } from "@/lib/contracts";

interface BreachInfo {
  amountVND: number;
  limitVND: number;
}

interface AppContextValue {
  data: AppData;
  initUser: (us: {
    userName: string;
    total_income_cents: number;
    fixed_overhead_cents: number;
    savings_base_cents: number;
    currentBalanceVND: number;
    paydayDate: string;
    targetHabit: string;
    weeklyHabitLimitVND: number;
    usdExchangeRate?: number;
    displayCurrency?: "VND" | "USD";
  }) => void;
  withdrawFromSavings: (
    amountCents: number,
    type: "impulse" | "emergency",
    justification: string | null,
    options?: { onSuccess?: () => void },
  ) => void;
  startNewCycle: () => void;
  updateUserState: (patch: Partial<UserState>) => void;
  logExpense: (input: {
    amountVND: number;
    originalAmount?: number;
    originalCurrency: "VND" | "USD";
    category: string;
    justification: string;
    fromVault?: boolean;
    vaultId?: string;
    amortizationDays?: number;
  }) => boolean;
  addToVault: (input: Omit<VaultItem, "id" | "createdAt" | "status">) => void;
  markVaultReady: (id: string) => void;
  approveVault: (id: string) => void;
  discardVault: (id: string) => void;
  spendDP: (amount: number) => void;
  deleteVaultItem: (id: string) => void;
  deleteTransaction: (id: string) => void;
  importData: (json: string) => boolean;
  clearData: () => void;
  toggleCurrency: () => void;
  smartDailyLimit: number;
  todayDiscretionary: number;
  breach: BreachInfo | null;
  clearBreach: () => void;
  // Rewards / Exchange
  createReward: (r: Omit<Reward, "id" | "createdAt" | "status">) => void;
  redeemReward: (id: string) => "success" | "insufficient_dp" | "not_found";
  deleteReward: (rewardId: string) => void;
  // Ascension Protocol
  pendingAscension: number | null;
  clearPendingAscension: () => void;
  // Storage write-lock (set when localStorage quota is exhausted)
  storageLocked: boolean;
  pruneTransactionsOlderThan: (days: number) => void;
  pruneDiscardedVaultItems: () => void;
}

const defaultData: AppData = {
  userState: null,
  transactions: [],
  vaultItems: [],
  rewards: [],
  subscriptions: [],
};

const Ctx = createContext<AppContextValue | null>(null);

const migrate = (parsed: AppData): AppData => {
  const data: AppData = { ...defaultData, ...parsed };
  if (!Array.isArray(data.rewards)) data.rewards = [];
  if (!Array.isArray(data.subscriptions)) data.subscriptions = [];
  if (data.userState) {
    const us = data.userState as any;
    if (typeof us.lifetimeDP !== "number") us.lifetimeDP = us.totalDP ?? 0;
    if (typeof us.currentLevel !== "number") us.currentLevel = levelForLifetimeDP(us.lifetimeDP).level;
    // Ascension Protocol migration
    if (typeof us.ascensionXP !== "number") {
      const seededXP = us.totalDP ?? 0;
      const actualLevel = [...RANKS].reverse().find((r) => seededXP >= r.threshold)?.level ?? 1;
      us.ascensionXP = seededXP;
      us.currentLevel = actualLevel;
      data._isMigrationLoad = true;
    }
    // Daily Protocol migration
    if (!Array.isArray(us.dailyContracts)) us.dailyContracts = [];
    if (typeof us.lastContractRefreshDate !== "string") us.lastContractRefreshDate = "";
    // Weekly habit reward — seed with current ISO week so legacy users don't
    // retroactively claim past Mondays on first migration load.
    if (typeof us.lastWeeklyHabitRewardWeek !== "string") {
      us.lastWeeklyHabitRewardWeek = isoWeekKey(new Date());
    }
    // Pay-yourself-first (PYF) migration
    if (typeof us.total_income_cents !== "number") {
      const cycleStart = new Date(us.cycleStartDate as string);
      cycleStart.setHours(0, 0, 0, 0);
      const c0 = cycleStart.getTime();
      const totalFunSpent = (data.transactions ?? []).reduce((sum, t) => {
        if (!txIsCompleted(t) || t.isEssential) return sum;
        const txDate = new Date(t.timestamp);
        txDate.setHours(0, 0, 0, 0);
        if (txDate.getTime() < c0) return sum;
        return sum + Math.abs(t.amountVND ?? 0);
      }, 0);
      us.total_income_cents = (us.currentBalanceVND ?? 0) + totalFunSpent;
      us.pyfIncomeInferred = true;
    } else if (typeof us.pyfIncomeInferred !== "boolean") {
      us.pyfIncomeInferred = false;
    }
    if (typeof us.fixed_overhead_cents !== "number") us.fixed_overhead_cents = 0;
    if (typeof us.savings_base_cents !== "number") us.savings_base_cents = 0;
    if (typeof us.savings_sweeps_cents !== "number") us.savings_sweeps_cents = 0;
    if (typeof us.savings_raided_cents !== "number") us.savings_raided_cents = 0;
    if (!Array.isArray(us.raid_history)) us.raid_history = [];
    if (typeof us.current_cycle_id !== "string" || !us.current_cycle_id) us.current_cycle_id = uuid();
    data.userState = us as UserState;
  }
  if (Array.isArray(data.transactions)) {
    for (const t of data.transactions) {
      if (t.status === undefined) t.status = "completed";
      if (t.vault_expires_at === undefined) t.vault_expires_at = null;
    }
  }
  if (Array.isArray(data.vaultItems) && Array.isArray(data.transactions)) {
    for (const v of data.vaultItems) {
      if (v.frozenTransactionId) continue;
      if (v.status !== "cooling" && v.status !== "ready") continue;
      const txId = uuid();
      const coldEnd = new Date(new Date(v.createdAt).getTime() + v.delayHours * 3600000).toISOString();
      const frozenTx: Transaction = {
        id: txId,
        timestamp: v.createdAt,
        amountVND: v.estimatedAmountVND,
        originalCurrency: "VND",
        category: v.category,
        isEssential: false,
        justification: v.justification || v.itemName,
        fromVault: true,
        status: "frozen",
        vault_expires_at: coldEnd,
      };
      data.transactions.unshift(frozenTx);
      (v as VaultItem).frozenTransactionId = txId;
    }
  }
  return data;
};

const load = (): AppData => {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.userState && !(parsed.userState as any).targetHabit) {
      localStorage.removeItem(STORAGE_KEY);
      return defaultData;
    }
    return migrate(parsed);
  } catch {
    return defaultData;
  }
};

/**
 * Persist `AppData` to localStorage. Returns `false` when the browser refuses
 * the write (most commonly a `QuotaExceededError`), in which case the caller
 * MUST engage the global storage write-lock — see Task 4 in the remediation
 * doc. The in-memory state has already mutated by the time this runs; the
 * write-lock prevents further mutations from widening the desync.
 */
const save = (d: AppData): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
};

// Apply DP gain to totalDP, lifetimeDP, and ascensionXP (only positive gains accumulate).
const applyDPGain = (us: UserState, gain: number): UserState => ({
  ...us,
  totalDP: us.totalDP + gain,
  lifetimeDP: us.lifetimeDP + Math.max(0, gain),
  ascensionXP: (us.ascensionXP ?? 0) + Math.max(0, gain),
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [breach, setBreach] = useState<BreachInfo | null>(null);
  const [pendingAscension, setPendingAscension] = useState<number | null>(null);
  const [storageLocked, setStorageLocked] = useState(false);
  const dailyCheckRan = useRef(false);
  const notifiedReadyRef = useRef<Set<string>>(new Set());
  const storageLockedRef = useRef(false);

  useEffect(() => {
    storageLockedRef.current = storageLocked;
  }, [storageLocked]);

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const ok = save(data);
    if (ok) {
      if (storageLocked) {
        setStorageLocked(false);
        toast.dismiss("storage-quota-error");
        toast.success("Storage cleared. Write-lock released.");
      }
    } else {
      if (!storageLocked) {
        setStorageLocked(true);
        try {
          toast.error(
            "DEVICE STORAGE FULL — writes frozen. Prune old data to release the lock.",
            { duration: Infinity, id: "storage-quota-error" },
          );
        } catch {
          /* noop */
        }
      }
    }
  }, [data, hydrated, storageLocked]);

  // Honors the write-lock: when storage is exhausted, ordinary mutations are
  // a no-op so volatile React state cannot diverge further from disk.
  const mutate = useCallback((fn: (d: AppData) => AppData) => {
    if (storageLockedRef.current) {
      try {
        toast.error("Storage full — edits are frozen until you prune old data.", {
          id: "storage-quota-error",
        });
      } catch {
        /* noop */
      }
      return;
    }
    setData((prev) => fn(prev));
  }, []);

  // Bypasses the write-lock so the user can recover from a quota event. Each
  // call attempts a fresh persist via the standard effect — success releases
  // the lock automatically.
  const pruneTransactionsOlderThan = useCallback((days: number) => {
    const cutoff = Date.now() - Math.max(0, days) * 86400000;
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter(
        (t) => new Date(t.timestamp).getTime() >= cutoff,
      ),
    }));
  }, []);

  const pruneDiscardedVaultItems = useCallback(() => {
    setData((prev) => ({
      ...prev,
      vaultItems: prev.vaultItems.filter((v) => v.status !== "discarded"),
    }));
  }, []);

  // Daily login checks
  useEffect(() => {
    if (!hydrated || !data.userState || dailyCheckRan.current) return;
    if (storageLocked) return;
    dailyCheckRan.current = true;

    const today = new Date();
    const todayKey = dayKey(today);
    const us = data.userState;
    if (us.lastLoginDate === todayKey) return;

    let dpGain = 0;
    let newStreak = us.currentStreakDays;
    let dpLoss = 0;
    const messages: { msg: string; type: "success" | "info" | "warning" }[] = [];

    const lastDate = new Date(us.lastLoginDate);
    const gap = daysBetween(lastDate, today);

    if (gap === 1) {
      const yKey = us.lastLoginDate;
      const yDate = new Date(us.lastLoginDate + "T12:00:00");
      const ySpent = discretionarySpentOn(data.transactions, yKey);
      const subDaily = subscriptionDailyOverheadVND(data.subscriptions);
      const yLimit = Math.max(0, calcBaseDailyAllowance(us, yDate) - subDaily);
      if (ySpent <= yLimit) {
        dpGain += 50;
        newStreak += 1;
        messages.push({ msg: `✅ Yesterday under limit! +50 DP`, type: "success" });
        const bonus = milestoneBonus(newStreak);
        if (bonus > 0) {
          dpGain += bonus;
          messages.push({ msg: `🔥 ${newStreak}-Day Streak! +${bonus} DP Bonus!`, type: "success" });
        }
      }
    } else if (gap > 1) {
      const missed = gap - 1;
      const penalty = Math.min(50, missed * 10);
      dpLoss += penalty;
      newStreak = 0;
      messages.push({ msg: `⚠️ Missed ${missed} day(s). −${penalty} DP. Streak reset.`, type: "warning" });
    }

    // ─── Weekly habit reward (Task 3) ─────────────────────────────────────
    // Reward is anchored to the ISO-week containing the most recent past or
    // current Monday. If the user skipped Monday and syncs on Tuesday+, the
    // boundary still counts so long as we have not already credited that week.
    const lastMonday = mostRecentMonday(today);
    const weekKey = isoWeekKey(lastMonday);
    let nextWeeklyRewardWeek = us.lastWeeklyHabitRewardWeek;
    if (us.lastWeeklyHabitRewardWeek !== weekKey) {
      const habit = us.targetHabit;
      const habitLower = habit?.toLowerCase().trim();
      const windowEnd = lastMonday.getTime();
      const windowStart = windowEnd - 7 * 86400000;
      const habitSpent = data.transactions
        .filter((t) => {
          if (!txIsCompleted(t)) return false;
          if (!habitLower) return false;
          if (t.category.toLowerCase().trim() !== habitLower) return false;
          const ts = new Date(t.timestamp).getTime();
          return ts >= windowStart && ts < windowEnd;
        })
        .reduce((s, t) => s + t.amountVND, 0);
      if (us.weeklyHabitLimitVND > 0 && habitSpent < us.weeklyHabitLimitVND) {
        dpGain += 250;
        messages.push({
          msg: `🎯 Weekly ${habit} limit respected! +250 DP`,
          type: "success",
        });
      }
      nextWeeklyRewardWeek = weekKey;
    }

    // ─── Subscription billing rollover (Task 1) ───────────────────────────
    // When the active subscription's `nextBillingDate` has elapsed, formally
    // debit the flexible pool exactly once per cycle and advance the cursor.
    // The generated transaction carries `is_recurring_subscription: true`
    // metadata so `getActiveAmortizations` skips it (no double-counting; the
    // daily overhead reduction continues to be derived from `monthlyEquivalent`).
    const nowMs = Date.now();
    const billedTransactions: Transaction[] = [];
    const nextSubscriptions = data.subscriptions.map((sub) => {
      if (!sub.isActive) return sub;
      let cursor = sub.nextBillingDate;
      let guard = 0;
      while (Date.parse(cursor) <= nowMs && guard < 24) {
        billedTransactions.push({
          id: uuid(),
          timestamp: cursor,
          amountVND: sub.amountCents,
          originalCurrency: "VND",
          category: "Software & Digital Subscriptions",
          isEssential: false,
          justification: `Auto-pay: ${sub.name}`,
          fromVault: false,
          status: "completed",
          vault_expires_at: null,
          metadata: { is_recurring_subscription: true },
        });
        cursor = advanceBillingDate(cursor, sub.billingCycle);
        guard += 1;
      }
      return cursor === sub.nextBillingDate ? sub : { ...sub, nextBillingDate: cursor };
    });
    const totalBilledVND = billedTransactions.reduce((s, t) => s + t.amountVND, 0);

    mutate((d) => {
      if (!d.userState) return d;
      let us2 = applyDPGain(d.userState, dpGain);
      us2 = {
        ...us2,
        totalDP: us2.totalDP - dpLoss,
        ascensionXP: Math.max(0, (us2.ascensionXP ?? 0) - dpLoss),
        currentStreakDays: newStreak,
        lastLoginDate: todayKey,
        lastWeeklyHabitRewardWeek: nextWeeklyRewardWeek,
        currentBalanceVND: us2.currentBalanceVND - totalBilledVND,
      };
      return {
        ...d,
        userState: us2,
        transactions:
          billedTransactions.length > 0
            ? [...billedTransactions, ...d.transactions]
            : d.transactions,
        subscriptions: nextSubscriptions,
      };
    });

    if (billedTransactions.length > 0) {
      messages.push({
        msg: `🔁 Auto-pay processed: ${billedTransactions.length} subscription charge(s) debited.`,
        type: "info",
      });
    }

    setTimeout(() => {
      messages.forEach((m) => {
        if (m.type === "success") toast.success(m.msg);
        else if (m.type === "warning") toast.warning(m.msg);
        else toast(m.msg);
      });
    }, 400);
  }, [hydrated, data.userState, data.transactions, data.subscriptions, mutate, storageLocked]);

  // Daily Protocol contracts refresh
  useEffect(() => {
    if (!hydrated || !data.userState) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (data.userState.lastContractRefreshDate === todayStr) return;
    const newContracts = generateDailyContracts();
    mutate((d) => ({
      ...d,
      userState: d.userState
        ? { ...d.userState, dailyContracts: newContracts, lastContractRefreshDate: todayStr }
        : d.userState,
    }));
    setTimeout(() => toast.success('New daily challenges available.'), 500);
  }, [hydrated, data.userState?.lastContractRefreshDate, mutate, data.userState]);

  // Vault cooling -> ready (global, battery friendly)
  useEffect(() => {
    if (!hydrated) return;
    const check = () => {
      const now = Date.now();
      const transitions: { id: string; name: string }[] = [];
      setData((prev) => {
        let changed = false;
        const vaultItems = prev.vaultItems.map((v) => {
          if (v.status === "cooling") {
            const due = new Date(v.createdAt).getTime() + v.delayHours * 3600000;
            if (due <= now) {
              changed = true;
              if (!notifiedReadyRef.current.has(v.id)) {
                notifiedReadyRef.current.add(v.id);
                transitions.push({ id: v.id, name: v.itemName });
              }
              return { ...v, status: "ready" as const };
            }
          }
          return v;
        });
        return changed ? { ...prev, vaultItems } : prev;
      });
      transitions.forEach((t) =>
        toast.success(`🔓 Vault Item Ready: ${t.name}`, { duration: 8000 })
      );
    };
    check();
    const interval = setInterval(check, 60000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hydrated]);

  // Foreground notification engine — fires only while app is open
  useEffect(() => {
    if (!hydrated) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    let cleanup: (() => void) | undefined;

    import('@/lib/notifications').then(({ notifyWelcomeBack, notifyViceCheck, notifyEndOfDay }) => {
      let hiddenAt: number | null = null;
      const ONE_HOUR_MS = 60 * 60 * 1000;

      const handleVisibility = () => {
        if (document.hidden) {
          hiddenAt = Date.now();
        } else {
          if (hiddenAt !== null && Date.now() - hiddenAt > ONE_HOUR_MS) {
            notifyWelcomeBack();
          }
          hiddenAt = null;
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      const viceInterval = setInterval(() => {
        notifyViceCheck();
      }, 4 * 60 * 60 * 1000);

      const EOD_STORAGE_KEY = 'sg_eod_notif_sent';
      const eodInterval = setInterval(() => {
        const now = new Date();
        if (now.getHours() === 20) {
          const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
          const alreadySent = localStorage.getItem(EOD_STORAGE_KEY);
          if (alreadySent !== todayKey) {
            localStorage.setItem(EOD_STORAGE_KEY, todayKey);
            notifyEndOfDay();
          }
        }
      }, 60 * 1000);

      cleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        clearInterval(viceInterval);
        clearInterval(eodInterval);
      };
    });

    return () => {
      cleanup?.();
    };
  }, [hydrated]);

  // Ascension Protocol monitor — drives level up/down based on ascensionXP
  useEffect(() => {
    if (!hydrated || !data.userState) return;
    const us = data.userState;
    const actualLevel = getRankForXP(us.ascensionXP ?? 0).level;

    if (data._isMigrationLoad) {
      if (actualLevel !== us.currentLevel) {
        mutate((d) => ({
          ...d,
          userState: d.userState ? { ...d.userState, currentLevel: actualLevel } : d.userState,
          _isMigrationLoad: undefined,
        }));
      } else {
        mutate((d) => ({ ...d, _isMigrationLoad: undefined }));
      }
      return;
    }

    if (actualLevel > us.currentLevel) {
      const nextStepLevel = us.currentLevel + 1;
      if (pendingAscension !== nextStepLevel) setPendingAscension(nextStepLevel);
    } else if (actualLevel < us.currentLevel) {
      mutate((d) => ({
        ...d,
        userState: d.userState ? { ...d.userState, currentLevel: actualLevel } : d.userState,
      }));
      const demotedRank = RANKS.find((r) => r.level === actualLevel);
      if (demotedRank) toast.error(`DEMOTION: You have fallen to ${demotedRank.title}. Discipline compromised.`);
    }
  }, [data.userState?.ascensionXP, data.userState?.currentLevel, data._isMigrationLoad, hydrated, pendingAscension, mutate, data.userState]);

  const subscriptionDailyOverhead = useMemo(
    () => subscriptionDailyOverheadVND(data.subscriptions),
    [data.subscriptions],
  );

  const smartDailyLimit = useMemo(
    () =>
      data.userState
        ? calcSmartDailyLimit(data.userState, new Date(), data.transactions, subscriptionDailyOverhead)
        : 0,
    [data.userState, data.transactions, subscriptionDailyOverhead],
  );

  const todayDiscretionary = useMemo(
    () => discretionarySpentOn(data.transactions, dayKey(new Date()), data.userState?.targetHabit),
    [data.transactions, data.userState?.targetHabit]
  );

  const initUser: AppContextValue["initUser"] = (input) => {
    const today = new Date();
    try {
      localStorage.setItem("sg_last_savings_base_cents", String(input.savings_base_cents));
    } catch {
      /* noop */
    }
    const us: UserState = {
      userName: input.userName || "Master",
      currentBalanceVND: Math.max(0, Math.floor(input.currentBalanceVND)),
      essentialSpentVND: 0,
      cycleStartDate: today.toISOString(),
      paydayDate: input.paydayDate,
      total_income_cents: Math.max(0, Math.floor(input.total_income_cents)),
      fixed_overhead_cents: Math.max(0, Math.floor(input.fixed_overhead_cents)),
      savings_base_cents: Math.max(0, Math.floor(input.savings_base_cents)),
      savings_sweeps_cents: 0,
      savings_raided_cents: 0,
      raid_history: [],
      current_cycle_id: uuid(),
      pyfIncomeInferred: false,
      totalDP: 0,
      lifetimeDP: 0,
      currentLevel: 1,
      ascensionXP: 0,
      currentStreakDays: 0,
      lastLoginDate: dayKey(today),
      weeklyHabitLimitVND: input.weeklyHabitLimitVND ?? 0,
      targetHabit: (input.targetHabit ?? "").trim(),
      usdExchangeRate: input.usdExchangeRate ?? DEFAULT_USD_EXCHANGE_RATE,
      displayCurrency: input.displayCurrency ?? "VND",
      dailyContracts: [],
      lastContractRefreshDate: "",
      lastWeeklyHabitRewardWeek: isoWeekKey(today),
    };
    setData({ userState: us, transactions: [], vaultItems: [], rewards: [], subscriptions: [] });
  };

  const withdrawFromSavings: AppContextValue["withdrawFromSavings"] = (amountCents, type, justification, options) => {
    mutate((d) => {
      if (!d.userState) return d;
      try {
        const next = applyWithdrawFromSavingsState(d.userState, amountCents, type, justification);
        const onSuccess = options?.onSuccess;
        if (onSuccess) queueMicrotask(onSuccess);
        return { ...d, userState: next };
      } catch (e) {
        toast.error((e as Error).message);
        return d;
      }
    });
  };

  const startNewCycle: AppContextValue["startNewCycle"] = () => {
    mutate((d) => {
      if (!d.userState) return d;
      const us = d.userState;
      try {
        localStorage.setItem("sg_last_savings_base_cents", String(us.savings_base_cents ?? 0));
      } catch {
        /* noop */
      }
      return {
        ...d,
        userState: {
          ...us,
          cycleStartDate: new Date().toISOString(),
          savings_sweeps_cents: 0,
          savings_raided_cents: 0,
          raid_history: [],
          current_cycle_id: uuid(),
          currentBalanceVND: Math.max(
            0,
            us.total_income_cents - us.fixed_overhead_cents - us.savings_base_cents,
          ),
        },
      };
    });
    toast.success("New cycle started. Savings pledge carried forward.");
  };

  const updateUserState: AppContextValue["updateUserState"] = (patch) => {
    mutate((d) => {
      if (!d.userState) return d;
      const oldHabit = d.userState.targetHabit;
      const newHabit = patch.targetHabit;
      const newUS = { ...d.userState, ...patch };
      let txs = d.transactions;
      if (
        typeof newHabit === "string" &&
        oldHabit &&
        newHabit.trim() &&
        oldHabit.toLowerCase().trim() !== newHabit.toLowerCase().trim()
      ) {
        const oldLower = oldHabit.toLowerCase().trim();
        txs = d.transactions.map((t) =>
          t.category.toLowerCase().trim() === oldLower ? { ...t, category: newHabit.trim() } : t
        );
      }
      return { ...d, userState: newUS, transactions: txs };
    });
  };

  const logExpense: AppContextValue["logExpense"] = (input) => {
    if (!data.userState) return false;
    const plannedTimestamp = new Date().toISOString();
    const dupKey = buildIdempotencyKeyFromPending(input, plannedTimestamp);
    if (data.transactions.some((t) => buildIdempotencyKey(t) === dupKey)) {
      console.warn("[INGESTION] Duplicate transaction blocked:", dupKey);
      return false;
    }

    const isEss = isEssentialCategory(input.category);
    const amortDays = input.amortizationDays && input.amortizationDays > 1 ? Math.floor(input.amortizationDays) : undefined;
    const metadataCandidate =
      amortDays !== undefined
        ? ({
            is_recurring_subscription: false as const,
            amortization_schedule: {
              spread_days: amortDays,
              amortization_start_date: plannedTimestamp,
            },
          } as const)
        : ({ is_recurring_subscription: false as const } as const);
    const metadataParsed = transactionMetadataSchema.safeParse(metadataCandidate);
    const metadata = metadataParsed.success
      ? metadataParsed.data
      : ({ is_recurring_subscription: false as const });
    const habit = data.userState.targetHabit;
    const habitLower = habit?.toLowerCase().trim();
    const isHabit = !!habitLower && input.category.toLowerCase().trim() === habitLower;
    // Amortized expenses now contribute a daily slice toward the daily limit
    // (handled inside discretionarySpentOn / smartDailyLimit), so the breach
    // check should evaluate the new slice rather than the full amount.
    const countsTowardDaily = !isEss && !isHabit;
    const slice = amortDays ? input.amountVND / amortDays : input.amountVND;

    if (countsTowardDaily) {
      const todaySpent = todayDiscretionary;
      const limit = smartDailyLimit;
      if (todaySpent + slice > limit) {
        mutate((d) => {
          if (!d.userState) return d;
          const tx: Transaction = {
            id: uuid(),
            timestamp: plannedTimestamp,
            amountVND: input.amountVND,
            originalAmount: input.originalAmount,
            originalCurrency: input.originalCurrency,
            category: input.category,
            isEssential: false,
            justification: input.justification,
            fromVault: !!input.fromVault,
            status: "completed",
            vault_expires_at: null,
            amortizeDays: amortDays,
            amortizationDays: amortDays,
            metadata,
          };
          // -25 penalty (does NOT subtract from lifetime), then add the small dpForAmount gain
          const gain = dpForAmount(input.amountVND, input.category, !!input.fromVault, habit);
          let us = {
            ...d.userState,
            totalDP: d.userState.totalDP - 25,
            ascensionXP: Math.max(0, (d.userState.ascensionXP ?? 0) - 25),
          };
          us = applyDPGain(us, gain);
          us = {
            ...us,
            currentBalanceVND: us.currentBalanceVND - input.amountVND,
            currentStreakDays: 0,
          };
          return {
            ...d,
            userState: us,
            transactions: [tx, ...d.transactions],
            vaultItems: input.vaultId
              ? d.vaultItems.map((v) => (v.id === input.vaultId ? { ...v, status: "approved" as const } : v))
              : d.vaultItems,
          };
        });
        setBreach({ amountVND: input.amountVND, limitVND: smartDailyLimit });
        return true;
      }
    }

    let bonusMsg = "";
    mutate((d) => {
      if (!d.userState) return d;
      const tx: Transaction = {
        id: uuid(),
        timestamp: plannedTimestamp,
        amountVND: input.amountVND,
        originalAmount: input.originalAmount,
        originalCurrency: input.originalCurrency,
        category: input.category,
        isEssential: isEss,
        justification: input.justification,
        fromVault: !!input.fromVault,
        status: "completed",
        vault_expires_at: null,
        amortizeDays: amortDays,
        amortizationDays: amortDays,
        metadata,
      };
      const dpEarned = isEss ? 0 : dpForAmount(input.amountVND, input.category, !!input.fromVault, habit);
      let us = applyDPGain(d.userState, dpEarned);
      let vaultItems = d.vaultItems;
      if (input.vaultId) {
        const vi = d.vaultItems.find((v) => v.id === input.vaultId);
        if (vi && habitLower && vi.category.toLowerCase().trim() === habitLower) {
          const bonus = 15 * Math.floor(vi.delayHours / 24);
          if (bonus > 0) {
            us = applyDPGain(us, bonus);
            bonusMsg = `🎯 Vault discipline! +${bonus} DP bonus`;
          }
        }
        vaultItems = vaultItems.map((v) =>
          v.id === input.vaultId ? { ...v, status: "approved" as const } : v
        );
      }
      if (isEss) us.essentialSpentVND = d.userState.essentialSpentVND + input.amountVND;
      else us.currentBalanceVND = us.currentBalanceVND - input.amountVND;
      return { ...d, userState: us, transactions: [tx, ...d.transactions], vaultItems };
    });
    const dpEarned = isEss ? 0 : dpForAmount(input.amountVND, input.category, !!input.fromVault, habit);
    toast.success(`Expense Logged. +${dpEarned} DP Earned.`);
    if (bonusMsg) setTimeout(() => toast.success(bonusMsg), 600);
    return true;
  };

  const addToVault: AppContextValue["addToVault"] = (input) => {
    mutate((d) => {
      const vaultId = uuid();
      const txId = uuid();
      const createdAt = new Date().toISOString();
      const vaultExpiresAt = new Date(Date.now() + input.delayHours * 3600000).toISOString();
      const frozenTx: Transaction = {
        id: txId,
        timestamp: createdAt,
        amountVND: input.estimatedAmountVND,
        originalCurrency: "VND",
        category: input.category,
        isEssential: false,
        justification: input.justification,
        fromVault: true,
        status: "frozen",
        vault_expires_at: vaultExpiresAt,
      };
      return {
        ...d,
        transactions: [frozenTx, ...d.transactions],
        vaultItems: [
          {
            ...input,
            id: vaultId,
            createdAt,
            status: "cooling",
            frozenTransactionId: txId,
          },
          ...d.vaultItems,
        ],
      };
    });
    toast.success(`🔒 Added to Vault. Cooling for ${input.delayHours}h.`);
  };

  const markVaultReady = (id: string) => {
    mutate((d) => ({
      ...d,
      vaultItems: d.vaultItems.map((v) =>
        v.id === id && v.status === "cooling" ? { ...v, status: "ready" } : v
      ),
    }));
  };

  const approveVault = (id: string) => {
    const vi = data.vaultItems.find((v) => v.id === id);
    if (!vi || !data.userState) return;
    const tx = vi.frozenTransactionId
      ? data.transactions.find((t) => t.id === vi.frozenTransactionId)
      : undefined;
    if (!tx || (tx.status ?? "completed") !== "frozen") {
      toast.error("No pending frozen purchase is linked to this vault item.");
      return;
    }
    if (tx.amountVND > data.userState.currentBalanceVND) {
      toast.error("Insufficient flexible pool to confirm this purchase.");
      return;
    }
    // Discipline gate (Task 5): a negative DP ledger means the gamified
    // 1 DP ≈ 100 VND equivalence is already underwater. Block convenience
    // approvals until the user restores positive standing via contracts,
    // streaks, or raid recovery.
    if (data.userState.totalDP < 0) {
      toast.error(
        "Approval denied: DP ledger is in deficit. Restore positive standing before drawing on the vault.",
      );
      return;
    }
    mutate((d) => {
      if (!d.userState) return d;
      const v = d.vaultItems.find((x) => x.id === id);
      if (!v?.frozenTransactionId) return d;
      const fr = d.transactions.find((t) => t.id === v.frozenTransactionId);
      if (!fr || (fr.status ?? "completed") !== "frozen") return d;
      if (fr.amountVND > d.userState.currentBalanceVND) return d;
      if (d.userState.totalDP < 0) return d;
      const us = {
        ...d.userState,
        currentBalanceVND: d.userState.currentBalanceVND - fr.amountVND,
        totalDP: d.userState.totalDP - 10,
        ascensionXP: Math.max(0, (d.userState.ascensionXP ?? 0) - 10),
      };
      const txs = d.transactions.map((t) =>
        t.id === fr.id ? { ...t, status: "completed" as const, vault_expires_at: null } : t,
      );
      const vaultItems = d.vaultItems.map((x) => (x.id === id ? { ...x, status: "approved" as const } : x));
      return { ...d, userState: us, transactions: txs, vaultItems };
    });
    toast.success("Purchase confirmed from vault.");
  };

  const discardVault = (id: string) => {
    mutate((d) => {
      if (!d.userState) return d;
      const v = d.vaultItems.find((x) => x.id === id);
      let us = applyDPGain(d.userState, 40);
      let txs = d.transactions;
      if (v?.frozenTransactionId) {
        txs = txs.map((t) =>
          t.id === v.frozenTransactionId && (t.status ?? "completed") === "frozen"
            ? { ...t, status: "rejected" as const, vault_expires_at: null }
            : t,
        );
      }
      return {
        ...d,
        vaultItems: d.vaultItems.map((x) =>
          x.id === id
            ? { ...x, status: "discarded" as const, discardedAt: new Date().toISOString() }
            : x,
        ),
        userState: us,
        transactions: txs,
      };
    });
    toast.success("🏆 Impulse defeated. +40 DP — Total Victory.");
  };

  const spendDP: AppContextValue["spendDP"] = (amount) => {
    if (!data.userState || amount > data.userState.totalDP) return;
    mutate((d) => {
      if (!d.userState) return d;
      return { ...d, userState: { ...d.userState, totalDP: d.userState.totalDP - amount } };
    });
  };

  const deleteTransaction = (id: string) => {
    mutate((d) => {
      const tx = d.transactions.find((t) => t.id === id);
      if (!tx || !d.userState) return d;
      const newUS = { ...d.userState };
      if (txIsCompleted(tx)) {
        if (!tx.isEssential) newUS.currentBalanceVND += tx.amountVND;
        else newUS.essentialSpentVND = Math.max(0, newUS.essentialSpentVND - tx.amountVND);
      }
      return { ...d, userState: newUS, transactions: d.transactions.filter((t) => t.id !== id) };
    });
    toast("Transaction deleted");
  };

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json) as AppData;
      const migrated = migrate(parsed);
      setData(migrated);
      save(migrated);
      toast.success("Data imported. Reloading...");
      setTimeout(() => window.location.reload(), 600);
      return true;
    } catch {
      toast.error("Invalid JSON file");
      return false;
    }
  };

  const clearData = () => {
    // Remove all SplurgeGuard-owned localStorage keys, not just the main store
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("sg_last_savings_base_cents");
    localStorage.removeItem("sg_eod_notif_sent");
    setData(defaultData);
    toast("All data cleared");
  };

  const toggleCurrency = () => {
    if (!data.userState) return;
    updateUserState({ displayCurrency: data.userState.displayCurrency === "VND" ? "USD" : "VND" });
  };

  // ===== Rewards / Exchange =====
  const createReward: AppContextValue["createReward"] = (input) => {
    mutate((d) => ({
      ...d,
      rewards: [
        {
          ...input,
          id: uuid(),
          createdAt: new Date().toISOString(),
          status: "active" as const,
        },
        ...d.rewards,
      ],
    }));
    toast.success(`Reward saved: ${input.title}`);
  };

  const redeemReward: AppContextValue["redeemReward"] = (rewardId) => {
    const reward = data.rewards.find((r) => r.id === rewardId && r.status === "active");
    if (!reward) return "not_found";
    if (!data.userState) return "insufficient_dp";
    // Negative-wallet guard (Task 5): even zero-cost rewards are blocked while
    // the ledger is underwater, keeping the Exchange aligned with discipline.
    if (data.userState.totalDP < 0) return "insufficient_dp";
    if (reward.costDP > data.userState.totalDP) return "insufficient_dp";

    mutate((d) => {
      if (!d.userState) return d;
      return {
        ...d,
        userState: { ...d.userState, totalDP: d.userState.totalDP - reward.costDP },
        rewards: d.rewards.map((r) =>
          r.id === rewardId
            ? { ...r, status: "redeemed" as const, redeemedAt: new Date().toISOString() }
            : r
        ),
      };
    });
    return "success";
  };

  const deleteReward = (rewardId: string) => {
    const reward = data.rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    const progressDP = (reward as any).currentDP ?? 0;
    mutate((d) => ({
      ...d,
      rewards: d.rewards.filter((r) => r.id !== rewardId),
    }));
    toast.success(
      progressDP > 0
        ? `Reward deleted. ${progressDP} DP progress lost.`
        : "Reward deleted."
    );
  };

  const deleteVaultItem = (id: string) => {
    mutate((d) => {
      const vi = d.vaultItems.find((v) => v.id === id);
      let txs = d.transactions;
      let us = d.userState;
      if (vi?.frozenTransactionId && d.userState) {
        txs = txs.map((t) =>
          t.id === vi.frozenTransactionId && (t.status ?? "completed") === "frozen"
            ? { ...t, status: "rejected" as const, vault_expires_at: null }
            : t,
        );
        us = applyDPGain(d.userState, 40);
      }
      return {
        ...d,
        userState: us,
        transactions: txs,
        vaultItems: d.vaultItems.filter((v) => v.id !== id),
      };
    });
    toast.success("Item removed from vault. +40 DP.");
  };

  // ===== Ascension Protocol =====
  const clearPendingAscension = () => {
    if (pendingAscension === null) return;
    const lvl = pendingAscension;
    mutate((d) => ({
      ...d,
      userState: d.userState ? { ...d.userState, currentLevel: lvl } : d.userState,
    }));
    setPendingAscension(null);
  };

  const value: AppContextValue = {
    data,
    initUser,
    updateUserState,
    logExpense,
    addToVault,
    markVaultReady,
    approveVault,
    discardVault,
    spendDP,
    deleteVaultItem,
    deleteTransaction,
    importData,
    clearData,
    toggleCurrency,
    smartDailyLimit,
    todayDiscretionary,
    breach,
    clearBreach: () => setBreach(null),
    createReward,
    redeemReward,
    deleteReward,
    pendingAscension,
    clearPendingAscension,
    withdrawFromSavings,
    startNewCycle,
    storageLocked,
    pruneTransactionsOlderThan,
    pruneDiscardedVaultItems,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
};
