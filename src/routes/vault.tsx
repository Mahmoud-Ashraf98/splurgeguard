import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock, CheckCircle2, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fmtMoney } from "@/lib/splurge-utils";
import { toast } from "sonner";

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

  const us = app.data.userState;
  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;

  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;

  // Auto-promote cooling -> ready
  useEffect(() => {
    app.data.vaultItems.forEach((v) => {
      if (v.status === "cooling") {
        const due = new Date(v.createdAt).getTime() + v.delayHours * 3600000;
        if (due <= now) {
          app.markVaultReady(v.id);
          toast(`🔓 Vault Item Ready: ${v.itemName}`, { duration: 8000 });
        }
      }
    });
  }, [now, app]);

  const items = app.data.vaultItems;

  return (
    <div className="px-5 pb-24 pt-6">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Cooling-Off</p>
        <h1 className="text-2xl font-bold text-white">Vault</h1>
      </header>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
          <Lock className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">Your vault is empty.</p>
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

              {isReady && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => app.approveVault(v.id)}
                    className="rounded-lg bg-emerald-400 py-2.5 font-mono text-xs font-bold uppercase text-slate-950 hover:bg-emerald-300"
                  >
                    ✅ Purchase
                  </button>
                  <button
                    onClick={() => app.discardVault(v.id)}
                    className="rounded-lg border border-slate-700 py-2.5 font-mono text-xs font-bold uppercase text-slate-300 hover:border-rose-500 hover:text-rose-400"
                  >
                    🗑️ Discard
                  </button>
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
