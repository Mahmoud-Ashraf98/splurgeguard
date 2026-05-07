import { useState } from "react";
import { useApp } from "@/context/AppContext";

export function Onboarding() {
  const { initUser } = useApp();
  const [balance, setBalance] = useState("");
  const [payday, setPayday] = useState("");
  const [weed, setWeed] = useState("");

  const canSubmit = Number(balance) > 0 && payday && Number(weed) >= 0;

  const submit = () => {
    if (!canSubmit) return;
    initUser({
      currentBalanceVND: Math.floor(Number(balance)),
      paydayDate: new Date(payday + "T23:59:59").toISOString(),
      weeklyWeedLimitVND: Math.floor(Number(weed)),
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-md pt-12">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-2">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">SplurgeGuard v1</span>
          </div>
          <h1 className="mb-2 text-4xl font-black text-white">Initialize Defenses</h1>
          <p className="text-sm text-slate-400">Configure your spending perimeter.</p>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
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
            className="w-full rounded-lg bg-emerald-400 py-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
          >
            Start Guarding
          </button>
        </div>
      </div>
    </div>
  );
}
