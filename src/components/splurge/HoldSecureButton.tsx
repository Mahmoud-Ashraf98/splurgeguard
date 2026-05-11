import { useRef, useState, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Check } from "lucide-react";

interface Props {
  onSecure: () => void;
  durationMs?: number;
  label?: string;
}

const SIZE = 44;
const STROKE = 3;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function HoldSecureButton({ onSecure, durationMs = 1500, label = "SECURE" }: Props) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [flash, setFlash] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const controls = useAnimationControls();

  const cleanup = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const tick = (t: number) => {
    if (startRef.current == null) startRef.current = t;
    const elapsed = t - startRef.current;
    const p = Math.min(1, elapsed / durationMs);
    setProgress(p);
    if (p >= 1) {
      completedRef.current = true;
      cleanup();
      try { navigator.vibrate?.(50); } catch { /* noop */ }
      setFlash(true);
      setTimeout(() => setFlash(false), 280);
      setHolding(false);
      onSecure();
      // reset for next press
      setTimeout(() => setProgress(0), 350);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    if (holding) return;
    completedRef.current = false;
    setHolding(true);
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
    try { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
  };

  const cancel = () => {
    if (!holding) return;
    cleanup();
    setHolding(false);
    if (!completedRef.current) {
      controls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.35 },
      });
    }
    setProgress(0);
  };

  const dash = C * progress;

  return (
    <motion.button
      animate={controls}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative flex-grow flex items-center justify-center gap-2 py-3 rounded-xl border font-mono text-[10px] font-bold uppercase tracking-widest transition-colors touch-none select-none ${
        flash
          ? "bg-cyan-400/40 border-cyan-300 text-white"
          : holding
          ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_20px_rgba(0,212,255,0.45)] animate-pulse"
          : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
      }`}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        willChange: "transform",
      }}
      aria-label={holding ? "Hold to secure" : label}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90 flex-shrink-0">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: holding ? "none" : "stroke-dasharray 0.25s ease-out" }}
        />
      </svg>
      <span className="flex items-center gap-1.5">
        <Check className="h-3.5 w-3.5" />
        {holding ? "HOLD TO SECURE..." : label}
      </span>
    </motion.button>
  );
}
