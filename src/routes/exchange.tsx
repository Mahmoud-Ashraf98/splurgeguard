import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Coffee,
  Gamepad2,
  Plane,
  ShoppingBag,
  Pizza,
  Music,
  Film,
  Gift,
  Plus,
  MoreVertical,
  Coins,
  Zap,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { RewardIcon, RewardItem, getLevelDef, levelForLifetimeDP } from "@/lib/splurge-types";

export const Route = createFileRoute("/exchange")({
  component: ExchangePage,
});

const ICONS: { key: RewardIcon; Icon: React.ElementType }[] = [
  { key: "Coffee", Icon: Coffee },
  { key: "Gamepad2", Icon: Gamepad2 },
  { key: "Plane", Icon: Plane },
  { key: "ShoppingBag", Icon: ShoppingBag },
  { key: "Pizza", Icon: Pizza },
  { key: "Music", Icon: Music },
  { key: "Film", Icon: Film },
  { key: "Gift", Icon: Gift },
];

const iconFor = (k: RewardIcon) => ICONS.find((i) => i.key === k)?.Icon ?? Gift;

function ExchangePage() {
  const app = useApp();
  const us = app.data.userState;
  const [editing, setEditing] = useState<RewardItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;

  const dp = us.totalDP;
  const rewards = app.data.rewardsStore;
  const lvl = getLevelDef(us.currentLevel);
  const earnedLvl = levelForLifetimeDP(us.lifetimeDP);
  const nextLvl = earnedLvl.level < 10 ? getLevelDef(earnedLvl.level + 1) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.10),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(0,212,255,0.08),_transparent_60%)] bg-[#0a0e1a] px-5 pb-28 pt-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-400/80">Black Market</p>
          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ textShadow: "0 0 18px rgba(168,85,247,0.55)" }}
          >
            The Exchange
          </h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-fuchsia-300 transition-all hover:bg-fuchsia-500/20 hover:shadow-[0_0_15px_-3px_#a855f7]"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </header>

      {/* DP wallet */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-slate-900/50 p-4 backdrop-blur-xl shadow-[0_0_30px_-15px_rgba(0,212,255,0.6)]">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-cyan-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">Wallet</span>
        </div>
        <span className="font-mono text-2xl font-black tabular-nums text-cyan-400" style={{ textShadow: "0 0 10px rgba(0,212,255,0.6)" }}>
          {dp} DP
        </span>
      </div>

      {/* Rank chip */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-slate-900/40 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Rank</p>
          <p className="font-mono text-sm font-bold uppercase tracking-wider text-emerald-300">
            LV {lvl.level} · {lvl.title}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Lifetime</p>
          <p className="font-mono text-sm tabular-nums text-slate-300">
            {us.lifetimeDP}
            {nextLvl && <span className="text-slate-600"> / {nextLvl.threshold}</span>}
          </p>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fuchsia-400/20 bg-slate-900/30 p-10 text-center">
          <Gift className="mx-auto mb-3 h-10 w-10 text-fuchsia-400/60" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Empty Vault</p>
          <p className="mt-2 text-xs text-slate-600">Build rewards. Bend desire to the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rewards.map((r) => {
            const Icon = iconFor(r.icon);
            const can = dp >= r.costDP;
            const pct = Math.min(1, dp / r.costDP);
            return (
              <div
                key={r.id}
                className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all ${
                  can
                    ? "border-emerald-400/40 bg-slate-900/50 shadow-[0_0_25px_-10px_rgba(0,255,135,0.7)]"
                    : "border-slate-700/60 bg-slate-900/30 opacity-90"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                        can ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-slate-700 bg-slate-950 text-slate-500"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{r.title}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        Redeemed × {r.timesRedeemed}
                      </p>
                      <p className={`mt-1 font-mono text-sm tabular-nums ${can ? "text-emerald-300" : "text-slate-400"}`}>
                        {r.costDP} DP
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                      aria-label="Menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {menuOpen === r.id && (
                      <div className="absolute right-0 top-8 z-10 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-950/95 shadow-xl backdrop-blur-xl">
                        <button
                          onClick={() => { setEditing(r); setMenuOpen(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-slate-300 hover:bg-slate-800"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => { app.deleteReward(r.id); setMenuOpen(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-rose-400 hover:bg-rose-950/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!can && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      <span>Progress</span>
                      <span className="tabular-nums">{dp} / {r.costDP}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-800/60">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {can && (
                  <button
                    onClick={() => app.redeemReward(r.id)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-2.5 font-mono text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_20px_-5px_#00ff87] transition-all hover:scale-[1.01]"
                  >
                    <Zap className="h-3.5 w-3.5" /> Redeem
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <RewardForm
          initial={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={(payload) => {
            if (editing) app.updateReward(editing.id, payload);
            else app.addReward(payload);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function RewardForm({
  initial,
  onClose,
  onSave,
}: {
  initial?: RewardItem;
  onClose: () => void;
  onSave: (p: { title: string; costDP: number; icon: RewardIcon }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [cost, setCost] = useState(String(initial?.costDP ?? ""));
  const [icon, setIcon] = useState<RewardIcon>(initial?.icon ?? "Coffee");

  const ok = title.trim().length > 0 && Number(cost) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-fuchsia-400/30 bg-slate-950/95 p-5 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-300">
            {initial ? "Edit Reward" : "New Reward"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Premium Coffee"
          className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-fuchsia-400"
        />
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Cost (DP)</label>
        <input
          inputMode="numeric"
          value={cost}
          onChange={(e) => setCost(e.target.value.replace(/\D/g, ""))}
          placeholder="100"
          className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-right font-mono text-lg tabular-nums text-cyan-400 outline-none focus:border-fuchsia-400"
        />
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Icon</label>
        <div className="mb-5 grid grid-cols-4 gap-2">
          {ICONS.map(({ key, Icon }) => (
            <button
              key={key}
              onClick={() => setIcon(key)}
              className={`flex h-12 items-center justify-center rounded-lg border transition-all ${
                icon === key
                  ? "border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-300 shadow-[0_0_15px_-3px_#a855f7]"
                  : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-700 py-2.5 font-mono text-xs uppercase tracking-wider text-slate-400">Cancel</button>
          <button
            onClick={() => ok && onSave({ title: title.trim(), costDP: Math.floor(Number(cost)), icon })}
            disabled={!ok}
            className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 disabled:opacity-40"
          >
            {initial ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
