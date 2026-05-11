import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  RotateCcw,
  Activity,
  Shield,
  Wallet,
  BarChart3,
  TrendingDown,
  List,
  Target,
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
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fmtMoney } from "@/lib/splurge-utils";
import { DISCRETIONARY_CATEGORIES } from "@/lib/splurge-types";
import { MILESTONES, type FreedomMilestone } from "@/lib/milestones";

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
    const cats = Array.from(
      new Set([...DISCRETIONARY_CATEGORIES, ...(us.targetHabit ? [us.targetHabit] : [])])
    );
    return cats.map((c, i) => ({
      cat: c,
      amt: map[c] || 0,
      color: COLORS[i % COLORS.length],
    })).filter((d) => d.amt > 0);
  }, [app.data.transactions, us]);

  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;
  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;

  const discretionaryTotal = app.data.transactions.filter((t) => !t.isEssential).reduce((s, t) => s + t.amountVND, 0);
  const totalBreakdown = breakdown.reduce((s, b) => s + b.amt, 0) || 1;

  // === Freedom Engine: Total Preserved Capital ===
  const totalPreservedCapital: number = (app.data.vaultItems ?? [])
    .filter((v) => v.status === "discarded")
    .reduce((sum, v) => sum + (v.estimatedAmountVND ?? 0), 0);

  const currentMilestone: FreedomMilestone | null =
    [...MILESTONES].reverse().find((m) => totalPreservedCapital >= m.threshold) ?? null;

  const nextMilestone: FreedomMilestone | null =
    MILESTONES.find((m) => m.threshold > totalPreservedCapital) ?? null;

  const milestoneProgress: number = (() => {
    if (!nextMilestone) return 100;
    const floor = currentMilestone?.threshold ?? 0;
    const ceiling = nextMilestone.threshold;
    const range = ceiling - floor;
    if (range <= 0) return 100;
    return Math.min(100, ((totalPreservedCapital - floor) / range) * 100);
  })();

  // === Tactical Burn Rate ===
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycleStart = new Date(us.cycleStartDate);
  cycleStart.setHours(0, 0, 0, 0);

  const payday = new Date(us.paydayDate);
  payday.setHours(0, 0, 0, 0);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const totalCycleDays = Math.max(
    1,
    Math.round((payday.getTime() - cycleStart.getTime()) / MS_PER_DAY)
  );
  const daysElapsed = Math.min(
    totalCycleDays,
    Math.max(0, Math.round((today.getTime() - cycleStart.getTime()) / MS_PER_DAY))
  );
  const timePercent = Math.min(100, (daysElapsed / totalCycleDays) * 100);

  const totalFunSpent: number = (app.data.transactions ?? [])
    .filter((t) => {
      const txDate = new Date(t.timestamp);
      txDate.setHours(0, 0, 0, 0);
      return txDate >= cycleStart && t.isEssential === false;
    })
    .reduce((sum, t) => sum + Math.abs(t.amountVND ?? 0), 0);

  const startingBalance = (us.currentBalanceVND ?? 0) + totalFunSpent;
  const burnPercent = startingBalance > 0
    ? Math.min(100, (totalFunSpent / startingBalance) * 100)
    : 0;

  const isBurnWarning = burnPercent > timePercent;

  const now = Date.now();
  const activeAmortizations = app.data.transactions
    .map((t) => {
      const lifespan = t.amortizeDays ?? t.amortizationDays ?? 1;
      if (lifespan <= 1) return null;
      const daysSince = (now - new Date(t.timestamp).getTime()) / 86400000;
      if (daysSince >= lifespan || daysSince < 0) return null;
      const remaining = t.amountVND * (1 - daysSince / lifespan);
      const pct = Math.min(1, daysSince / lifespan);
      return { tx: t, lifespan, remaining, pct };
    })
    .filter((x): x is { tx: typeof app.data.transactions[number]; lifespan: number; remaining: number; pct: number } => !!x);

  let cumulative = 0;
  const radius = 60;
  const circ = 2 * Math.PI * radius;

  // ── PHASE 2: VICE FIREWALL MATRIX ────────────────────────────────────────
  const FIREWALL_DAYS = 14;

  const firewallDays = Array.from({ length: FIREWALL_DAYS }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (FIREWALL_DAYS - 1 - i));
    return d;
  });

  const todayTs = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  })();

  const dailyLimit = app.smartDailyLimit ?? 0;

  const matrixData = firewallDays.map((day) => {
    const dayTs = day.getTime();
    const spentThatDay = (app.data.transactions ?? [])
      .filter((t) => {
        const txDate = new Date(t.timestamp);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === dayTs && t.isEssential === false;
      })
      .reduce((sum, t) => sum + Math.abs(t.amountVND ?? 0), 0);

    let status: 'perfect' | 'controlled' | 'breach' = 'perfect';
    if (spentThatDay > 0 && spentThatDay <= dailyLimit) status = 'controlled';
    if (spentThatDay > dailyLimit) status = 'breach';

    return { date: day, dayTs, spent: spentThatDay, status };
  });

  // Days elapsed since cycle start, for Payload Decay progress
  const cycleStartMs = new Date(us.cycleStartDate).setHours(0, 0, 0, 0);
  const todayMidnightMs = new Date().setHours(0, 0, 0, 0);
  const daysElapsedInCycle = Math.max(
    0,
    Math.round((todayMidnightMs - cycleStartMs) / MS_PER_DAY)
  );

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
      </div>

      {/* Tactical Burn Rate Gauge — full width, below the grid */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 mt-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${isBurnWarning ? 'text-rose-500' : 'text-emerald-400'}`} />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Tactical Burn Rate
            </p>
          </div>
          <span
            className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${
              isBurnWarning
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-emerald-400/10 text-emerald-400'
            }`}
          >
            {isBurnWarning ? 'WARNING: PACING EXCEEDED' : 'OPTIMAL ACCUMULATION'}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between font-mono text-[9px] text-slate-500 mb-1">
            <span>Cycle Time Elapsed</span>
            <span>{Math.floor(timePercent)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500/50"
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[9px] text-slate-500 mb-1">
            <span>Budget Spent</span>
            <span className={isBurnWarning ? 'text-rose-400' : 'text-emerald-400'}>
              {Math.floor(burnPercent)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${
                isBurnWarning
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${burnPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Freedom Engine — full width, below the gauge */}
      <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 mt-4 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-cyan-400" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-400/80">
              Capital Preserved
            </p>
          </div>

          <h2 className="text-3xl font-black text-white tracking-widest tabular-nums mb-4 drop-shadow-[0_0_12px_rgba(0,212,255,0.3)]">
            {fmtMoney(totalPreservedCapital, cur, rate)}
          </h2>

          {currentMilestone && (
            <div className="mb-4 p-3 rounded-lg border border-cyan-400/20 bg-cyan-400/10">
              <p className="font-mono text-[8px] uppercase tracking-widest text-cyan-400 mb-1">
                Secured Milestone
              </p>
              <p className="font-bold text-sm text-cyan-50">{currentMilestone.title}</p>
            </div>
          )}

          {nextMilestone && (
            <div className="mb-4">
              <div className="flex justify-between font-mono text-[9px] text-slate-400 mb-1">
                <span className="truncate mr-2">Next: {nextMilestone.title}</span>
                <span className="flex-shrink-0">{fmtMoney(nextMilestone.threshold, cur, rate)}</span>
              </div>
              <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-1000"
                  style={{
                    width: `${milestoneProgress}%`,
                    boxShadow: '0 0 10px rgba(0,212,255,0.6)',
                  }}
                />
              </div>
            </div>
          )}

          {!nextMilestone && currentMilestone && (
            <div className="mb-4 p-3 rounded-lg border border-cyan-400/40 bg-cyan-400/10">
              <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">
                Maximum milestone reached. You have beaten the game.
              </p>
            </div>
          )}

          <div className="mt-2 pt-4 border-t border-white/5">
            <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500 mb-2">
              Neutralized Impulses
            </p>
            <div
              className="max-h-24 overflow-y-auto space-y-1 pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
              {(app.data.vaultItems ?? [])
                .filter((v) => v.status === 'discarded')
                .slice()
                .reverse()
                .map((v) => (
                  <div key={v.id} className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500 line-through truncate mr-2">{v.itemName}</span>
                    <span className="text-cyan-500/50 tabular-nums flex-shrink-0">
                      +{fmtMoney(v.estimatedAmountVND, cur, rate)}
                    </span>
                  </div>
                ))}
              {(app.data.vaultItems ?? []).filter((v) => v.status === 'discarded').length === 0 && (
                <p className="font-mono text-[9px] text-slate-700 italic">
                  No impulses neutralized yet.
                </p>
              )}
            </div>
          </div>
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

      {/* ── Vice Firewall Matrix ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 mt-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-slate-400" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Vice Firewall — Last 14 Days
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
          {matrixData.map((cell, idx) => {
            let boxClasses =
              'w-full aspect-square rounded border transition-all duration-300 ';
            if (cell.dayTs > todayTs) {
              boxClasses += 'bg-slate-800/30 border-slate-700/30';
            } else if (cell.status === 'perfect') {
              boxClasses +=
                'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
            } else if (cell.status === 'controlled') {
              boxClasses += 'bg-cyan-500/20 border-cyan-500/40';
            } else {
              boxClasses +=
                'bg-rose-500/30 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse';
            }

            const tooltipAlign =
              idx <= 1
                ? 'left-0 translate-x-0'
                : idx >= FIREWALL_DAYS - 2
                  ? 'right-0 translate-x-0'
                  : 'left-1/2 -translate-x-1/2';

            return (
              <div key={cell.dayTs} className="relative group">
                <div className={boxClasses} />
                <div
                  className={`pointer-events-none absolute bottom-full mb-1 z-10 whitespace-nowrap rounded bg-slate-950 border border-slate-700 px-2 py-1 font-mono text-[9px] text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity ${tooltipAlign}`}
                >
                  {cell.date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {': '}
                  {fmtMoney(cell.spent, cur, rate)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">
          <span>Older</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500/40 border border-emerald-500/50" />
              Zero
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-cyan-500/40 border border-cyan-500/40" />
              Controlled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-rose-500/40 border border-rose-500/60" />
              Breach
            </span>
          </div>
          <span>Today</span>
        </div>
      </div>

      {activeAmortizations.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 mb-6">
          <div className="mb-1">
            <TrendingDown className="w-4 h-4 inline-block mr-2 text-cyan-500" />
            <span className="text-xs tracking-widest uppercase text-cyan-500">Spread-Out Costs</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-4 lowercase tracking-wide">Big purchases that are slowly draining your daily limit over time.</p>
          <div className="space-y-2">
            {activeAmortizations.map(({ tx, lifespan }) => {
              const progressPct = Math.min(100, (daysElapsedInCycle / lifespan) * 100);
              const remainingPct = 100 - progressPct;
              const dailyDrain = tx.amountVND / lifespan;
              return (
                <div
                  key={tx.id}
                  className="border-l-2 border-cyan-500 pl-3 bg-slate-950/30 rounded-r-lg py-2 my-2"
                >
                  <div className="flex justify-between items-baseline mb-1 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-white truncate">
                        {tx.justification || tx.category}
                      </p>
                      <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500">
                        {tx.category} · {lifespan}d
                      </p>
                    </div>
                    <p className="text-cyan-400 font-mono text-sm tabular-nums drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] flex-shrink-0">
                      {fmtMoney(tx.amountVND, cur, rate)}
                    </p>
                  </div>

                  <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1">
                    {`[DRAIN: -${fmtMoney(Math.round(dailyDrain), cur, rate)} / DAY]`}
                  </p>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
                    <div
                      className="h-full bg-slate-600/60"
                      style={{ width: `${progressPct}%` }}
                    />
                    <div
                      className="payload-decay-bar h-full"
                      style={{ width: `${remainingPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
              const isHabit = !!us.targetHabit && t.category.toLowerCase().trim() === us.targetHabit.toLowerCase().trim();
              const Icon = isHabit ? Target : (CATEGORY_ICON[t.category] ?? Package);
              const iconColor = t.isEssential
                ? "text-emerald-400"
                : isHabit
                  ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  : "text-amber-400";
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 min-w-0 rounded-xl border border-white/5 bg-slate-900/20 p-3 sm:p-4 mb-2 transition-colors hover:bg-slate-900/40"
                >
                  <div
                    className={`flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                      t.isEssential
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-bold text-slate-200 truncate">{t.category}</p>
                    <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 truncate mt-0.5">
                      {(() => {
                        const d = new Date(t.timestamp);
                        const hasTime = t.timestamp && String(t.timestamp).includes("T");
                        return d.toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {}),
                        });
                      })()}
                      <span className="mx-1.5 opacity-50">|</span>
                      [{t.fromVault ? "VAULT" : "DIRECT"}]
                    </p>
                    {t.justification && (
                      <p className="text-[10px] italic text-slate-400 truncate mt-1 border-l border-slate-700 pl-2">
                        &gt; &ldquo;{t.justification}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-start gap-2 flex-shrink-0 ml-2">
                    <p className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
                      t.isEssential ? "text-emerald-400/80" : "text-rose-400"
                    }`}>
                      {fmtMoney(Math.abs(t.amountVND ?? 0), cur, rate)}
                      {(t.amortizeDays ?? t.amortizationDays ?? 1) > 1 && (
                        <span className="ml-2 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-500/70 whitespace-nowrap">
                          📅 {t.amortizeDays ?? t.amortizationDays}D
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => app.deleteTransaction(t.id)}
                      className="group flex items-center gap-1.5 px-2 py-1 rounded border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 transition-all active:scale-95 touch-none select-none"
                      aria-label="Revert transaction"
                    >
                      <RotateCcw className="h-3 w-3 text-slate-600 group-hover:text-rose-400 transition-colors" />
                      <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-widest text-slate-600 group-hover:text-rose-400 transition-colors">
                        Revert
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
