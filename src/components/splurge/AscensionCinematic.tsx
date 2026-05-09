'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RANKS } from '@/lib/ranks';
import { toast } from 'sonner';

export function AscensionCinematic() {
  const { pendingAscension, clearPendingAscension, data } = useApp();
  const [holdProgress, setHoldProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const HOLD_DURATION_MS = 3000;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (pendingAscension !== null) setHoldProgress(0);
  }, [pendingAscension]);

  if (pendingAscension === null || !data.userState) return null;
  const newRank = RANKS.find((r) => r.level === pendingAscension);
  if (!newRank) return null;

  const startHold = () => {
    if (intervalRef.current) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        clearPendingAscension();
        toast.success(`YOU ARE NOW: ${newRank.title}. ${newRank.quote}`);
        triggerConfetti();
      }
    }, 50);
  };

  const cancelHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    setHoldProgress(0);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black" style={{ backdropFilter: 'blur(20px)' }}>
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${newRank.glowColor} 0%, transparent 70%)`,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      <div
        className="relative mb-8 w-40 h-40"
        style={{ filter: `drop-shadow(0 0 40px ${newRank.glowColor})` }}
      >
        {newRank.renderAvatar()}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-slate-500 mb-3">
        Ascension Protocol
      </p>
      <h1 className="text-center font-black text-2xl text-white px-8 leading-tight mb-2">
        YOUR PAST SELF IS OBSOLETE.
      </h1>
      <h2
        className={`text-center font-black text-3xl px-8 leading-tight mb-2 ${newRank.color}`}
        style={{ textShadow: `0 0 30px ${newRank.glowColor}` }}
      >
        YOU ARE EVOLVING INTO
      </h2>
      <h2
        className={`text-center font-black text-4xl px-8 mb-8 ${newRank.color}`}
        style={{ textShadow: `0 0 40px ${newRank.glowColor}` }}
      >
        {newRank.title.toUpperCase()}
      </h2>
      <p className="font-mono text-xs text-slate-400 italic text-center px-12 mb-12">
        {newRank.quote}
      </p>
      <div className="relative w-64 h-14 px-8">
        <div
          className="absolute inset-0 rounded-2xl transition-none"
          style={{
            width: `${holdProgress}%`,
            background: `linear-gradient(90deg, ${newRank.glowColor}, ${newRank.glowColor})`,
            opacity: 0.55,
          }}
        />
        <button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          className="relative w-full h-full rounded-2xl border-2 font-mono font-black text-sm uppercase tracking-[0.3em] select-none touch-none"
          style={{
            borderColor: newRank.glowColor,
            color: holdProgress > 85 ? '#0f172a' : 'white',
            boxShadow: `0 0 20px ${newRank.glowColor}`,
          }}
        >
          {holdProgress < 100 ? 'HOLD TO ASCEND' : 'ASCENDING...'}
        </button>
      </div>
      <p className="mt-4 font-mono text-[10px] text-slate-600 uppercase tracking-widest">
        Hold for 3 seconds to confirm
      </p>
      <p
        className="mt-8 font-mono text-[9px] text-slate-700 uppercase tracking-widest cursor-pointer hover:text-slate-500 transition-colors"
        onClick={() => {
          cancelHold();
          clearPendingAscension();
        }}
      >
        skip ›
      </p>
    </div>
  );
}

function triggerConfetti() {
  const colors = ['#00ff87', '#00d4ff', '#fbbf24', '#f472b6', '#a78bfa'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position: fixed; width: 8px; height: 8px; border-radius: 50%; background: ${colors[Math.floor(Math.random() * colors.length)]}; left: 50%; top: 50%; pointer-events: none; z-index: 9999; animation: confettiBurst 1.2s ease-out forwards; --tx: ${(Math.random() - 0.5) * 400}px; --ty: ${(Math.random() - 0.5) * 400}px;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `@keyframes confettiBurst { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }`;
    document.head.appendChild(style);
  }
}
