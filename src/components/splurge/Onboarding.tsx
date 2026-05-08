import { useState } from "react";
import { Terminal, User, Wallet, Calendar, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Onboarding() {
  const { initUser } = useApp();
  const [userName, setUserName] = useState("Mahmoud");
  const [balance, setBalance] = useState("");
  const [payday, setPayday] = useState("");
  const [targetHabit, setTargetHabit] = useState("");
  const [habitLimit, setHabitLimit] = useState("");

  const canSubmit =
    userName.trim().length > 0 &&
    Number(balance) > 0 &&
    payday &&
    targetHabit.trim().length > 0 &&
    Number(habitLimit) >= 0;

  const submit = () => {
    if (!canSubmit) return;
    initUser({
      userName: userName.trim(),
      currentBalanceVND: Math.floor(Number(balance)),
      paydayDate: new Date(payday + "T23:59:59").toISOString(),
      targetHabit: targetHabit.trim(),
      weeklyHabitLimitVND: Math.floor(Number(habitLimit)),
    });
  };

  const inputClass =
    "w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 pl-12 text-[#f1f5f9] font-mono transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50";
  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0e1a] to-[#0a0e1a] p-6">
      <div className="mx-auto max-w-md pt-10">
        {/* Glowing orb visual */}
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
          <p className="text-sm text-slate-400">Let's set up your budget and start crushing those impulse buys.</p>
        </div>

        <div className="relative overflow-hidden space-y-5 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              What should we call you?
            </label>
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
            <label className="mb-2 block text-sm text-slate-300">
              Available Fun Money (VND)
            </label>
            <div className="relative">
              <Wallet className={iconClass} />
              <input
                inputMode="numeric"
                value={balance}
                onChange={(e) => setBalance(e.target.value.replace(/\D/g, ""))}
                placeholder="5000000"
                className={inputClass}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">How much can you safely spend on non-essentials until you get paid?</p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              When is your next payday?
            </label>
            <div className="relative">
              <Calendar className={iconClass} />
              <input
                type="date"
                value={payday}
                onChange={(e) => setPayday(e.target.value)}
                className={inputClass}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Your daily limit will reset on this date.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Weekly Weed Target (VND)
            </label>
            <div className="relative">
              <Leaf className={iconClass} />
              <input
                inputMode="numeric"
                value={weed}
                onChange={(e) => setWeed(e.target.value.replace(/\D/g, ""))}
                placeholder="500000"
                className={inputClass}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Stay under this weekly amount to earn a massive Discipline Point bonus.</p>
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-4 font-bold tracking-wide text-slate-950 shadow-[0_0_20px_-5px_#00ff87] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:hover:scale-100"
          >
            Start Guarding My Wallet →
          </button>
        </div>
      </div>
    </div>
  );
}
