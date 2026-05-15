import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";
import {
  Terminal,
  User,
  Calendar,
  Target,
  PiggyBank,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HoldSecureButton } from "@/components/splurge/HoldSecureButton";
import { daysBetween, fmtMoney } from "@/lib/splurge-utils";
import { DEFAULT_USD_EXCHANGE_RATE } from "@/lib/splurge-types";
import { isPaydayStrictlyInFuture, paydayInputToIsoEndOfLocalDay } from "@/lib/dateUtils";

type Phase = "profile" | "savings";

// MODULE-LEVEL — outside Onboarding component
interface OnboardingCurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onCommit: (n: number) => void;
  placeholder?: string;
  helper?: string;
}

function OnboardingCurrencyInput({
  id,
  label,
  value,
  onCommit,
  placeholder = "0",
  helper,
}: OnboardingCurrencyInputProps) {
  const { displayValue, humanBadge, handleFocus, handleChange, handleBlur } =
    useCurrencyInput(value, onCommit);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 pr-[108px] text-[#f1f5f9] font-mono transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
          {humanBadge && (
            <span
              className="px-2 py-0.5 bg-cyan-950/70 text-cyan-300 text-[10px] font-black rounded border border-cyan-700/50"
              style={{ boxShadow: "0 0 8px rgba(34,211,238,0.2)" }}
            >
              {humanBadge}
            </span>
          )}
          <span className="px-2.5 py-1 bg-slate-800/80 text-slate-400 text-[9px] font-bold uppercase rounded-md tracking-widest border border-slate-700/60">
            VND
          </span>
        </div>
      </div>
      {helper && (
        <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">{helper}</p>
      )}
    </div>
  );
}

export function Onboarding() {
  const { initUser } = useApp();
  const [phase, setPhase] = useState<Phase>("profile");
  const [userName, setUserName] = useState("");
  const [totalIncome, setTotalIncome] = useState("");
  const [fixedOverhead, setFixedOverhead] = useState("");
  const [flexibleBalance, setFlexibleBalance] = useState("");
  const [payday, setPayday] = useState("");
  const [targetHabit, setTargetHabit] = useState("");
  const [habitLimit, setHabitLimit] = useState("");
  const [savingsDraft, setSavingsDraft] = useState(0);

  const hasInitializedSavingsSlider = useRef(false);
  const lastProfileTotals = useRef<{ income: number; overhead: number } | null>(null);

  const incomeNum = Math.max(0, Math.floor(Number(totalIncome.replace(/\D/g, "")) || 0));
  const overheadNum = Math.max(0, Math.floor(Number(fixedOverhead.replace(/\D/g, "")) || 0));
  const flexBalanceNum = Math.max(0, Math.floor(Number(flexibleBalance.replace(/\D/g, "")) || 0));
  const maxSavingsPool = Math.max(0, incomeNum - overheadNum);
  const rate = DEFAULT_USD_EXCHANGE_RATE;

  useEffect(() => {
    if (phase !== "profile") return;
    const prev = lastProfileTotals.current;
    if (
      prev &&
      (prev.income !== incomeNum || prev.overhead !== overheadNum)
    ) {
      hasInitializedSavingsSlider.current = false;
    }
    lastProfileTotals.current = { income: incomeNum, overhead: overheadNum };
  }, [phase, incomeNum, overheadNum]);

  useEffect(() => {
    if (phase !== "savings" || hasInitializedSavingsSlider.current) return;
    hasInitializedSavingsSlider.current = true;
    try {
      const raw = localStorage.getItem("sg_last_savings_base_cents");
      const suggested = raw != null ? Math.floor(Number(raw)) : 0;
      setSavingsDraft(Math.min(maxSavingsPool, Math.max(0, suggested)));
    } catch {
      setSavingsDraft(0);
    }
  }, [phase, maxSavingsPool]);

  const daysUntilPayday = useMemo(() => {
    if (!payday) return 1;
    const parts = payday.split("-").map((x) => parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return 1;
    const [y, m, d] = parts;
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);
    return Math.max(1, daysBetween(new Date(), end));
  }, [payday]);

  const poolAfterSavings = Math.max(0, incomeNum - overheadNum - savingsDraft);
  const dailyAllowancePreview = Math.floor(poolAfterSavings / daysUntilPayday);
  const showAllowanceWarning = dailyAllowancePreview <= 0 && maxSavingsPool > 0;
  const commitBlocked = showAllowanceWarning;

  const habitWeeklyNum = Math.floor(Number(habitLimit.replace(/\D/g, "")) || 0);
  const habitLimitProvided = /\d/.test(habitLimit);

  const canContinueProfile =
    userName.trim().length > 0 &&
    incomeNum > 0 &&
    incomeNum >= overheadNum &&
    flexBalanceNum > 0 &&
    isPaydayStrictlyInFuture(payday) &&
    targetHabit.trim().length > 0 &&
    habitLimitProvided &&
    habitWeeklyNum >= 0;

  const incomeOverheadInvalid = incomeNum > 0 && overheadNum > 0 && incomeNum < overheadNum;
  const zeroSavingsCapacity = maxSavingsPool === 0 && incomeNum > 0 && incomeNum >= overheadNum;

  const submitSavings = () => {
    if (!canContinueProfile || !payday || commitBlocked) return;
    initUser({
      userName: userName.trim(),
      total_income_cents: incomeNum,
      fixed_overhead_cents: overheadNum,
      savings_base_cents: savingsDraft,
      currentBalanceVND: flexBalanceNum,
      paydayDate: paydayInputToIsoEndOfLocalDay(payday),
      targetHabit: targetHabit.trim(),
      weeklyHabitLimitVND: habitWeeklyNum,
    });
  };

  const inputClass =
    "w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 pl-12 text-[#f1f5f9] font-mono transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50";
  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0e1a] to-[#0a0e1a] p-6">
      <div className="mx-auto max-w-md pt-10">
        <div className="relative mb-6 flex h-32 items-center justify-center">
          <div className="absolute h-32 w-32 animate-pulse rounded-full bg-emerald-500/20 blur-2xl" />
          <Terminal
            className="relative h-16 w-16 text-emerald-400"
            style={{ filter: "drop-shadow(0 0 18px rgba(0,255,135,0.7))" }}
          />
        </div>

        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-2">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">QUICK SETUP</span>
          </div>
          <h1 className="mb-2 text-4xl font-black text-white">Welcome to SplurgeGuard</h1>
          <p className="text-sm text-slate-400">
            {phase === "profile"
              ? "Income, fixed costs, wallet balance, then pay-yourself-first savings."
              : "Lock in savings — hold to commit your pledge."}
          </p>
        </div>

        <div className="relative overflow-hidden space-y-5 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {phase === "profile" ? (
            <>
              <div>
                <label htmlFor="onboarding-user-name" className="mb-2 block text-sm text-slate-300">
                  What should we call you?
                </label>
                <div className="relative">
                  <User className={iconClass} aria-hidden />
                  <input
                    id="onboarding-user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Your name"
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div>
                <OnboardingCurrencyInput
                  id="onboarding-total-income"
                  label="Monthly Take-Home (VND)"
                  value={Number(totalIncome) || 0}
                  onCommit={(n) => setTotalIncome(String(n))}
                  placeholder="15000000"
                  helper="Your full income for this month — we'll subtract bills and savings to find your fun budget."
                />
              </div>
              <div>
                <OnboardingCurrencyInput
                  id="onboarding-overhead"
                  label="Needs & Bills (VND)"
                  value={Number(fixedOverhead) || 0}
                  onCommit={(n) => setFixedOverhead(String(n))}
                  placeholder="5000000"
                  helper="Rent, groceries, utilities, transport — everything you need to live comfortably."
                />
                {incomeOverheadInvalid && (
                  <p className="mt-2 text-xs font-medium text-rose-400" role="alert">
                    Overhead cannot exceed total income. Reduce overhead or raise income.
                  </p>
                )}
                {incomeNum > 0 && overheadNum > 0 && incomeNum === overheadNum && (
                  <p className="mt-2 text-xs text-amber-300/90" role="status">
                    Income equals overhead — you will have no room for PYF savings until income is higher than
                    overhead.
                  </p>
                )}
              </div>
              <div>
                <OnboardingCurrencyInput
                  id="onboarding-flex-balance"
                  label="Current Fun Money Balance (VND)"
                  value={Number(flexibleBalance) || 0}
                  onCommit={(n) => setFlexibleBalance(String(n))}
                  placeholder="2000000"
                  helper="What's in your account right now that's available to spend on non-essentials."
                />
              </div>
              <div>
                <label htmlFor="onboarding-payday" className="mb-2 block text-sm text-slate-300">
                  Next payday (must be in the future)
                </label>
                <div className="relative">
                  <Calendar className={iconClass} aria-hidden />
                  <input
                    id="onboarding-payday"
                    type="date"
                    value={payday}
                    onChange={(e) => setPayday(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {payday && !isPaydayStrictlyInFuture(payday) && (
                  <p className="mt-2 text-xs font-medium text-rose-400" role="alert">
                    Choose a payday after today so the cycle length is valid.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="onboarding-habit" className="mb-2 block text-sm text-slate-300">
                  What habit do you want to control/reduce?
                </label>
                <div className="relative">
                  <Target className={iconClass} aria-hidden />
                  <input
                    id="onboarding-habit"
                    value={targetHabit}
                    onChange={(e) => setTargetHabit(e.target.value)}
                    placeholder="e.g., Fast food, In-app purchases, Vaping"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <OnboardingCurrencyInput
                  id="onboarding-habit-limit"
                  label="Weekly Habit Cap (VND)"
                  value={Number(habitLimit) || 0}
                  onCommit={(n) => setHabitLimit(n > 0 ? String(n) : "0")}
                  placeholder="500000"
                  helper="Max you'll spend on this habit per week. Hit the cap and earn +250 DP every Monday."
                />
              </div>
              <button
                type="button"
                onClick={() => setPhase("savings")}
                disabled={!canContinueProfile}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-4 font-bold tracking-wide text-slate-950 shadow-[0_0_20px_-5px_#00ff87] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:hover:scale-100"
              >
                Continue to savings →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-cyan-400/90">
                <PiggyBank className="h-5 w-5" aria-hidden />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Set your savings</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Slide to pledge part of your cycle income into PYF savings (still tracked in-app). Maximum is your
                income minus needs &amp; bills.
              </p>
              {zeroSavingsCapacity ? (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-100"
                >
                  No savings capacity — income minus overhead is zero. Increase income or reduce overhead on the
                  previous step, then return here.
                </div>
              ) : (
                <div className="pt-2">
                  <label htmlFor="onboarding-savings-range" className="sr-only">
                    Savings pledge amount
                  </label>
                  <input
                    id="onboarding-savings-range"
                    type="range"
                    min={0}
                    max={maxSavingsPool}
                    step={10000}
                    value={Math.min(savingsDraft, maxSavingsPool)}
                    onChange={(e) => setSavingsDraft(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    <span>{fmtMoney(0, "VND", rate)}</span>
                    <span>{fmtMoney(maxSavingsPool, "VND", rate)}</span>
                  </div>
                </div>
              )}
              <p className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-3 text-sm text-slate-200 leading-relaxed">
                If you save{" "}
                <span className="font-mono font-bold text-cyan-300">{fmtMoney(savingsDraft, "VND", rate)}</span>,
                your daily allowance will be{" "}
                <span className="font-mono font-bold text-emerald-300">
                  {fmtMoney(dailyAllowancePreview, "VND", rate)}
                </span>
                .
              </p>
              {showAllowanceWarning && (
                <div
                  role="alert"
                  className="rounded-xl border-2 border-amber-500/70 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                >
                  Warning: This savings rate leaves you with no daily spending allowance. Adjust the slider or go
                  back — commit is disabled until allowance is above zero.
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setPhase("profile")}
                  className="rounded-xl border border-slate-600 px-4 py-3 font-mono text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-800/50"
                >
                  ← Back
                </button>
                <HoldSecureButton
                  onSecure={submitSavings}
                  label="COMMIT SAVINGS"
                  disabled={commitBlocked}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
