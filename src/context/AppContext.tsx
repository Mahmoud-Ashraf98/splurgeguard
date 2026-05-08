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
  isEssentialCategory,
} from "@/lib/splurge-types";
import {
  calcSmartDailyLimit,
  dayKey,
  daysBetween,
  discretionarySpentOn,
  dpForAmount,
  milestoneBonus,
  uuid,
} from "@/lib/splurge-utils";

interface BreachInfo {
  amountVND: number;
  limitVND: number;
}

interface AppContextValue {
  data: AppData;
  initUser: (us: Omit<UserState, "totalDP" | "currentStreakDays" | "lastLoginDate" | "essentialSpentVND" | "cycleStartDate" | "usdExchangeRate" | "displayCurrency"> & Partial<UserState>) => void;
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
  deleteTransaction: (id: string) => void;
  importData: (json: string) => boolean;
  clearData: () => void;
  toggleCurrency: () => void;
  smartDailyLimit: number;
  todayDiscretionary: number;
  breach: BreachInfo | null;
  clearBreach: () => void;
}

const defaultData: AppData = { userState: null, transactions: [], vaultItems: [] };

const Ctx = createContext<AppContextValue | null>(null);

const load = (): AppData => {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppData;
    // Migration guard: legacy data without targetHabit -> wipe to force fresh onboarding
    if (parsed.userState && !(parsed.userState as any).targetHabit) {
      localStorage.removeItem(STORAGE_KEY);
      return defaultData;
    }
    return parsed;
  } catch {
    return defaultData;
  }
};

const save = (d: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (error) {
    try {
      toast.error(
        "Device storage full! App data cannot be saved. Please export your data in Settings and clear space.",
        { duration: Infinity, id: "storage-quota-error" }
      );
    } catch {}
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [breach, setBreach] = useState<BreachInfo | null>(null);
  const dailyCheckRan = useRef(false);
  const notifiedReadyRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(data);
  }, [data, hydrated]);

  // Mutator helper
  const mutate = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  // Daily login checks (BR-002, BR-005, BR-008)
  useEffect(() => {
    if (!hydrated || !data.userState || dailyCheckRan.current) return;
    dailyCheckRan.current = true;

    const today = new Date();
    const todayKey = dayKey(today);
    const us = data.userState;
    if (us.lastLoginDate === todayKey) return;

    let newDP = us.totalDP;
    let newStreak = us.currentStreakDays;
    const messages: { msg: string; type: "success" | "info" | "warning" }[] = [];

    const lastDate = new Date(us.lastLoginDate);
    const gap = daysBetween(lastDate, today);

    if (gap === 1) {
      // BR-002: check yesterday
      const yKey = us.lastLoginDate;
      const yDate = new Date(us.lastLoginDate + "T12:00:00");
      const ySpent = discretionarySpentOn(data.transactions, yKey);
      const tempUS: UserState = { ...us };
      const yLimit = calcSmartDailyLimit(tempUS, yDate, data.transactions);
      if (ySpent <= yLimit) {
        newDP += 50;
        newStreak += 1;
        messages.push({ msg: `✅ Yesterday under limit! +50 DP`, type: "success" });
        const bonus = milestoneBonus(newStreak);
        if (bonus > 0) {
          newDP += bonus;
          messages.push({ msg: `🔥 ${newStreak}-Day Streak! +${bonus} DP Bonus!`, type: "success" });
        }
      }
    } else if (gap > 1) {
      // BR-005
      const missed = gap - 1;
      const penalty = Math.min(50, missed * 10);
      newDP -= penalty;
      newStreak = 0;
      messages.push({ msg: `⚠️ Missed ${missed} day(s). −${penalty} DP. Streak reset.`, type: "warning" });
    }

    // BR-008: Weekly habit check on Monday
    if (today.getDay() === 1) {
      const habit = us.targetHabit;
      const habitLower = habit?.toLowerCase().trim();
      const weekAgo = new Date(today.getTime() - 7 * 86400000);
      const habitSpent = data.transactions
        .filter((t) => habitLower && t.category.toLowerCase().trim() === habitLower && new Date(t.timestamp) >= weekAgo)
        .reduce((s, t) => s + t.amountVND, 0);
      if (us.weeklyHabitLimitVND > 0 && habitSpent < us.weeklyHabitLimitVND) {
        newDP += 250;
        messages.push({ msg: `🎯 Weekly ${habit} limit respected! +250 DP`, type: "success" });
      }
    }

    mutate((d) => ({
      ...d,
      userState: d.userState
        ? { ...d.userState, totalDP: newDP, currentStreakDays: newStreak, lastLoginDate: todayKey }
        : d.userState,
    }));

    setTimeout(() => {
      messages.forEach((m) => {
        if (m.type === "success") toast.success(m.msg);
        else if (m.type === "warning") toast.warning(m.msg);
        else toast(m.msg);
      });
    }, 400);
  }, [hydrated, data.userState, data.transactions, mutate]);

  // Global vault cooling -> ready check (battery-friendly: 60s + visibility sync)
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

  const smartDailyLimit = useMemo(
    () => (data.userState ? calcSmartDailyLimit(data.userState, new Date(), data.transactions) : 0),
    [data.userState, data.transactions]
  );

  const todayDiscretionary = useMemo(
    () => discretionarySpentOn(data.transactions, dayKey(new Date()), data.userState?.targetHabit),
    [data.transactions, data.userState?.targetHabit]
  );

  const initUser: AppContextValue["initUser"] = (input) => {
    const today = new Date();
    const us: UserState = {
      userName: input.userName || "Operator",
      currentBalanceVND: input.currentBalanceVND ?? 0,
      essentialSpentVND: 0,
      cycleStartDate: today.toISOString(),
      paydayDate: input.paydayDate!,
      totalDP: 0,
      currentStreakDays: 0,
      lastLoginDate: dayKey(today),
      weeklyHabitLimitVND: input.weeklyHabitLimitVND ?? 0,
      targetHabit: (input.targetHabit ?? "").trim(),
      usdExchangeRate: input.usdExchangeRate ?? 26310,
      displayCurrency: input.displayCurrency ?? "VND",
    };
    setData({ userState: us, transactions: [], vaultItems: [] });
  };

  const updateUserState: AppContextValue["updateUserState"] = (patch) => {
    mutate((d) => {
      if (!d.userState) return d;
      const oldHabit = d.userState.targetHabit;
      const newHabit = patch.targetHabit;
      const newUS = { ...d.userState, ...patch };
      // Mid-cycle migration: rename historical transactions matching the old habit
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
    const isEss = isEssentialCategory(input.category);
    const amortDays = input.amortizationDays && input.amortizationDays > 1 ? Math.floor(input.amortizationDays) : undefined;
    const habit = data.userState.targetHabit;
    const habitLower = habit?.toLowerCase().trim();
    const isHabit = !!habitLower && input.category.toLowerCase().trim() === habitLower;
    const countsTowardDaily = !isEss && !isHabit && !amortDays;

    // BR-004 check first (only for non-amortized discretionary)
    if (countsTowardDaily) {
      const todaySpent = todayDiscretionary;
      const limit = smartDailyLimit;
      if (todaySpent + input.amountVND > limit) {
        // Apply penalty
        mutate((d) => {
          if (!d.userState) return d;
          const tx: Transaction = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            amountVND: input.amountVND,
            originalAmount: input.originalAmount,
            originalCurrency: input.originalCurrency,
            category: input.category,
            isEssential: false,
            justification: input.justification,
            fromVault: !!input.fromVault,
          };
          let dp = d.userState.totalDP - 25;
          dp += dpForAmount(input.amountVND, input.category, !!input.fromVault, habit);
          return {
            ...d,
            userState: {
              ...d.userState,
              currentBalanceVND: d.userState.currentBalanceVND - input.amountVND,
              totalDP: dp,
              currentStreakDays: 0,
            },
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

    // Normal log
    let bonusMsg = "";
    mutate((d) => {
      if (!d.userState) return d;
      const tx: Transaction = {
        id: uuid(),
        timestamp: new Date().toISOString(),
        amountVND: input.amountVND,
        originalAmount: input.originalAmount,
        originalCurrency: input.originalCurrency,
        category: input.category,
        isEssential: isEss,
        justification: input.justification,
        fromVault: !!input.fromVault,
        amortizationDays: amortDays,
      };
      const dpEarned = isEss ? 0 : dpForAmount(input.amountVND, input.category, !!input.fromVault, habit);
      let dp = d.userState.totalDP + dpEarned;
      let vaultItems = d.vaultItems;
      if (input.vaultId) {
        const vi = d.vaultItems.find((v) => v.id === input.vaultId);
        if (vi && habitLower && vi.category.toLowerCase().trim() === habitLower) {
          const bonus = 15 * Math.floor(vi.delayHours / 24);
          dp += bonus;
          if (bonus > 0) bonusMsg = `🎯 Vault discipline! +${bonus} DP bonus`;
        }
        vaultItems = vaultItems.map((v) =>
          v.id === input.vaultId ? { ...v, status: "approved" as const } : v
        );
      }
      const newUS: UserState = {
        ...d.userState,
        totalDP: dp,
      };
      if (isEss) newUS.essentialSpentVND = d.userState.essentialSpentVND + input.amountVND;
      else newUS.currentBalanceVND = d.userState.currentBalanceVND - input.amountVND;
      return { ...d, userState: newUS, transactions: [tx, ...d.transactions], vaultItems };
    });
    const dpEarned = isEss ? 0 : dpForAmount(input.amountVND, input.category, !!input.fromVault, habit);
    toast.success(`Expense Logged. +${dpEarned} DP Earned.`);
    if (bonusMsg) setTimeout(() => toast.success(bonusMsg), 600);
    return true;
  };

  const addToVault: AppContextValue["addToVault"] = (input) => {
    mutate((d) => ({
      ...d,
      vaultItems: [
        {
          ...input,
          id: uuid(),
          createdAt: new Date().toISOString(),
          status: "cooling",
        },
        ...d.vaultItems,
      ],
    }));
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
    if (!vi) return;
    logExpense({
      amountVND: vi.estimatedAmountVND,
      originalCurrency: "VND",
      category: vi.category,
      justification: vi.justification || vi.itemName,
      fromVault: true,
      vaultId: vi.id,
    });
  };

  const discardVault = (id: string) => {
    mutate((d) => ({
      ...d,
      vaultItems: d.vaultItems.map((v) => (v.id === id ? { ...v, status: "discarded" } : v)),
      userState: d.userState ? { ...d.userState, totalDP: d.userState.totalDP + 10 } : d.userState,
    }));
    toast.success("🗑️ Discarded. +10 DP for discipline.");
  };

  const spendDP: AppContextValue["spendDP"] = (amount) => {
    mutate((d) => {
      if (!d.userState) return d;
      const newDP = Math.max(0, d.userState.totalDP - amount);
      return { ...d, userState: { ...d.userState, totalDP: newDP } };
    });
    toast(`Redeemed ${amount} DP`);
  };

  const deleteTransaction = (id: string) => {
    mutate((d) => {
      const tx = d.transactions.find((t) => t.id === id);
      if (!tx || !d.userState) return d;
      const newUS = { ...d.userState };
      if (!tx.isEssential) newUS.currentBalanceVND += tx.amountVND;
      else newUS.essentialSpentVND = Math.max(0, newUS.essentialSpentVND - tx.amountVND);
      return { ...d, userState: newUS, transactions: d.transactions.filter((t) => t.id !== id) };
    });
    toast("Transaction deleted");
  };

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json) as AppData;
      setData(parsed);
      save(parsed);
      toast.success("Data imported. Reloading...");
      setTimeout(() => window.location.reload(), 600);
      return true;
    } catch {
      toast.error("Invalid JSON file");
      return false;
    }
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
    toast("All data cleared");
  };

  const toggleCurrency = () => {
    if (!data.userState) return;
    updateUserState({ displayCurrency: data.userState.displayCurrency === "VND" ? "USD" : "VND" });
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
    deleteTransaction,
    importData,
    clearData,
    toggleCurrency,
    smartDailyLimit,
    todayDiscretionary,
    breach,
    clearBreach: () => setBreach(null),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
};
