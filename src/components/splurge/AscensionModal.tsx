import { useEffect, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getLevelDef } from "@/lib/splurge-types";

export function AscensionModal() {
  const { ascension, acceptAscension } = useApp();
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (ascension.show) {
      setBurst(false);
      const t = setTimeout(() => setBurst(true), 250);
      return () => clearTimeout(t);
    }
  }, [ascension.show]);

  if (!ascension.show || !ascension.pendingLevel) return null;
  const def = getLevelDef(ascension.pendingLevel);

  // 24 confetti shards
  const shards = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-md">
      {/* Radial glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(0,212,255,0.25)_0%,_rgba(0,255,135,0.12)_25%,_transparent_60%)] animate-pulse" />
        <div className="absolute left-1/2 top-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,rgba(0,212,255,0.0),rgba(168,85,247,0.18),rgba(0,255,135,0.18),rgba(0,212,255,0.0))] opacity-60 animate-spin" style={{ animationDuration: "18s" }} />
      </div>

      {/* Confetti / shards */}
      {burst && (
        <div className="pointer-events-none absolute inset-0">
          {shards.map((i) => {
            const angle = (i / shards.length) * 360;
            const dist = 40 + ((i * 37) % 35);
            const colors = ["#00d4ff", "#00ff87", "#a855f7", "#fbbf24", "#f43f5e"];
            const c = colors[i % colors.length];
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
                style={{
                  background: c,
                  boxShadow: `0 0 12px ${c}`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${dist}vmin)`,
                  transition: "transform 1.6s cubic-bezier(0.16,1,0.3,1), opacity 1.6s ease-out",
                  opacity: 0.95,
                  animation: `ascend-shard-${i} 1.8s ease-out forwards`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="relative z-10 mx-4 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div
          className="relative overflow-hidden rounded-3xl border border-cyan-400/40 bg-slate-950/80 p-8 backdrop-blur-2xl"
          style={{
            boxShadow:
              "0 0 60px rgba(0,212,255,0.45), inset 0 0 40px rgba(0,255,135,0.08), 0 0 120px rgba(168,85,247,0.25)",
          }}
        >
          {/* Border glow ring */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-emerald-400/20" style={{ boxShadow: "inset 0 0 80px rgba(0,255,135,0.12)" }} />

          <div className="relative text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/5 px-3 py-1">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-300">
                Ascension Detected
              </span>
            </div>

            <p
              className="mb-1 font-mono text-[10px] uppercase tracking-[0.5em] text-slate-400"
            >
              Level
            </p>
            <h2
              className="mb-2 font-mono text-7xl font-black tabular-nums text-white"
              style={{
                textShadow:
                  "0 0 24px rgba(0,212,255,0.85), 0 0 60px rgba(0,255,135,0.45)",
              }}
            >
              {def.level}
            </h2>
            <h3
              className="mb-6 text-2xl font-black uppercase tracking-[0.25em] text-emerald-300"
              style={{ textShadow: "0 0 18px rgba(0,255,135,0.7)" }}
            >
              {def.title}
            </h3>

            <p className="mx-auto mb-7 max-w-xs text-sm leading-relaxed text-slate-300">
              <span className="text-cyan-300">Your past self is obsolete.</span> The perimeter
              holds. You have proven your discipline.
            </p>

            <button
              onClick={acceptAscension}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-[length:200%_100%] py-4 font-mono text-sm font-black uppercase tracking-[0.3em] text-slate-950 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow:
                  "0 0 30px rgba(0,212,255,0.7), 0 0 60px rgba(0,255,135,0.4)",
                animation: "ascend-shimmer 2.4s linear infinite",
              }}
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> Accept Ascension
              </span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ascend-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        ${shards
          .map((i) => {
            const angle = (i / shards.length) * 360;
            const dist = 60 + ((i * 53) % 40);
            return `@keyframes ascend-shard-${i} {
              0% { transform: translate(-50%, -50%) rotate(${angle}deg) translateY(0); opacity: 1; }
              100% { transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-${dist}vmin); opacity: 0; }
            }`;
          })
          .join("\n")}
      `}</style>
    </div>
  );
}
