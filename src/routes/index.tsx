import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Flame, Coins, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Onboarding } from "@/components/splurge/Onboarding";
import { StatusRing } from "@/components/splurge/StatusRing";
import { LogSheet } from "@/components/splurge/LogSheet";
import { fmtMoney, nextMilestone } from "@/lib/splurge-utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const app = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dpModal, setDpModal] = useState(false);
  const [dpAmt, setDpAmt] = useState("");

  if (!app.data.userState) return <Onboarding />;
  const us = app.data.userState;
  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;

  const remaining = Math.max(0, app.smartDailyLimit - app.todayDiscretionary);
  const next = nextMilestone(us.currentStreakDays);
  const milestoneProgress = Math.min(1, us.currentStreakDays / next);

  const activeVault = app.data.vaultItems.filter((v) => v.status === "cooling" || v.status === "ready").slice(0, 3);

  const submitSpendDP = () => {
    const n = Math.floor(Number(dpAmt));
    if (n > 0 && n <= us.totalDP) {
      app.spendDP(n);
      setDpAmt("");
      setDpModal(false);
    }
  };

  return (
    <div className="px-5 pb-32 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Welcome Back</p>
          <h1 className="text-xl font-bold text-white">Vibe Coder</h1>
        </div>
        <button
          onClick={app.toggleCurrency}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-emerald-400 hover:border-emerald-400"
        >
          {cur}
        </button>
      </header>

      <div className="mb-6 flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <StatusRing used={app.todayDiscretionary} limit={app.smartDailyLimit} />
        <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-slate-950 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Spent Today</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-white">{fmtMoney(app.todayDiscretionary, cur, rate)}</p>
          </div>
          <div className="rounded-lg bg-slate-950 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Remaining</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-emerald-400">{fmtMoney(remaining, cur, rate)}</p>
          </div>
        </div>
        <div className="mt-3 w-full rounded-lg bg-slate-950 p-3 text-center">
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Smart Daily Limit</p>
          <p className="mt-0.5 font-mono text-base font-bold text-cyan-400">{fmtMoney(app.smartDailyLimit, cur, rate)}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Discipline Points</span>
          </div>
          <button
            onClick={() => setDpModal(true)}
            className="rounded-md border border-cyan-400/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-400 hover:bg-cyan-400/10"
          >
            Spend DP
          </button>
        </div>
        <div className="mb-3 flex items-end justify-between">
          <p className="font-mono text-4xl font-black text-cyan-400">{us.totalDP}</p>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className="h-5 w-5" />
            <span className="font-mono text-lg font-bold">{us.currentStreakDays}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">day streak</span>
          </div>
        </div>
        <div className="mb-1 flex justify-between font-mono text-[10px] text-slate-500">
          <span>Next milestone</span>
          <span>{us.currentStreakDays}/{next} days</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${milestoneProgress * 100}%` }} />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-slate-400">Active Vault</h2>
          <Link to="/vault" className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">View all →</Link>
        </div>
        {activeVault.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center">
            <Lock className="mx-auto mb-2 h-6 w-6 text-slate-600" />
            <p className="text-xs text-slate-500">No items cooling. Resist an impulse → vault it.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeVault.map((v) => (
              <div key={v.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{v.itemName}</p>
                    <p className="font-mono text-[10px] uppercase text-slate-500">{v.category} · {v.delayHours}h</p>
                  </div>
                  <p className="font-mono text-sm text-cyan-400">{fmtMoney(v.estimatedAmountVND, cur, rate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-5">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 font-mono text-sm font-bold uppercase tracking-widest text-slate-950 shadow-[0_0_30px_rgba(0,255,135,0.4)] transition-all hover:bg-emerald-300"
        >
          <Plus className="h-5 w-5" /> Log Expense
        </button>
      </div>

      <LogSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {dpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDpModal(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-cyan-400/40 bg-slate-900 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-mono text-sm uppercase tracking-wider text-cyan-400">Redeem DP</h3>
            <p className="mb-3 text-xs text-slate-400">Available: {us.totalDP} DP</p>
            <input
              inputMode="numeric"
              value={dpAmt}
              onChange={(e) => setDpAmt(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-right font-mono text-2xl text-cyan-400 outline-none focus:border-cyan-400"
            />
            <div className="flex gap-2">
              <button onClick={() => setDpModal(false)} className="flex-1 rounded-lg border border-slate-700 py-2.5 font-mono text-xs uppercase tracking-wider text-slate-400">Cancel</button>
              <button onClick={submitSpendDP} className="flex-1 rounded-lg bg-cyan-400 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-950">Redeem</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
