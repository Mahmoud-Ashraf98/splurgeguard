import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  used: number;
  limit: number;
  remainingLabel?: string;
  /** Final remaining value to animate the odometer to */
  remainingValue?: number;
  /** Optional formatter for the odometer number */
  formatRemaining?: (n: number) => string;
  /** Optional inner-ring overlay (e.g. weekly habit usage) */
  innerUsed?: number;
  innerLimit?: number;
  size?: number;
}

export function StatusRing({
  used,
  limit,
  remainingLabel,
  remainingValue,
  formatRemaining,
  innerUsed,
  innerLimit,
  size = 260,
}: Props) {
  const pct = limit > 0 ? Math.min(used / limit, 1.5) : 0;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const visualPct = Math.min(pct, 1);
  const dash = c * visualPct;
  const ratio = pct;
  const color = ratio > 1 ? "#ff4757" : ratio > 0.9 ? "#ff4757" : ratio > 0.7 ? "#fbbf24" : "#00ff87";
  const glow = ratio > 1 ? "rgba(255,71,87,0.55)" : ratio > 0.7 ? "rgba(251,191,36,0.5)" : "rgba(0,255,135,0.5)";
  const pulse = ratio > 1 ? "animate-pulse" : "";

  // Inner ring (weekly habit)
  const innerStroke = 6;
  const innerOffset = stroke / 2 + 8 + innerStroke / 2;
  const innerR = r - innerOffset;
  const innerC = innerR > 0 ? 2 * Math.PI * innerR : 0;
  const hasInner = typeof innerUsed === "number" && typeof innerLimit === "number" && innerLimit > 0;
  const innerPct = hasInner ? Math.min(innerUsed! / innerLimit!, 1) : 0;
  const innerDash = innerC * innerPct;
  const innerColor = innerPct >= 1 ? "#ff4757" : innerPct >= 0.8 ? "#fbbf24" : "#22d3ee";

  // Odometer
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => (formatRemaining ? formatRemaining(v) : Math.round(v).toString()));
  useEffect(() => {
    if (typeof remainingValue !== "number") return;
    mv.set(0);
    const controls = animate(mv, remainingValue, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [remainingValue, mv]);

  const usedPct = Math.round(pct * 100);
  const showFull = usedPct === 0;
  const showCritical = usedPct > 80;

  return (
    <div className={`relative ${pulse}`} style={{ width: size, height: size }}>
      {/* Reactor glow */}
      <div
        aria-hidden
        className="absolute inset-4 rounded-full pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
          filter: "blur(18px)",
          opacity: 0.55,
        }}
      />
      <svg width={size} height={size} className="-rotate-90 relative">
        <defs>
          <radialGradient id="ringbg" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#0a0e1a" stopOpacity="0" />
            <stop offset="100%" stopColor={color} stopOpacity="0.08" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="url(#ringbg)" />
        {/* Tactical tick gauge */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray="2 6"
          opacity="0.5"
        />
        {/* Outer track */}
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={stroke} fill="none" opacity="0.35" />
        {/* Outer progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "all 0.6s ease, stroke 0.3s", filter: `drop-shadow(0 0 10px ${color})` }}
        />
        {/* Inner ring */}
        {hasInner && innerR > 0 && (
          <>
            <circle cx={size / 2} cy={size / 2} r={innerR} stroke="#1e293b" strokeWidth={innerStroke} fill="none" opacity="0.45" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerR}
              stroke={innerColor}
              strokeWidth={innerStroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${innerDash} ${innerC}`}
              style={{ transition: "all 0.6s ease", filter: `drop-shadow(0 0 6px ${innerColor})` }}
            />
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">Remaining</span>
        {typeof remainingValue === "number" && formatRemaining ? (
          <motion.span
            className="mt-1 font-mono text-4xl font-black tabular-nums"
            style={{ color, filter: `drop-shadow(0 0 15px ${glow})` }}
          >
            <motion.span>{display}</motion.span>
          </motion.span>
        ) : (
          <span
            className="mt-1 font-mono text-4xl font-black tabular-nums"
            style={{ color, filter: `drop-shadow(0 0 15px ${glow})` }}
          >
            {remainingLabel ?? `${Math.round(pct * 100)}%`}
          </span>
        )}
        {showFull ? (
          <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,135,0.5)]">
            Full Budget Intact
          </span>
        ) : showCritical ? (
          <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-rose-400 animate-pulse">
            Budget Critical
          </span>
        ) : (
          <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-600">
            {usedPct}% used
          </span>
        )}
      </div>
    </div>
  );
}
