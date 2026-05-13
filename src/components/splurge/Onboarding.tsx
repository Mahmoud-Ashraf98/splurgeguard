import { useEffect, useMemo, useState } from "react";
import { Terminal, User, Wallet, Calendar, Target, Landmark, PiggyBank } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HoldSecureButton } from "@/components/splurge/HoldSecureButton";
import { daysBetween, fmtMoney } from "@/lib/splurge-utils";

type Phase = "profile" | "savings";

export function Onboarding() {
  const { initUser } = useApp();
  const [phase, setPhase] = useState<Phase>("profile");
  const [userName, setUserName] = useState("Mahmoud");
  const [totalIncome, setTotalIncome] = useState("");
  const [fixedOverhead, setFixedOverhead] = useState("");
  const [payday, setPayday] = useState("");
  const [targetHabit, setTargetHabit] = useState("");
  const [habitLimit, setHabitLimit] = useState("");
  const [savingsDraft, setSavingsDraft] = useState(0);

  const incomeNum = Math.max(0, Math.floor(Number(totalIncome.replace(/\D/g, "")) || 0));
  const overheadNum = Math.max(0, Math.floor(Number(fixedOverhead.replace(/\D/g, "")) || 0));
  const maxSavingsPool = Math.max(0, incomeNum - overheadNum);

  useEffect(() => {
    if (phase !== "savings") return;
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
    return Math.max(1, daysBetween(new Date(), new Date(payday + "T23:59:59")));
  }, [payday]);

  const poolAfterSavings = Math.max(0, incomeNum - overheadNum - savingsDraft);
  const dailyAllowancePreview = Math.floor(poolAfterSavings / daysUntilPayday);
  const showAllowanceWarning = dailyAllowancePreview <= 0 && maxSavingsPool > 0;

  const canContinueProfile =
    userName.trim().length > 0 &&
    incomeNum > 0 &&
    overheadNum >= 0 &&
    incomeNum > overheadNum &&
    !!payday &&
    targetHabit.trim().length > 0 &&
    Number(habitLimit.replace(/\D/g, "")) >= 0;

  const submitSavings = () => {
    if (!canContinueProfile || !payday) return;
    initUser({
      userName: userName.trim(),
      total_income_cents: incomeNum,
      fixed_overhead_cents: overheadNum,
      savings_base_cents: savingsDraft,
      paydayDate: new Date(payday + "T23:59:59").toISOString(),
      targetHabit: targetHabit.trim(),
      weeklyHabitLimitVND: Math.floor(Number(habitLimit.replace(/\D/g, "")) || 0),
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
              ? "Income, fixed costs, then pay-yourself-first savings."
              : "Lock in savings — hold to commit your pledge."}
          </p>
        </div>

        <div className="relative overflow-hidden space-y-5 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {phase === "profile" ? (
            <>
              <div>
                <label className="mb-2 block text-sm text-slate-300">What should we call you?</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Mahmoud"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Total take-home for this cycle (VND)</label>
                <div className="relative">
                  <Landmark className={iconClass} />
                  <input
                    inputMode="numeric"
                    value={totalIncome}
                    onChange={(e) => setTotalIncome(e.target.value.replace(/\D/g, ""))}
                    placeholder="8000000"
                    className={inputClass}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Gross amount you are allocating across savings, fixed bills, and flexible spending until payday.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Fixed overhead (rent, debt minimums, etc.)</label>
                <div className="relative">
                  <Wallet className={iconClass} />
                  <input
                    inputMode="numeric"
                    value={fixedOverhead}
                    onChange={(e) => setFixedOverhead(e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">When is your next payday?</label>
                <div className="relative">
                  <Calendar className={iconClass} />
                  <input
                    type="date"
                    value={payday}
                    onChange={(e) => setPayday(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">What habit do you want to control/reduce?</label>
                <div className="relative">
                  <Target className={iconClass} />
                  <input
                    value={targetHabit}
                    onChange={(e) => setTargetHabit(e.target.value)}
                    placeholder="e.g., Fast food, In-app purchases, Vaping"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Weekly Limit for this habit (VND)</label>
                <div className="relative">
                  <Target className={iconClass} />
                  <input
                    inputMode="numeric"
                    value={habitLimit}
                    onChange={(e) => setHabitLimit(e.target.value.replace(/\D/g, ""))}
                    placeholder="500000"
                    className={inputClass}
                  />
                </div>
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
                <PiggyBank className="h-5 w-5" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Set your savings</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Slide to pledge part of your cycle income into PYF savings (still tracked in-app). Maximum is your
                income minus fixed overhead.
              </p>
              <div className="pt-2">
                <input
                  type="range"
                  min={0}
                  max={maxSavingsPool}
                  step={10000}
                  value={Math.min(savingsDraft, maxSavingsPool)}
                  onChange={(e) => setSavingsDraft(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  <span>{fmtMoney(0, "VND", 26310)}</span>
                  <span>{fmtMoney(maxSavingsPool, "VND", 26310)}</span>
                </div>
              </div>
              <p className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-3 text-sm text-slate-200 leading-relaxed">
                If you save{" "}
                <span className="font-mono font-bold text-cyan-300">{fmtMoney(savingsDraft, "VND", 26310)}</span>,
                your daily allowance will be{" "}
                <span className="font-mono font-bold text-emerald-300">
                  {fmtMoney(dailyAllowancePreview, "VND", 26310)}
                </span>
                .
              </p>
              {showAllowanceWarning && (
                <div
                  role="alert"
                  className="rounded-xl border-2 border-amber-500/70 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                >
                  Warning: This savings rate leaves you with no daily spending allowance.
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
                <HoldSecureButton onSecure={submitSavings} label="COMMIT SAVINGS" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
