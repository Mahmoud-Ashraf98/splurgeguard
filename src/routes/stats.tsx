import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Trash2,
  Activity,
  Shield,
  Wallet,
  PieChart,
  Lock,
  BarChart3,
  TrendingDown,
  List,
  Leaf,
  CreditCard,
  Beef,
  ShoppingBasket,
  Bike,
  Home,
  FileText,
  Zap,
  Pill,
  Package,
  CupSoda,
  Shirt,
  Plane,
  UtensilsCrossed,
  Cpu,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fmtMoney } from "@/lib/splurge-utils";
import { DISCRETIONARY_CATEGORIES } from "@/lib/splurge-types";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

const COLORS = ["#00ff87", "#fbbf24", "#00d4ff", "#ff4757", "#a855f7"];

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Meat and chicken": Beef,
  "Other essential home groceries": ShoppingBasket,
  "Motorbike expenses": Bike,
  "Rent": Home,
  "Visa and documents fees": FileText,
  "Utilities, Phone & Internet": Zap,
  "Medical & Pharmacy": Pill,
  "Other Essentials": Package,
  "Diet soda and bottled cold tea soft drinks": CupSoda,
  "Clothes": Shirt,
  "Travelling": Plane,
  "Weed": Leaf,
  "Dining Out & Street Food": UtensilsCrossed,
  "Software & Digital Subscriptions": CreditCard,
  "Tech & Hardware Upgrades": Cpu,
  "Fitness & Supplements": Dumbbell,
  "Other Splurges": Sparkles,
};

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

  let cumulative = 0;
  const radius = 60;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0e1a] to-[#0a0e1a] px-5 pb-24 pt-6">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-cyan-500" />
          <h1 className="text-xl font-bold tracking-widest uppercase text-[#f1f5f9] drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            Your Spending Habits
          </h1>
        </div>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg">
          <p className="text-[10px] tracking-widest uppercase text-slate-400">
            <Shield className="w-4 h-4 inline-block mr-1 text-emerald-500" />
            Boring Bills (Needs)
          </p>
          <p className="mt-1 text-emerald-400 font-mono text-xl font-bold">{fmtMoney(us.essentialSpentVND, cur, rate)}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg">
          <p className="text-[10px] tracking-widest uppercase text-slate-400">
            <Wallet className="w-4 h-4 inline-block mr-1 text-amber-500" />
            Fun Money (Splurges)
          </p>
          <p className="mt-1 text-amber-400 font-mono text-xl font-bold">{fmtMoney(discretionaryTotal, cur, rate)}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg">
          <p className="text-[10px] tracking-widest uppercase text-slate-400">
            <PieChart className="w-4 h-4 inline-block mr-1 text-cyan-500" />
            Budget Used
          </p>
          <p className="mt-1 text-cyan-400 font-mono text-xl font-bold">{usedPct.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg">
          <p className="text-[10px] tracking-widest uppercase text-slate-400">
            <Lock className="w-4 h-4 inline-block mr-1 text-purple-500" />
            Impulses Crushed
          </p>
          <p className="mt-1 text-purple-400 font-mono text-xl font-bold">{discardedCount}</p>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 mb-6">
        <div className="mb-4">
          <BarChart3 className="w-4 h-4 inline-block mr-2 text-slate-400" />
          <span className="text-xs tracking-widest uppercase text-slate-400">How You Spent Your Fun Money</span>
        </div>
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
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 mb-6">
          <div className="mb-1">
            <TrendingDown className="w-4 h-4 inline-block mr-2 text-cyan-500" />
            <span className="text-xs tracking-widest uppercase text-cyan-500">Spread-Out Costs</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-4 lowercase tracking-wide">Big purchases that are slowly draining your daily limit over time.</p>
          <div className="space-y-2">
            {activeAmortizations.map(({ tx, remaining, pct }) => (
              <div
                key={tx.id}
                className="border-l-2 border-cyan-500 pl-3 bg-slate-950/30 rounded-r-lg py-2 my-2"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate w-full text-sm text-white">{tx.justification || tx.category}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {tx.category} · {tx.amortizationDays}d
                    </p>
                  </div>
                  <p className="text-cyan-400 font-mono text-sm tabular-nums drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">
                    {fmtMoney(Math.round(remaining), cur, rate)}
                  </p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-cyan-500 shadow-[0_0_10px_#00d4ff] transition-all"
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5">
        <div className="mb-4">
          <List className="w-4 h-4 inline-block mr-2 text-slate-400" />
          <span className="text-xs tracking-widest uppercase text-slate-400">Recent Transactions</span>
        </div>
        {app.data.transactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
            No transactions yet.
          </p>
        ) : (
          <div>
            {app.data.transactions.map((t) => {
              const Icon = CATEGORY_ICON[t.category] ?? Package;
              const iconColor = t.isEssential
                ? "text-emerald-400"
                : t.category === "Weed"
                  ? "text-rose-500"
                  : "text-amber-400";
              return (
                <div
                  key={t.id}
                  className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 mb-2 flex justify-between items-center"
                >
                  <Icon className={`w-5 h-5 mr-3 shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-white">{t.category}</p>
                    <p className="truncate font-mono text-[10px] text-slate-500">
                      {new Date(t.timestamp).toLocaleString()} {t.fromVault && "· vault"}
                    </p>
                  </div>
                  <p className={`font-mono text-sm mx-3 ${t.isEssential ? "text-slate-300" : "text-emerald-400"}`}>
                    {fmtMoney(t.amountVND, cur, rate)}
                  </p>
                  <button
                    onClick={() => app.deleteTransaction(t.id)}
                    className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
