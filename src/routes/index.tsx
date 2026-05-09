import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Flame, Coins, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Onboarding } from "@/components/splurge/Onboarding";
import { StatusRing } from "@/components/splurge/StatusRing";
import { LogSheet } from "@/components/splurge/LogSheet";
import { LevelGuideModal } from "@/components/splurge/LevelGuideModal";
import { fmtMoney, nextMilestone, weeklyHabitSpent } from "@/lib/splurge-utils";
import { getLevelDef } from "@/lib/splurge-types";
import { RANKS, getNextRank } from "@/lib/ranks";


export const Route = createFileRoute("/")({
  component: Index,
});

function MainQuestCard({ onOpenGuide }: { onOpenGuide: () => void }) {
  const { data } = useApp();
  const us = data.userState!;
  const currentRank = RANKS.find((r) => r.level === us.currentLevel) ?? RANKS[0];
  const nextRank = getNextRank(currentRank.level);
  const xpForNext = nextRank ? nextRank.threshold : currentRank.threshold;
  const xpProgress = nextRank
    ? Math.min(1, Math.max(0, (us.ascensionXP - currentRank.threshold) / (xpForNext - currentRank.threshold)))
    : 1;
  const isDangerZone = us.currentLevel > 1 && us.ascensionXP - currentRank.threshold <= 100;

  return (
    <div className="mb-6">
      {isDangerZone && (
        <div className="mb-2 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2 text-center animate-pulse">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-400">
            DANGER: Demotion Imminent
          </p>
        </div>
      )}
      <button
        onClick={onOpenGuide}
        className="w-full text-left rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_50px_-20px_rgba(0,0,0,0.8)] transition-all hover:border-white/10 active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0" style={{ filter: `drop-shadow(0 0 12px ${currentRank.glowColor})` }}>
            {currentRank.renderAvatar()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500 mb-0.5">
              Level {currentRank.level} — Current Rank
            </p>
            <p className={`font-bold text-lg ${currentRank.color}`}>{currentRank.title}</p>
            <p className="font-mono text-[10px] text-slate-400 italic mt-0.5 truncate">{currentRank.quote}</p>
          </div>
          <span className="font-mono text-[10px] text-slate-600">Guide ›</span>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-widest text-slate-600">
            <span>{us.ascensionXP.toLocaleString()} XP</span>
            <span>{nextRank ? `${nextRank.threshold.toLocaleString()} to ${nextRank.title}` : "MAX RANK"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/60">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${xpProgress * 100}%`,
                background: `linear-gradient(90deg, ${currentRank.glowColor}, white)`,
                boxShadow: `0 0 8px ${currentRank.glowColor}`,
              }}
            />
          </div>
        </div>
      </button>
    </div>
  );
}

function Index() {
  const app = useApp();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  if (!app.data.userState) return <Onboarding />;
  const us = app.data.userState;
  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;

  const remaining = Math.max(0, app.smartDailyLimit - app.todayDiscretionary);
  const next = nextMilestone(us.currentStreakDays);
  const milestoneProgress = Math.min(1, us.currentStreakDays / next);

  const activeVault = app.data.vaultItems.filter((v) => v.status === "cooling" || v.status === "ready").slice(0, 3);
  const currentRank = RANKS.find(r => r.level === us.currentLevel) ?? RANKS[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0e1a] to-[#0a0e1a] px-5 pb-32 pt-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">Welcome Back,</p>
          <div className="mt-1 flex items-center gap-2">
            <h1
              className="mt-1 flex items-center gap-3 text-2xl font-black text-white min-w-0"
              style={{ textShadow: "0 0 18px rgba(255,255,255,0.2)" }}
            >
              <span className="truncate">{us.userName || "Operator"}</span>
              <span
                className={`whitespace-nowrap flex-shrink-0 rounded-full border border-white/10 bg-slate-900/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${currentRank.color}`}
                style={{ boxShadow: `0 0 10px -2px ${currentRank.glowColor}` }}
              >
                LV{currentRank.level} {currentRank.title}
              </span>
            </h1>
            {(() => {
              const def = getLevelDef(us.currentLevel);
              return (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-300"
                  style={{ boxShadow: "0 0 12px -4px rgba(0,255,135,0.7)" }}
                  title={`Lifetime DP: ${us.lifetimeDP}`}
                >
                  <span className="text-cyan-300">LV{def.level}</span>
                  <span className="text-emerald-200">{def.title}</span>
                </span>
              );
            })()}
          </div>
        </div>
        <button
          onClick={app.toggleCurrency}
          className="rounded-lg border border-white/5 bg-slate-900/40 px-3 py-1.5 font-mono text-xs tracking-widest text-emerald-400 backdrop-blur-xl transition-all hover:border-emerald-400/40 hover:shadow-[0_0_20px_-5px_#00ff87]"
        >
          {cur}
        </button>
      </header>

      <MainQuestCard onOpenGuide={() => setGuideOpen(true)} />
      {guideOpen && <LevelGuideModal onClose={() => setGuideOpen(false)} />}

      <div className="mb-8 flex flex-col items-center">
        <StatusRing
          used={app.todayDiscretionary}
          limit={app.smartDailyLimit}
          remainingLabel={fmtMoney(remaining, cur, rate)}
        />
        <div className="mt-6 flex w-full items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Spent Today</span>
            <span className="mt-1 font-mono text-lg tabular-nums text-slate-300">{fmtMoney(app.todayDiscretionary, cur, rate)}</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Daily Limit</span>
            <span className="mt-1 font-mono text-lg tabular-nums text-slate-300">{fmtMoney(app.smartDailyLimit, cur, rate)}</span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-500/50">Includes Active Amortizations</span>
          </div>
        </div>
      </div>

      {(() => {
        const daysUntilPayday = Math.max(0, Math.ceil((new Date(us.paydayDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        const balanceFormatted = cur === "USD"
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.round(us.currentBalanceVND / rate))
          : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(us.currentBalanceVND);
        return (
          <div className="flex justify-between items-center w-full bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex flex-col items-start">
              <span className="text-[10px] tracking-widest uppercase text-slate-400 mb-1">Total Cycle Balance</span>
              <span className="text-xl font-mono text-[#f1f5f9] tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{balanceFormatted}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] tracking-widest uppercase text-slate-400 mb-1 text-right">Time to Payday</span>
              <span className="text-lg font-mono text-cyan-300 text-right tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                {daysUntilPayday === 0 ? "TODAY" : `${daysUntilPayday} DAYS`}
              </span>
            </div>
          </div>
        );
      })()}

      <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/30 p-5 shadow-xl shadow-black/50 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_50px_-20px_rgba(0,0,0,0.8)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-cyan-400" style={{ filter: "drop-shadow(0 0 8px rgba(0,212,255,0.6))" }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">Discipline Points</span>
          </div>
          <button
            onClick={() => navigate({ to: "/exchange", search: { new: true } })}
            className="rounded-md border border-cyan-400/30 bg-cyan-400/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-400/10 hover:shadow-[0_0_15px_-3px_#00d4ff]"
          >
            Spend DP
          </button>
        </div>
        <div className="mb-4 flex items-end justify-between">
          <p
            className="font-mono text-5xl font-black tabular-nums text-cyan-400"
            style={{ filter: "drop-shadow(0 0 12px rgba(0,212,255,0.6))" }}
          >
            {us.totalDP}
          </p>
          <div className="flex items-center gap-2">
            {[3, 7, 14].includes(us.currentStreakDays) && (
              <div
                className="relative flex h-9 w-9 items-center justify-center bg-gradient-to-br from-amber-300 to-amber-600 text-slate-950"
                style={{
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  filter: "drop-shadow(0 0 12px rgba(245,158,11,0.85))",
                }}
              >
                <span className="font-mono text-xs font-black tabular-nums">{us.currentStreakDays}</span>
              </div>
            )}
            <Flame
              className="h-5 w-5 animate-pulse text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            />
            <span className="font-mono text-lg font-bold tabular-nums text-amber-400">{us.currentStreakDays}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">day streak</span>
          </div>
        </div>
        <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
          <span>Next milestone</span>
          <span className="tabular-nums">{us.currentStreakDays}/{next}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-slate-800/60">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(0,212,255,0.5)]"
            style={{ width: `${milestoneProgress * 100}%` }}
          />
        </div>
      </div>

      {us.weeklyHabitLimitVND > 0 && us.targetHabit && (() => {
        const spent = weeklyHabitSpent(app.data.transactions, us.targetHabit);
        const limit = us.weeklyHabitLimitVND;
        const pct = Math.min(1, spent / limit);
        const over = spent > limit;
        const warn = pct >= 0.8;
        const barColor = over
          ? "from-rose-500 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
          : warn
          ? "from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          : "from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(0,255,135,0.5)]";
        const valColor = over ? "text-rose-400" : warn ? "text-amber-400" : "text-emerald-400";
        return (
          <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/30 p-5 shadow-xl shadow-black/50 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_50px_-20px_rgba(0,0,0,0.8)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Weekly {us.targetHabit} Limit</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Mon → Sun</span>
            </div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className={`font-mono text-2xl font-bold tabular-nums ${valColor}`}>{fmtMoney(spent, cur, rate)}</span>
              <span className="font-mono text-xs tabular-nums text-slate-500">/ {fmtMoney(limit, cur, rate)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/60">
              <div
                className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>
        );
      })()}

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">Active Vault</h2>
          <Link to="/vault" className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">View all →</Link>
        </div>
        {activeVault.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/5 bg-slate-900/20 p-6 text-center backdrop-blur-xl">
            <Lock className="mx-auto mb-2 h-6 w-6 text-slate-600" />
            <p className="text-xs text-slate-500">No items cooling. Resist an impulse → vault it.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeVault.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-white/5 bg-slate-900/30 p-3 shadow-xl shadow-black/40 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_10px_30px_-15px_rgba(0,0,0,0.8)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{v.itemName}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{v.category} · {v.delayHours}h</p>
                  </div>
                  <p className="font-mono text-sm tabular-nums text-cyan-400">{fmtMoney(v.estimatedAmountVND, cur, rate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-5">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-4 font-mono text-sm font-bold uppercase tracking-[0.25em] text-slate-950 shadow-[0_0_20px_-5px_#00ff87] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_#00ff87] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" /> Log Expense
        </button>
      </div>

      <LogSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

    </div>
  );
}
