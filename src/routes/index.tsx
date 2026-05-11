import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Flame, Coins, Lock, Target, CheckCircle2, XCircle,
  ExternalLink, X, Info,
  Bike, Coffee, ShoppingCart, Utensils, CupSoda,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Onboarding } from "@/components/splurge/Onboarding";
import { StatusRing } from "@/components/splurge/StatusRing";
import { LogSheet } from "@/components/splurge/LogSheet";
import { LevelGuideModal } from "@/components/splurge/LevelGuideModal";
import { HoldSecureButton } from "@/components/splurge/HoldSecureButton";
import { ForfeitModal } from "@/components/splurge/ForfeitModal";
import { fmtMoney, nextMilestone, weeklyHabitSpent } from "@/lib/splurge-utils";
import type { DailyContract } from "@/lib/splurge-types";

import { getRankForXP, getNextRank } from "@/lib/ranks";

const CONTRACT_ICON_MAP: Record<string, LucideIcon> = {
  Bike, Coffee, ShoppingCart, Utensils, CupSoda,
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const Route = createFileRoute("/")({
  component: Index,
});


function Index() {
  const app = useApp();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showLevelGuide, setShowLevelGuide] = useState(false);
  const [showLimitInfo, setShowLimitInfo] = useState(false);
  const [forfeitTarget, setForfeitTarget] = useState<DailyContract | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  if (!app.data.userState) return <Onboarding />;
  const us = app.data.userState;
  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;

  const remaining = Math.max(0, app.smartDailyLimit - app.todayDiscretionary);
  const next = nextMilestone(us.currentStreakDays);
  const milestoneSegments = 3;
  const milestoneFilled = Math.min(
    milestoneSegments,
    Math.round((us.currentStreakDays / next) * milestoneSegments),
  );

  const activeVault = app.data.vaultItems.filter((v) => v.status === "cooling" || v.status === "ready").slice(0, 3);
  const currentRank = getRankForXP(us.ascensionXP);
  const nextRank = getNextRank(currentRank.level);
  const xpNumerator = us.ascensionXP - currentRank.threshold;
  const xpDenominator = nextRank ? nextRank.threshold - currentRank.threshold : currentRank.threshold;
  const xpPercentage = nextRank ? Math.min(100, (xpNumerator / xpDenominator) * 100) : 100;

  const dailyContracts: DailyContract[] = us.dailyContracts ?? [];

  // Weekly habit (used for both inner ring + bottom card)
  const habitSpent = us.targetHabit ? weeklyHabitSpent(app.data.transactions, us.targetHabit) : 0;
  const habitLimit = us.weeklyHabitLimitVND;

  const secureProtocol = (id: string) => {
    const c = dailyContracts.find((x) => x.id === id);
    if (!c || c.status !== 'available') return;
    app.updateUserState({
      totalDP: us.totalDP + c.reward,
      ascensionXP: (us.ascensionXP ?? 0) + c.reward,
      lifetimeDP: us.lifetimeDP + Math.max(0, c.reward),
      dailyContracts: dailyContracts.map((x) => x.id === id ? { ...x, status: 'secured' as const } : x),
    });
  };

  const forfeitProtocol = (id: string) => {
    const c = dailyContracts.find((x) => x.id === id);
    if (!c || c.status !== 'available') return;
    app.updateUserState({
      totalDP: us.totalDP + c.penalty,
      ascensionXP: Math.max(0, (us.ascensionXP ?? 0) + c.penalty),
      dailyContracts: dailyContracts.map((x) => x.id === id ? { ...x, status: 'yielded' as const } : x),
    });
  };

  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cardW = el.clientWidth * 0.85;
    const idx = Math.round(el.scrollLeft / Math.max(1, cardW));
    if (idx !== carouselIndex) setCarouselIndex(Math.min(dailyContracts.length - 1, Math.max(0, idx)));
  };

  // Cycle elapsed
  const cycleStart = new Date(us.cycleStartDate).getTime();
  const cycleEnd = new Date(us.paydayDate).getTime();
  const cycleNow = Date.now();
  const cycleTotal = Math.max(1, cycleEnd - cycleStart);
  const cycleElapsed = Math.min(1, Math.max(0, (cycleNow - cycleStart) / cycleTotal));

  const todayDow = (new Date().getDay() + 6) % 7; // 0=Mon..6=Sun

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0e1a] to-[#0a0e1a] pb-32 pt-6">
      {/* ── 1. SOVEREIGN BLACK CARD (OPERATOR ID) ──────────────────────── */}
      <div className="relative mt-4 mb-8 group">
        <div
          className="absolute inset-0 opacity-20 blur-[50px] transition-opacity duration-700 group-hover:opacity-40 pointer-events-none"
          style={{ backgroundColor: currentRank.glowColor }}
        ></div>

        <div className="relative z-10 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl overflow-hidden mx-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_35px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">
          {/* Sweeping glare */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
              animation: "shimmer 4s ease-in-out infinite",
            }}
          />
          {/* Animated scanline noise overlay */}
          <div className="header-scanline" />
          <div className="absolute inset-0 bg-cyber-mesh opacity-50 mix-blend-overlay pointer-events-none"></div>
          <div
            className="absolute -right-4 -top-8 font-black text-[120px] opacity-5 select-none pointer-events-none leading-none"
            style={{ color: currentRank.glowColor }}
          >
            {us.currentLevel}
          </div>

          <div className="p-5 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4 min-w-0">
              {/* Targeting Reticle Avatar */}
              <div className="w-16 h-16 flex-shrink-0 relative">
                <svg
                  className="absolute text-cyan-500/40"
                  style={{
                    inset: "-4px",
                    width: "calc(100% + 8px)",
                    height: "calc(100% + 8px)",
                    animation: "spin 10s linear infinite",
                    willChange: "transform",
                  }}
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
                </svg>
                <svg
                  className="absolute text-white/10"
                  style={{
                    inset: "-8px",
                    width: "calc(100% + 16px)",
                    height: "calc(100% + 16px)",
                    animation: "spin 16s linear infinite reverse",
                    willChange: "transform",
                  }}
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="18 82" />
                </svg>
                <div
                  style={{
                    filter: `drop-shadow(0 0 10px ${currentRank.glowColor})`,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {currentRank.renderAvatar()}
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500 mb-0.5 flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: "#00FFA3", boxShadow: "0 0 8px #00FFA3", animationDuration: "2.4s" }}
                  ></span>
                  System Online
                </p>
                <h1
                  className="text-2xl font-black uppercase tracking-widest truncate"
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 2px 8px rgba(255,255,255,0.15))",
                  }}
                >
                  {us.userName || "Operator"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setShowLevelGuide(true)}
                    className="group/g flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    style={{
                      color: currentRank.glowColor,
                      borderColor: `${currentRank.glowColor}40`,
                      backgroundColor: `${currentRank.glowColor}15`,
                    }}
                  >
                    LV{us.currentLevel} - {currentRank.title}
                    <span className="opacity-50 group-hover/g:opacity-100 transition-opacity flex items-center gap-1">
                      GUIDE <ExternalLink className="h-2.5 w-2.5 inline" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Currency pill — glassmorphism */}
            <div className="flex-shrink-0 ml-2">
              <button
                onClick={app.toggleCurrency}
                className="relative overflow-hidden font-mono text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl px-3 py-2.5 transition-all hover:bg-white/10 hover:border-white/30 active:scale-95 shadow-inner"
              >
                <span className="relative z-10">{us.displayCurrency}</span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              </button>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-950 relative border-t border-white/5">
            <div
              className="h-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${xpPercentage}%`,
                backgroundColor: currentRank.glowColor,
                boxShadow: `0 0 15px ${currentRank.glowColor}`,
              }}
            ></div>
            <div className="absolute inset-0 xp-power-cells pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* ── 2. THE CORE REACTOR (DAILY LIMIT) ──────────────────────────── */}
      <div className="px-5">
        <div className="mb-8 flex flex-col items-center">
          <StatusRing
            used={app.todayDiscretionary}
            limit={app.smartDailyLimit}
            remainingValue={remaining}
            formatRemaining={(n) => fmtMoney(n, cur, rate)}
            innerUsed={habitSpent}
            innerLimit={habitLimit}
          />

          {/* Stats row — frosted cards */}
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-md p-3 shadow-inner">
              <div className="flex items-center gap-1.5">
                <span aria-hidden>💸</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500">Spent Today</span>
              </div>
              <div className="mt-1 font-mono text-base tabular-nums text-slate-100">{fmtMoney(app.todayDiscretionary, cur, rate)}</div>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-md p-3 shadow-inner">
              <div className="flex items-center gap-1.5">
                <span aria-hidden>🎯</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500">Daily Limit</span>
                <button
                  onClick={() => setShowLimitInfo((v) => !v)}
                  className="ml-auto text-slate-500 hover:text-cyan-400 transition-colors"
                  aria-label="What goes into the daily limit?"
                >
                  <Info className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1 font-mono text-base tabular-nums text-slate-100">{fmtMoney(app.smartDailyLimit, cur, rate)}</div>
              {app.data.transactions.some((tx) => {
                const lifespan = tx.amortizeDays ?? tx.amortizationDays ?? 1;
                if (lifespan <= 1) return false;
                const daysSince = Math.floor(
                  (new Date().setHours(0, 0, 0, 0) - new Date(tx.timestamp).setHours(0, 0, 0, 0)) /
                    86400000,
                );
                return daysSince >= 0 && daysSince < lifespan;
              }) && (
                <p className="text-[8px] mt-1 font-mono uppercase tracking-widest text-cyan-500/80 text-center w-full">
                  // INCLUDES ACTIVE AMORTIZATIONS
                </p>
              )}
              <AnimatePresence>
                {showLimitInfo && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 font-mono text-[9px] uppercase tracking-widest text-cyan-500/70 leading-relaxed"
                  >
                    Counts essentials, habits, and the daily slice of every active amortization.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. ACTIVE CONTRACTS (HORIZONTAL BOUNTY BOARD) ──────────────── */}
      <div className="mb-10">
        <div className="px-5 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
              <Target className="h-3 w-3 text-cyan-400" />
            </div>
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300">
              Active Contracts
            </h2>
          </div>
          {dailyContracts.length > 0 && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/20 rounded-full px-2 py-0.5">
              {Math.min(carouselIndex + 1, dailyContracts.length)} of {dailyContracts.length}
            </span>
          )}
        </div>

        {dailyContracts.length === 0 ? (
          <p className="px-5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            No contracts. Refresh at midnight.
          </p>
        ) : (
        <>
        <div
          ref={carouselRef}
          onScroll={onCarouselScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 pb-4 custom-scrollbar-hide"
        >
          {dailyContracts.map((p, index) => {
            const Icon = CONTRACT_ICON_MAP[p.iconType] ?? Coffee;
            const isCompleted = p.status === 'secured';
            const isForfeited = p.status === 'yielded';
            const accent = isCompleted ? "#10b981" : isForfeited ? "#f43f5e" : "#00d4ff";
            let cardClasses =
              "relative w-[85vw] max-w-[320px] flex-none snap-center flex flex-col justify-between rounded-[1.25rem] border p-5 transition-all duration-500 overflow-hidden ";
            if (isCompleted) {
              cardClasses += "bg-emerald-950/20 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]";
            } else if (isForfeited) {
              cardClasses += "bg-rose-950/20 border-rose-500/20 opacity-60";
            } else {
              cardClasses += "bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl scanline-effect hover:border-cyan-500/30";
            }
            return (
              <div
                key={p.id}
                className={cardClasses}
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                {!isCompleted && !isForfeited && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500/30"></div>
                )}

                <div className="flex justify-between items-center mb-3">
                  <p
                    className="font-mono text-[8px] text-cyan-400 uppercase tracking-widest"
                    style={{ textShadow: !isCompleted && !isForfeited ? "0 0 6px rgba(0,212,255,0.6)" : "none" }}
                  >
                    // DIRECTIVE 0{index + 1}
                  </p>
                  {!isCompleted && !isForfeited && (
                    <motion.p
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.45, delay: 0.05 * index, ease: "easeOut" }}
                      className="font-mono text-[8px] text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-1.5 py-0.5 rounded"
                    >
                      YIELD: +{p.reward} DP
                    </motion.p>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border shadow-inner ${
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : isForfeited
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-slate-950 border-slate-800 text-cyan-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 mt-0.5">
                    <h3 className={`font-bold text-base ${isCompleted ? "text-emerald-50" : isForfeited ? "text-slate-500 line-through" : "text-white"}`}>
                      {p.title}
                    </h3>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 mt-1 ${isCompleted || isForfeited ? "text-slate-500" : "text-slate-400"}`}>
                      {p.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  {!isCompleted && !isForfeited && (
                    <div className="flex items-center gap-2">
                      <HoldSecureButton onSecure={() => secureProtocol(p.id)} />
                      <button
                        onClick={() => setForfeitTarget(p)}
                        className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-slate-950 border-2 border-rose-900/60 text-rose-400/80 transition-all hover:bg-rose-500/10 hover:border-rose-500/60 hover:text-rose-400 active:scale-95"
                        aria-label="Forfeit contract"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center justify-center py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                      Secured [+{p.reward} DP]
                    </div>
                  )}
                  {isForfeited && (
                    <div className="flex items-center justify-center py-3 rounded-xl bg-rose-500/5 border border-rose-500/10 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-500/70">
                      <XCircle className="h-3.5 w-3.5 mr-2" />
                      Forfeited [{p.penalty} DP]
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Dots */}
        <div className="px-5 flex items-center justify-center gap-1.5">
          {dailyContracts.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === carouselIndex ? "w-5 bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]" : "w-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>
        </>
        )}
      </div>

      {/* ── 4. EVERYTHING ELSE ─────────────────────────────────────────── */}
      <div className="px-5">

      {(() => {
        const daysUntilPayday = Math.max(0, Math.ceil((new Date(us.paydayDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        const balanceFormatted = cur === "USD"
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.round(us.currentBalanceVND / rate))
          : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(us.currentBalanceVND);
        return (
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex justify-between items-stretch">
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] tracking-widest uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                  <Coins className="h-3 w-3 text-cyan-400 animate-pulse" style={{ animationDuration: "2.4s" }} />
                  Total Cycle Balance
                </span>
                <span className="text-xl font-mono text-[#f1f5f9] tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] truncate">{balanceFormatted}</span>
              </div>
              <div className="w-px bg-white/10 mx-3" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] tracking-widest uppercase text-slate-400 mb-1 text-right">Time to Payday</span>
                <span className="text-lg font-mono text-cyan-300 text-right tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  {daysUntilPayday === 0 ? "TODAY" : `${daysUntilPayday} DAYS`}
                </span>
              </div>
            </div>
            {/* Cycle elapsed bar */}
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-slate-800/60">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_8px_rgba(0,212,255,0.5)]"
                style={{ width: `${cycleElapsed * 100}%` }}
              />
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
            className="rounded-md border border-cyan-400/40 bg-cyan-400/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-400/10 hover:shadow-[0_0_15px_-3px_#00d4ff] active:scale-110 active:shadow-[0_0_25px_0_#00d4ff]"
          >
            Spend DP
          </button>
        </div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p
              className="font-tactical text-5xl font-black tabular-nums text-cyan-400"
              style={{ filter: "drop-shadow(0 0 12px rgba(0,212,255,0.6))" }}
            >
              {us.totalDP}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-slate-600 mt-1">
              Discipline Yield — Every action compounds
            </p>
          </div>
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
            <Flame className="h-5 w-5 text-amber-500 animate-flicker" />
            <span className="font-mono text-lg font-bold tabular-nums text-amber-400">{us.currentStreakDays}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">day streak</span>
          </div>
        </div>
        <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
          <span>Next milestone</span>
          <span className="tabular-nums">{us.currentStreakDays}/{next}</span>
        </div>
        {/* Segmented bar */}
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: milestoneSegments }).map((_, i) => {
            const filled = i < milestoneFilled;
            return (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  filled
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(0,212,255,0.7)]"
                    : "bg-slate-800/60"
                }`}
              />
            );
          })}
        </div>
      </div>

      {us.weeklyHabitLimitVND > 0 && us.targetHabit && (() => {
        const limit = us.weeklyHabitLimitVND;
        const pct = Math.min(1, habitSpent / limit);
        const over = habitSpent > limit;
        const warn = pct >= 0.8;
        const barColor = over
          ? "from-rose-500 to-red-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
          : warn
          ? "from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          : "from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(0,255,135,0.5)]";
        const valColor = over ? "text-rose-400" : warn ? "text-amber-400" : "text-emerald-400";
        const isClean = habitSpent === 0;
        return (
          <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/30 p-5 shadow-xl shadow-black/50 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_50px_-20px_rgba(0,0,0,0.8)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Weekly {us.targetHabit} Limit</span>
              <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest">
                {DAY_LABELS.map((d, i) => (
                  <span
                    key={d}
                    className={i === todayDow ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,212,255,0.7)]" : "text-slate-700"}
                  >
                    {d.charAt(0)}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className={`font-mono text-2xl font-bold tabular-nums ${valColor}`}>{fmtMoney(habitSpent, cur, rate)}</span>
              <span className="font-mono text-xs tabular-nums text-slate-500">/ {fmtMoney(limit, cur, rate)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/60">
              <div
                className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            {isClean && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400 drop-shadow-[0_0_6px_rgba(0,255,135,0.6)]">
                Clean Week 🌿
              </p>
            )}
          </div>
        );
      })()}

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">Active Vault</h2>
          <div className="flex items-center gap-2">
            <Link
              to="/vault"
              search={{ new: true }}
              className="flex items-center justify-center w-6 h-6 rounded-md border border-white/10 bg-white/5 backdrop-blur-md text-cyan-400 hover:bg-white/10 transition-all"
              aria-label="Quick add to vault"
            >
              <Plus className="h-3 w-3" />
            </Link>
            <Link to="/vault" className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300">View all →</Link>
          </div>
        </div>
        {activeVault.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cyan-500/15 bg-slate-900/20 p-6 text-center backdrop-blur-xl">
            <Lock
              className="mx-auto mb-2 h-8 w-8 text-cyan-400/60"
              style={{ filter: "drop-shadow(0 0 12px rgba(0,212,255,0.45))" }}
            />
            <p className="font-mono text-[11px] uppercase tracking-widest text-cyan-300/70">
              Vault Empty — Resist an impulse. Vault it.
            </p>
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
      </div>

      {/* CTA */}
      <div className="fixed bottom-20 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-5">
        <button
          onClick={() => setSheetOpen(true)}
          className="cta-ripple relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-mono text-sm font-bold uppercase tracking-[0.25em] text-slate-950 shadow-[0_0_28px_-6px_#00FFA3] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_200%] animate-[gradient-cycle_4s_linear_infinite]"
          style={{
            backgroundImage: "linear-gradient(90deg, #00FFA3, #00C8FF, #00FFA3)",
            willChange: "transform",
          }}
        >
          <Plus className="cta-plus h-5 w-5" /> Log Expense
        </button>
      </div>

      <LogSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      {showLevelGuide && <LevelGuideModal onClose={() => setShowLevelGuide(false)} />}
      <ForfeitModal
        open={!!forfeitTarget}
        contractName={forfeitTarget?.title ?? ""}
        penalty={forfeitTarget?.penalty ?? 0}
        onCancel={() => setForfeitTarget(null)}
        onConfirm={() => {
          if (forfeitTarget) forfeitProtocol(forfeitTarget.id);
          setForfeitTarget(null);
        }}
      />
    </div>
  );
}
