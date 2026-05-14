import React, { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fmtMoney, txIsCompleted, selectNetSavingsCents } from "@/lib/splurge-utils";
import { DISCRETIONARY_CATEGORIES } from "@/lib/splurge-types";
import { getActiveAmortizations, getDailyDrain, MS_PER_DAY } from "@/lib/amortization";
import { MILESTONES, type FreedomMilestone } from "@/lib/milestones";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats — SplurgeGuard" },
      { name: "description", content: "Spending breakdown, tactical burn rate, vice firewall, and the Freedom Engine — see how much capital you've preserved." },
      { property: "og:title", content: "Stats — Watch your discipline compound" },
      { property: "og:description", content: "Cycle pacing, category breakdown, and total preserved capital." },
      { property: "og:url", content: "https://splurgeguard.lovable.app/stats" },
    ],
    links: [{ rel: "canonical", href: "https://splurgeguard.lovable.app/stats" }],
  }),
  component: StatsPage,
});

const COLORS = [
  "#00ff87", "#fbbf24", "#00d4ff", "#ff4757", "#a855f7",
  "#f97316", "#06b6d4", "#84cc16", "#ec4899",
];

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
  const [trophyRoomOpen, setTrophyRoomOpen] = useState(false);
  const app = useApp();
  const { vaultItems } = app.data;
  const us = app.data.userState;

  const activeAmortizations = useMemo(
    () => getActiveAmortizations(app.data.transactions ?? []),
    [app.data.transactions],
  );

  const breakdown = useMemo(() => {
    if (!us) return [];
    const map: Record<string, number> = {};
    app.data.transactions
      .filter((t) => !t.isEssential && txIsCompleted(t))
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

  const discretionaryTotal = app.data.transactions
    .filter((t) => !t.isEssential && txIsCompleted(t))
    .reduce((s, t) => s + t.amountVND, 0);
  const totalBreakdown = breakdown.reduce((s, b) => s + b.amt, 0) || 1;
  const funMoneyDonutTotal = breakdown.reduce((s, b) => s + b.amt, 0);

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
      return txDate >= cycleStart && t.isEssential === false && txIsCompleted(t);
    })
    .reduce((sum, t) => sum + Math.abs(t.amountVND ?? 0), 0);

  const startingBalance = (us.currentBalanceVND ?? 0) + totalFunSpent;
  const burnPercent = startingBalance > 0
    ? Math.min(100, (totalFunSpent / startingBalance) * 100)
    : 0;

  const isBurnWarning = burnPercent > timePercent;

  const trophies = vaultItems.filter(item => item.status === 'discarded');
  const radius = 60;
  const circ = 2 * Math.PI * radius;

  const segments = React.useMemo(() => {
    let offset = 0;
    return breakdown.map((b) => {
      const portion = b.amt / totalBreakdown;
      const dash = circ * portion;
      const result = { ...b, dash, offset };
      offset += portion;
      return result;
    });
  }, [breakdown, totalBreakdown, circ]);

  // ── PHASE 2: VICE FIREWALL MATRIX ────────────────────────────────────────
  const FIREWALL_DAYS = 14;

  const firewallDays = Array.from({ length: FIREWALL_DAYS }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (FIREWALL_DAYS - 1 - i));
    return d;
  });

  const todayMs = today.getTime();

  const dailyLimit = app.smartDailyLimit ?? 0;

  const matrixData = React.useMemo(() => {
    const spent: Record<string, number> = {};
    for (const t of app.data.transactions || []) {
      if (t.isEssential || !txIsCompleted(t)) continue;
      const key = t.timestamp.slice(0, 10);
      spent[key] = (spent[key] ?? 0) + Math.abs(t.amountVND ?? 0);
    }
    return firewallDays.map((day) => {
      const dayTs = day.getTime();
      const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const spentThatDay = spent[dayKey] ?? 0;

      let status: 'perfect' | 'controlled' | 'breach' = 'perfect';
      if (spentThatDay > 0 && spentThatDay <= dailyLimit) status = 'controlled';
      if (spentThatDay > dailyLimit) status = 'breach';

      return { date: day, dayTs, spent: spentThatDay, status };
    });
  }, [firewallDays, app.data.transactions, dailyLimit]);

  const todayMidnightMs = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  })();

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

      {/* ── The Freedom Engine — trophy room for preserved capital ───────── */}
      {(() => {
        const discardedItems = (app.data.vaultItems ?? [])
          .filter((v) => v.status === 'discarded')
          .slice()
          .reverse();
        const discardedCount = discardedItems.length;
        const isNearMilestone = milestoneProgress > 90;

        return (
          <section
            aria-label="The Freedom Engine"
            className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-5 sm:p-6 mt-4 mb-6"
          >
            {/* Ambient halos */}
            <div className="pointer-events-none absolute inset-0 bg-cyan-500/5 blur-3xl" />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 right-1/4 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
            />

            <div className="relative z-10 flex flex-col">
              {/* Eyebrow */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-cyan-400" />
                  <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-cyan-400/90">
                    The Freedom Engine
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold tracking-widest uppercase cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors duration-200 underline-offset-2 hover:underline select-none bg-transparent border-0 p-0"
                  onClick={() => setTrophyRoomOpen(true)}
                >
                  Trophy Room
                </button>
              </div>

              {/* ── Capital Core — Hero Metric ───────────────────────────── */}
              <div className="flex flex-col items-center text-center py-3 sm:py-5 mb-5">
                <h2 className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.45em] text-emerald-400/70 mb-2">
                  Total Capital Preserved
                </h2>
                <p
                  className="font-mono font-black tabular-nums text-white tracking-tight leading-none break-all"
                  style={{
                    fontSize: 'clamp(2rem, 9vw, 4.25rem)',
                    textShadow:
                      '0 0 28px rgba(0,212,255,0.55), 0 0 56px rgba(52,211,153,0.28)',
                    filter:
                      'drop-shadow(0 0 18px rgba(0,212,255,0.55)) drop-shadow(0 0 32px rgba(52,211,153,0.22))',
                  }}
                >
                  {fmtMoney(totalPreservedCapital, cur, rate)}
                </p>
                <span className="mt-3 font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500">
                  {discardedCount} Impulse{discardedCount === 1 ? '' : 's'} Neutralized
                </span>
              </div>

              {(() => {
                const currentNetSavings = selectNetSavingsCents(us);
                const current_day_of_cycle = Math.max(1, daysElapsed);
                const dailyWealthGrowthCents = Math.floor(currentNetSavings / current_day_of_cycle);
                return (
                  <div className="mb-5 w-full rounded-xl border border-emerald-500/25 bg-slate-950/50 p-4 text-left ring-1 ring-emerald-500/10">
                    <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-emerald-400/80 mb-2">
                      Daily wealth growth
                    </p>
                    <p className="font-mono text-2xl font-black tabular-nums text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]">
                      {fmtMoney(dailyWealthGrowthCents, cur, rate)}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-slate-600">
                      Net savings ÷ day {current_day_of_cycle} of cycle
                    </p>
                  </div>
                );
              })()}

              {/* ── Cinematic Milestone Cards ────────────────────────────── */}
              {currentMilestone && (
                <div className="mb-3 rounded-xl ring-1 ring-cyan-500/20 bg-cyan-500/10 backdrop-blur-md p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3 w-3 text-cyan-300" />
                    <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-cyan-300/80">
                      Most Recent Milestone
                    </p>
                  </div>
                  <p className="font-bold text-sm text-cyan-50">{currentMilestone.title}</p>
                </div>
              )}

              {nextMilestone && (
                <div className="mb-4 rounded-xl ring-1 ring-cyan-500/20 bg-cyan-500/10 backdrop-blur-md p-4">
                  <div className="flex flex-col gap-1 w-full sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-cyan-300/80 mb-1">
                        Next Milestone
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-normal flex-1 min-w-0">
                        {nextMilestone.title}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-cyan-300/60">
                        Target
                      </p>
                      <p className="text-cyan-400 font-mono text-sm font-bold shrink-0 sm:text-right">
                        {fmtMoney(nextMilestone.threshold, cur, rate)}
                      </p>
                    </div>
                  </div>

                  {/* Segmented Reactor Progress Bar */}
                  <div>
                    <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.3em] mb-1.5">
                      <span className={isNearMilestone ? 'text-emerald-300' : 'text-cyan-300/70'}>
                        Reactor Charge
                      </span>
                      <span
                        className={`tabular-nums ${
                          isNearMilestone ? 'text-emerald-300' : 'text-cyan-100'
                        }`}
                      >
                        {Math.floor(milestoneProgress)}%
                      </span>
                    </div>
                    <div
                      className={`relative h-2.5 overflow-hidden rounded-full bg-slate-950/80 ring-1 transition-all duration-500 ${
                        isNearMilestone ? 'ring-emerald-400/40' : 'ring-cyan-500/15'
                      }`}
                    >
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-1000"
                        style={{
                          width: `${milestoneProgress}%`,
                          background: isNearMilestone
                            ? 'linear-gradient(90deg, rgba(0,212,255,0.65), rgba(52,211,153,0.95))'
                            : 'linear-gradient(90deg, rgba(0,255,135,0.55), rgba(0,212,255,0.95))',
                          boxShadow: isNearMilestone
                            ? '0 0 14px rgba(52,211,153,0.65), inset 0 0 6px rgba(255,255,255,0.25)'
                            : '0 0 12px rgba(0,212,255,0.55), inset 0 0 6px rgba(255,255,255,0.2)',
                        }}
                      />
                      <div
                        className="absolute inset-y-0 right-0"
                        style={{
                          width: `${Math.max(0, 100 - milestoneProgress)}%`,
                          background: isNearMilestone
                            ? 'linear-gradient(90deg, rgba(52,211,153,0.15), rgba(52,211,153,0.35))'
                            : 'linear-gradient(90deg, rgba(15,23,42,0), rgba(30,41,59,0.4))',
                          animation: isNearMilestone
                            ? 'vault-pulse 1.4s ease-in-out infinite'
                            : undefined,
                          boxShadow: isNearMilestone
                            ? '0 0 14px rgba(52,211,153,0.55)'
                            : undefined,
                        }}
                      />
                      {/* Energy-cell dividers overlay */}
                      <div
                        aria-hidden
                        className="xp-power-cells absolute inset-0 pointer-events-none"
                      />
                    </div>
                    {isNearMilestone && (
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.4em] text-emerald-300/90 text-right">
                        Final Push · Capital Surge Imminent
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!nextMilestone && currentMilestone && (
                <div className="mb-4 rounded-xl ring-1 ring-emerald-400/30 bg-emerald-500/10 backdrop-blur-md p-4 text-center">
                  <Sparkles className="h-4 w-4 text-emerald-300 inline-block mr-1.5 align-text-bottom" />
                  <p className="inline font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-300">
                    Final Threshold Cleared · Mastery Achieved
                  </p>
                </div>
              )}

              {/* ── The Conqueror's Ledger ───────────────────────────────── */}
              <div className="mt-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3 w-3 text-cyan-300/80" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-cyan-300/80">
                      The Conqueror&rsquo;s Ledger
                    </p>
                  </div>
                  {discardedCount > 0 && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-slate-500 tabular-nums">
                      {discardedCount} Record{discardedCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {discardedCount === 0 ? (
                  <div
                    className="rounded-xl border border-cyan-500/20 bg-slate-900/50 backdrop-blur-md px-4 py-6 text-center"
                    style={{ animation: 'vault-glow-breathe 4s ease-in-out infinite' }}
                  >
                    <p
                      className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-cyan-200"
                      style={{ animation: 'vault-pulse 3.2s ease-in-out infinite' }}
                    >
                      Awaiting Restraint.
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">
                      Send Impulses To The Vault.
                    </p>
                  </div>
                ) : (
                  <div
                    className="max-h-56 overflow-y-auto pr-1 space-y-1.5"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
                  >
                    {discardedItems.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm px-3 py-2 transition-all duration-200 hover:border-emerald-400/30 hover:bg-slate-900/60"
                      >
                        <span className="font-mono text-[11px] text-slate-500 line-through decoration-slate-600/70 truncate min-w-0">
                          {v.itemName}
                        </span>
                        <span
                          className="font-mono text-xs font-bold tabular-nums text-emerald-400 flex-shrink-0"
                          style={{
                            textShadow: '0 0 8px rgba(52,211,153,0.45)',
                          }}
                        >
                          +{fmtMoney(v.estimatedAmountVND, cur, rate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}


      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 mb-6">
        <div className="mb-4">
          <BarChart3 className="w-4 h-4 inline-block mr-2 text-slate-400" />
          <span className="text-xs tracking-widest uppercase text-slate-400">How You Spent Your Fun Money</span>
        </div>
        {breakdown.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">No discretionary spending yet.</p>
        ) : (
          <div className="flex items-center gap-5">
            <div className="relative h-[152px] w-[152px] shrink-0">
              <svg
                width="152"
                height="152"
                viewBox="0 0 140 140"
                className="-rotate-90 h-full w-full"
                role="img"
                aria-label="Fun money spending breakdown by category"
              >
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="20" />
                {segments.map((b) => (
                  <circle
                    key={b.cat}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={b.color}
                    strokeWidth="20"
                    strokeDasharray={`${b.dash} ${circ}`}
                    strokeDashoffset={-(circ * b.offset)}
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center px-1">
                <span className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">
                  Total
                </span>
                <span className="mt-0.5 text-[11px] font-bold tabular-nums leading-none text-white">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(funMoneyDonutTotal)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              {breakdown.map((b) => (
                <div key={b.cat} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: b.color }} />
                  <span className="flex-1 truncate text-slate-300">{b.cat}</span>
                  <span className="flex-shrink-0 font-mono text-slate-400">{Math.round((b.amt / totalBreakdown) * 100)}%</span>
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
            if (cell.dayTs > todayMs) {
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

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 mb-6">
        <div className="mb-1">
          <TrendingDown className="w-4 h-4 inline-block mr-2 text-cyan-500" />
          <span className="text-xs tracking-widest uppercase text-cyan-500">Spread-Out Costs</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-4 lowercase tracking-wide">Big purchases that are slowly draining your daily limit over time.</p>
        {activeAmortizations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
            No spread-out costs active.
          </p>
        ) : (
          <div className="space-y-2">
            {activeAmortizations.map((tx) => {
              const spreadDays =
                tx.metadata?.amortization_schedule?.spread_days ??
                tx.amortizeDays ??
                tx.amortizationDays ??
                1;
              const startLabel = tx.metadata?.amortization_schedule?.amortization_start_date ?? tx.timestamp;
              const periodStart = new Date(startLabel);
              periodStart.setHours(0, 0, 0, 0);
              const periodStartMs = periodStart.getTime();
              const daysElapsedInPeriod = Math.max(
                0,
                Math.min(
                  spreadDays,
                  Math.round((todayMidnightMs - periodStartMs) / MS_PER_DAY),
                ),
              );
              const progressPct = Math.min(100, (daysElapsedInPeriod / spreadDays) * 100);
              const remainingPct = 100 - progressPct;
              const title = tx.justification?.trim() || tx.category;
              const dailyDrain = getDailyDrain(tx);
              return (
                <div
                  key={tx.id}
                  className="border-l-2 border-cyan-500 pl-3 bg-slate-950/30 rounded-r-lg py-2 my-2"
                >
                  <div className="flex justify-between items-baseline mb-1 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-white truncate">
                        {title}
                      </p>
                      <p className="font-mono text-[8px] uppercase tracking-widest text-slate-500">
                        spread · {spreadDays}d
                      </p>
                    </div>
                    <p className="text-cyan-400 font-mono text-sm tabular-nums drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] flex-shrink-0">
                      {fmtMoney(tx.amountVND, cur, rate)}
                    </p>
                  </div>

                  <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-cyan-600/50">
                    {`[-${fmtMoney(dailyDrain, cur, rate)}/d]`}
                  </p>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
                    <div
                      className="h-full rounded-full bg-slate-600/60"
                      style={{ width: `${progressPct}%` }}
                    />
                    <div
                      className="payload-decay-bar h-full rounded-full"
                      style={{ width: `${remainingPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      <Dialog open={trophyRoomOpen} onOpenChange={setTrophyRoomOpen}>
        <DialogContent className="bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.1)] max-w-[calc(100vw-2rem)] sm:max-w-md w-full max-h-[80vh] overflow-y-auto overflow-x-hidden p-0">
          <div className="p-6">

            <DialogHeader className="mb-4">
              <DialogTitle className="text-white font-bold tracking-widest uppercase text-lg">
                Trophy Room
              </DialogTitle>
              <p className="text-cyan-400 text-xs tracking-[0.2em] font-semibold uppercase mt-1">
                CONQUEROR&apos;S LEDGER
              </p>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Every item below is money you kept. Proof of discipline compounding.
              </p>
            </DialogHeader>

            {/* ── Empty state ── */}
            {trophies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="text-slate-400 text-sm text-center leading-relaxed">
                  No trophies yet. Discard your first Vault item to start the ledger.
                </p>
              </div>
            )}

            {/* ── Trophy list ── */}
            <div className="flex flex-col gap-3">
              {trophies.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] min-w-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  {/* Left: name */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className="text-slate-200 font-semibold text-sm leading-snug truncate">
                      {item.itemName}
                    </p>
                    {item.discardedAt && (
                      <p className="text-slate-500 text-xs">
                        Resisted on{" "}
                        {new Date(item.discardedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Right: amount saved */}
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-cyan-400 font-mono text-sm font-bold">
                      {`${Number(item.estimatedAmountVND).toLocaleString()} VND`}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">saved</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
