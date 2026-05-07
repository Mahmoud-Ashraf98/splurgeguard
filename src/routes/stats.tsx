import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fmtMoney } from "@/lib/splurge-utils";
import { DISCRETIONARY_CATEGORIES } from "@/lib/splurge-types";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

const COLORS = ["#00ff87", "#fbbf24", "#00d4ff", "#ff4757", "#a855f7"];

function StatsPage() {
  const app = useApp();
  const us = app.data.userState;

  const breakdown = useMemo(() => {
    if (!us) return [];
    const map: Record<string, number> = {};
    app.data.transactions
      .filter((t) => !t.isEssential)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amountVND;
      });
    return DISCRETIONARY_CATEGORIES.map((c, i) => ({
      cat: c,
      amt: map[c] || 0,
      color: COLORS[i % COLORS.length],
    })).filter((d) => d.amt > 0);
  }, [app.data.transactions, us]);

  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;
  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;

  const discretionaryTotal = app.data.transactions.filter((t) => !t.isEssential).reduce((s, t) => s + t.amountVND, 0);
  const startingBalance = us.currentBalanceVND + discretionaryTotal;
  const usedPct = startingBalance > 0 ? (discretionaryTotal / startingBalance) * 100 : 0;
  const discardedCount = app.data.vaultItems.filter((v) => v.status === "discarded").length;
  const totalBreakdown = breakdown.reduce((s, b) => s + b.amt, 0) || 1;

  const now = Date.now();
  const activeAmortizations = app.data.transactions
    .map((t) => {
      if (!t.amortizationDays || t.amortizationDays <= 1) return null;
      const daysSince = (now - new Date(t.timestamp).getTime()) / 86400000;
      if (daysSince >= t.amortizationDays || daysSince < 0) return null;
      const remaining = t.amountVND * (1 - daysSince / t.amortizationDays);
      const pct = Math.min(1, daysSince / t.amortizationDays);
      return { tx: t, remaining, pct };
    })
    .filter((x): x is { tx: typeof app.data.transactions[number]; remaining: number; pct: number } => !!x);

  // Donut
  let cumulative = 0;
  const radius = 60;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="px-5 pb-24 pt-6">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Cycle</p>
        <h1 className="text-2xl font-bold text-white">Statistics</h1>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Essential</p>
          <p className="mt-1 font-mono text-base font-bold text-white">{fmtMoney(us.essentialSpentVND, cur, rate)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Discretionary</p>
          <p className="mt-1 font-mono text-base font-bold text-emerald-400">{fmtMoney(discretionaryTotal, cur, rate)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">% Used</p>
          <p className="mt-1 font-mono text-base font-bold text-amber-400">{usedPct.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Vault Discarded</p>
          <p className="mt-1 font-mono text-base font-bold text-cyan-400">{discardedCount}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-slate-400">Discretionary Breakdown</h2>
        {breakdown.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">No discretionary spending yet.</p>
        ) : (
          <div className="flex items-center gap-5">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="20" />
              {breakdown.map((b) => {
                const portion = b.amt / totalBreakdown;
                const dash = circ * portion;
                const offset = circ * cumulative;
                cumulative += portion;
                return (
                  <circle
                    key={b.cat}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={b.color}
                    strokeWidth="20"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeDashoffset={-offset}
                  />
                );
              })}
            </svg>
            <div className="flex-1 space-y-1.5">
              {breakdown.map((b) => (
                <div key={b.cat} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                  <span className="flex-1 truncate text-slate-300">{b.cat}</span>
                  <span className="font-mono text-slate-400">{Math.round((b.amt / totalBreakdown) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeAmortizations.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-400">Active Amortizations</h2>
          <div className="space-y-2">
            {activeAmortizations.map(({ tx, remaining, pct }) => (
              <div
                key={tx.id}
                className="rounded-xl border border-cyan-400/20 bg-slate-900/40 p-4 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,212,255,0.25)]"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{tx.justification || tx.category}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {tx.category} · {tx.amortizationDays}d
                    </p>
                  </div>
                  <p className="font-mono text-sm tabular-nums text-cyan-400">{fmtMoney(Math.round(remaining), cur, rate)}</p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-800/60">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-all"
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-slate-400">Transactions</h2>
        {app.data.transactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
            No transactions yet.
          </p>
        ) : (
          <div className="space-y-2">
            {app.data.transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                <div
                  className={`h-9 w-1 rounded-full ${
                    t.isEssential ? "bg-slate-600" : t.category === "Weed" ? "bg-rose-500" : "bg-emerald-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-white">{t.category}</p>
                  <p className="truncate font-mono text-[10px] text-slate-500">
                    {new Date(t.timestamp).toLocaleString()} {t.fromVault && "· vault"}
                  </p>
                </div>
                <p className={`font-mono text-sm ${t.isEssential ? "text-slate-300" : "text-emerald-400"}`}>
                  {fmtMoney(t.amountVND, cur, rate)}
                </p>
                <button
                  onClick={() => app.deleteTransaction(t.id)}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
