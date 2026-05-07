import { useState } from "react";
import { Terminal } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Onboarding() {
  const { initUser } = useApp();
  const [userName, setUserName] = useState("Mahmoud");
  const [balance, setBalance] = useState("");
  const [payday, setPayday] = useState("");
  const [weed, setWeed] = useState("");

  const canSubmit = userName.trim().length > 0 && Number(balance) > 0 && payday && Number(weed) >= 0;

  const submit = () => {
    if (!canSubmit) return;
    initUser({
      userName: userName.trim(),
      currentBalanceVND: Math.floor(Number(balance)),
      paydayDate: new Date(payday + "T23:59:59").toISOString(),
      weeklyWeedLimitVND: Math.floor(Number(weed)),
    });
  };

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
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">SplurgeGuard v1</span>
          </div>
          <h1 className="mb-2 text-4xl font-black text-white">Initialize Defenses</h1>
          <p className="text-sm text-slate-400">Configure your spending perimeter.</p>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-400">
              Identify Yourself (Operator Name)
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Mahmoud"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-lg text-emerald-400 outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-400">
              Starting Discretionary Balance (VND)
            </label>
            <input
              inputMode="numeric"
              value={balance}
              onChange={(e) => setBalance(e.target.value.replace(/\D/g, ""))}
              placeholder="5000000"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-lg text-emerald-400 outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-400">
              Next Payday
            </label>
            <input
              type="date"
              value={payday}
              onChange={(e) => setPayday(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-slate-400">
              Weekly Weed Limit (VND)
            </label>
            <input
              inputMode="numeric"
              value={weed}
              onChange={(e) => setWeed(e.target.value.replace(/\D/g, ""))}
              placeholder="500000"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-lg text-cyan-400 outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 py-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 shadow-[0_0_20px_-5px_#00ff87] transition-all hover:shadow-[0_0_30px_-5px_#00ff87] disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none"
          >
            Start Guarding
          </button>
        </div>
      </div>
    </div>
  );
}
