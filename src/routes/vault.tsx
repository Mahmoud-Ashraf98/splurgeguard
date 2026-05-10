import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fmtMoney } from "@/lib/splurge-utils";


export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function VaultPage() {
  const app = useApp();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  // Vault cooling->ready transitions are handled globally in AppContext.

  const us = app.data.userState;
  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;

  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;
  const items = app.data.vaultItems;

  return (
    <div className="px-5 pb-24 pt-6">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Cooling-Off</p>
        <h1 className="text-2xl font-bold text-white">Vault</h1>
      </header>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/5 bg-slate-900/20 p-12 text-center backdrop-blur-xl">
          <div className="relative mx-auto mb-4 flex h-32 items-center justify-center">
            <div className="absolute h-32 w-32 animate-pulse rounded-full bg-cyan-500/10 blur-2xl" />
            <Lock
              className="relative h-24 w-24 animate-bounce text-cyan-400 opacity-20"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Vault is empty</p>
          <p className="mt-2 text-xs text-slate-500 italic px-4">
            "The gap between stimulus and response is where your power lies. Lock it away."
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((v) => {
          const due = new Date(v.createdAt).getTime() + v.delayHours * 3600000;
          const remaining = due - now;
          const isCooling = v.status === "cooling";
          const isReady = v.status === "ready";
          const isApproved = v.status === "approved";
          const isDiscarded = v.status === "discarded";
          return (
            <div
              key={v.id}
              className={`rounded-2xl border p-4 transition-all ${
                isReady
                  ? "border-emerald-400 bg-emerald-400/5 shadow-[0_0_20px_rgba(0,255,135,0.15)]"
                  : isCooling
                  ? "border-slate-800 bg-slate-900 opacity-80"
                  : isApproved
                  ? "border-cyan-400/30 bg-slate-900/60"
                  : "border-slate-800 bg-slate-900/40 opacity-50"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isCooling && <Lock className="h-4 w-4 text-slate-500" />}
                    {isReady && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    <p className="font-semibold text-white">{v.itemName}</p>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {v.category} · {v.delayHours}h cool
                  </p>
                </div>
                <p className="font-mono text-sm text-cyan-400">{fmtMoney(v.estimatedAmountVND, cur, rate)}</p>
              </div>
              {v.justification && <p className="mb-3 text-xs italic text-slate-400">"{v.justification}"</p>}

              {isCooling && (
                <div className="rounded-lg bg-slate-950 px-3 py-2 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Unlocks in</p>
                  <p className="font-mono text-2xl font-bold text-amber-400">{formatHMS(remaining)}</p>
                </div>
              )}

              {isCooling && (() => {
                const totalMs = v.delayHours * 3600000;
                const elapsed = Math.max(0, now - new Date(v.createdAt).getTime());
                const pct = Math.min(100, (elapsed / totalMs) * 100);
                return (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-widest text-slate-600">
                      <span>Time Endured</span>
                      <span>{Math.floor(pct)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800/60">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, rgba(0,212,255,0.6), #00d4ff)',
                          boxShadow: '0 0 8px rgba(0,212,255,0.5)',
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {isReady && (
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() => app.approveVault(v.id)}
                      className="touch-none select-none w-full rounded-lg bg-emerald-400 py-2.5 font-mono text-xs font-bold uppercase text-slate-950 hover:bg-emerald-300"
                    >
                      ⚔️ Claim Item (Endurance Win)
                    </button>
                    <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-widest text-emerald-400/80">
                      +15 DP · logged guilt-free
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => app.discardVault(v.id)}
                      className="touch-none select-none w-full rounded-lg border border-slate-700 py-2.5 font-mono text-xs font-bold uppercase text-slate-300 hover:border-amber-400 hover:text-amber-300"
                    >
                      🏆 Discard Impulse (Total Victory)
                    </button>
                    <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
                      +50 DP · impulse defeated
                    </p>
                  </div>
                </div>
              )}

              {isApproved && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">✓ Approved & Logged</p>
              )}
              {isDiscarded && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">✗ Discarded</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
