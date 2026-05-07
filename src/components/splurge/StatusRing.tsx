interface Props {
  used: number;
  limit: number;
  size?: number;
}

export function StatusRing({ used, limit, size = 240 }: Props) {
  const pct = limit > 0 ? Math.min(used / limit, 1.5) : 0;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const visualPct = Math.min(pct, 1);
  const dash = c * visualPct;
  const ratio = pct;
  const color = ratio > 1 ? "#ff4757" : ratio > 0.9 ? "#ff4757" : ratio > 0.7 ? "#fbbf24" : "#00ff87";
  const pulse = ratio > 1 ? "animate-pulse" : "";

  return (
    <div className={`relative ${pulse}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "all 0.6s ease, stroke 0.3s", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Used</span>
        <span className="font-mono text-4xl font-bold" style={{ color }}>
          {Math.round(pct * 100)}%
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">of daily limit</span>
      </div>
    </div>
  );
}
