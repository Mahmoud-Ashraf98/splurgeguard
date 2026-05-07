interface Props {
  used: number;
  limit: number;
  remainingLabel?: string;
  size?: number;
}

export function StatusRing({ used, limit, remainingLabel, size = 260 }: Props) {
  const pct = limit > 0 ? Math.min(used / limit, 1.5) : 0;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const visualPct = Math.min(pct, 1);
  const dash = c * visualPct;
  const ratio = pct;
  const color = ratio > 1 ? "#ff4757" : ratio > 0.9 ? "#ff4757" : ratio > 0.7 ? "#fbbf24" : "#00ff87";
  const glow = ratio > 1 ? "rgba(255,71,87,0.5)" : ratio > 0.7 ? "rgba(251,191,36,0.5)" : "rgba(0,255,135,0.5)";
  const pulse = ratio > 1 ? "animate-pulse" : "";

  return (
    <div className={`relative ${pulse}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <radialGradient id="ringbg" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#0a0e1a" stopOpacity="0" />
            <stop offset="100%" stopColor={color} stopOpacity="0.08" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="url(#ringbg)" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={stroke} fill="none" opacity="0.5" />
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
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">Remaining</span>
        <span
          className="mt-1 font-mono text-4xl font-black tabular-nums"
          style={{ color, filter: `drop-shadow(0 0 15px ${glow})` }}
        >
          {remainingLabel ?? `${Math.round(pct * 100)}%`}
        </span>
        <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-600">
          {Math.round(pct * 100)}% used
        </span>
      </div>
    </div>
  );
}
