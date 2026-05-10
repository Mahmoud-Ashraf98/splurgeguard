import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Plus, Minus, Sparkles, Zap, ShoppingBag, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { REWARD_ARCHETYPES, RewardArchetype } from "@/lib/archetypes";
import { useLongPress } from "@/hooks/useLongPress";

type ExchangeSearch = { new?: boolean };

export const Route = createFileRoute("/exchange")({
  validateSearch: (s: Record<string, unknown>): ExchangeSearch => ({
    new: s.new === true || s.new === "true",
  }),
  component: ExchangePage,
});

type View = "list" | "archetype-grid" | "stepper";

function ExchangePage() {
  const app = useApp();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const us = app.data.userState;

  const [view, setView] = useState<View>("list");
  const [archetype, setArchetype] = useState<RewardArchetype | null>(null);
  const [costDP, setCostDP] = useState(50);
  const [customTitle, setCustomTitle] = useState("");
  const [showIntegrity, setShowIntegrity] = useState(false);

  useEffect(() => {
    if (search.new) {
      setView("archetype-grid");
      navigate({ to: "/exchange", search: { new: undefined } as ExchangeSearch, replace: true });
    }
  }, [search.new, navigate]);

  const activeRewards = useMemo(
    () => app.data.rewards.filter((r) => r.status === "active"),
    [app.data.rewards]
  );

  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;
  const dp = us.totalDP;

  const openStepper = (a: RewardArchetype) => {
    setArchetype(a);
    setCostDP(Math.max(50, a.baseDP));
    setCustomTitle("");
    setView("stepper");
  };

  const lockItIn = () => {
    if (!archetype) return;
    const finalTitle = archetype.id === "custom" ? customTitle.trim() || archetype.title : archetype.title;
    app.createReward({
      archetypeId: archetype.id,
      emoji: archetype.emoji,
      title: finalTitle,
      costDP,
    });
    setArchetype(null);
    setView("list");
  };

  const handleRedeem = (rewardId: string) => {
    const result = app.redeemReward(rewardId);
    if (result === "insufficient_dp") setShowIntegrity(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.10),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(0,212,255,0.08),_transparent_60%)] bg-[#0a0e1a] px-5 pb-28 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== "list" && (
            <button
              onClick={() => {
                if (view === "stepper") setView("archetype-grid");
                else setView("list");
              }}
              className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-1.5 text-slate-400 hover:text-cyan-300"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-400/80">Black Market</p>
            <h1
              className="text-2xl font-black tracking-tight text-white"
              style={{ textShadow: "0 0 18px rgba(168,85,247,0.55)" }}
            >
              The Exchange
            </h1>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-400/30 bg-slate-900/60 px-3 py-2 text-right backdrop-blur-xl">
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Wallet</p>
          <p
            className="font-mono text-lg font-black tabular-nums text-cyan-400"
            style={{ textShadow: "0 0 10px rgba(0,212,255,0.6)" }}
          >
            {dp} DP
          </p>
        </div>
      </header>

      {view === "list" && (
        <ListView
          rewards={activeRewards}
          dp={dp}
          onRedeem={handleRedeem}
          onDelete={(reward) => {
            const progressDP = (reward as any).currentDP ?? 0;
            const message =
              progressDP > 0
                ? `Delete "${reward.title}"? Your ${progressDP} DP progress will be lost. This cannot be undone.`
                : `Delete "${reward.title}"? This cannot be undone.`;
            if (!window.confirm(message)) return;
            app.deleteReward(reward.id);
          }}
          onNew={() => setView("archetype-grid")}
        />
      )}

      {view === "archetype-grid" && <ArchetypeGrid onPick={openStepper} />}

      {view === "stepper" && archetype && (
        <Stepper
          archetype={archetype}
          costDP={costDP}
          setCostDP={setCostDP}
          customTitle={customTitle}
          setCustomTitle={setCustomTitle}
          onLockIn={lockItIn}
        />
      )}

      {showIntegrity && <IntegrityModal onClose={() => setShowIntegrity(false)} />}
    </div>
  );
}

function ListView({
  rewards,
  dp,
  onRedeem,
  onDelete,
  onNew,
}: {
  rewards: ReturnType<typeof useApp>["data"]["rewards"];
  dp: number;
  onRedeem: (id: string) => void;
  onDelete: (reward: ReturnType<typeof useApp>["data"]["rewards"][number]) => void;
  onNew: () => void;
}) {
  return (
    <>
      <button
        onClick={onNew}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/10 to-cyan-400/10 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300 transition-all hover:scale-[1.01] hover:shadow-[0_0_25px_-5px_#a855f7]"
      >
        <Plus className="h-4 w-4" /> New Reward
      </button>

      {rewards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fuchsia-400/20 bg-slate-900/30 p-10 text-center">
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-fuchsia-400/60" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Empty Vault</p>
          <p className="mt-2 text-xs text-slate-600">Bend desire to the system. Lock in your first reward.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map((r) => {
            const can = dp >= r.costDP;
            const pct = Math.min(1, dp / r.costDP);
            return (
              <div
                key={r.id}
                className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all ${
                  can
                    ? "border-emerald-400/40 bg-slate-900/50 shadow-[0_0_25px_-10px_rgba(0,255,135,0.7)]"
                    : "border-slate-700/60 bg-slate-900/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl ${
                      can ? "border-emerald-400/40 bg-emerald-400/10" : "border-slate-700 bg-slate-950"
                    }`}
                  >
                    {r.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{r.title}</p>
                    <p className={`mt-0.5 font-mono text-sm tabular-nums ${can ? "text-emerald-300" : "text-slate-400"}`}>
                      {r.costDP} DP
                    </p>
                  </div>
                  <button
                    onClick={() => onRedeem(r.id)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 font-mono text-[11px] font-black uppercase tracking-widest transition-all ${
                      can
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-[0_0_20px_-5px_#00ff87] hover:scale-[1.03]"
                        : "border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_-5px_rgba(251,191,36,0.6)]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Redeem
                    </span>
                  </button>
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
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function ArchetypeGrid({ onPick }: { onPick: (a: RewardArchetype) => void }) {
  return (
    <>
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
        Pick your poison
      </p>
      <div className="grid grid-cols-2 gap-3">
        {REWARD_ARCHETYPES.map((a) => (
          <button
            key={a.id}
            onClick={() => onPick(a)}
            style={{ ["--glow" as never]: a.glow }}
            className="group flex flex-col items-start rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_0_25px_-5px_var(--glow)]"
          >
            <span className="mb-2 text-3xl">{a.emoji}</span>
            <span className="text-sm font-bold leading-tight text-white">{a.title}</span>
            <span className="mt-1 text-[11px] leading-snug text-slate-400">{a.subtext}</span>
            <span className="mt-3 font-mono text-[10px] uppercase tracking-widest text-cyan-400">
              from {a.baseDP} DP
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function Stepper({
  archetype,
  costDP,
  setCostDP,
  customTitle,
  setCustomTitle,
  onLockIn,
}: {
  archetype: RewardArchetype;
  costDP: number;
  setCostDP: React.Dispatch<React.SetStateAction<number>>;
  customTitle: string;
  setCustomTitle: (s: string) => void;
  onLockIn: () => void;
}) {
  const decCb = useCallback(
    (multiplier: number) => setCostDP((prev) => Math.max(50, prev - 50 * multiplier)),
    [setCostDP]
  );
  const incCb = useCallback(
    (multiplier: number) => setCostDP((prev) => prev + 50 * multiplier),
    [setCostDP]
  );
  const decHandlers = useLongPress(decCb);
  const incHandlers = useLongPress(incCb);
  const vnd = Math.floor(costDP * 100).toLocaleString("vi-VN");
  const isCustom = archetype.id === "custom";
  const valid = isCustom ? customTitle.trim().length > 0 : true;
  const noSelectStyle = { WebkitUserSelect: "none" as const, WebkitTouchCallout: "none" as const };
  const preventCtx = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div
      style={{ ["--glow" as never]: archetype.glow }}
      className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6 backdrop-blur-xl shadow-[0_0_40px_-10px_var(--glow)]"
    >
      <div className="mb-5 flex flex-col items-center text-center">
        <span className="text-6xl">{archetype.emoji}</span>
        <h2 className="mt-3 text-xl font-black text-white">{archetype.title}</h2>
        <p className="mt-1 text-xs text-slate-400">{archetype.subtext}</p>
      </div>

      {isCustom && (
        <div className="mb-5">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Reward Name
          </label>
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Name your treat"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>
      )}

      <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
        Set the cost
      </p>
      <div className="mb-2 flex items-center justify-center gap-4">
        <button
          {...decHandlers}
          onContextMenu={preventCtx}
          disabled={costDP <= 50}
          style={noSelectStyle}
          className="select-none touch-none flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition-all hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="min-w-[140px] text-center">
          <p
            className="font-mono text-5xl font-black tabular-nums text-cyan-400"
            style={{ textShadow: "0 0 18px rgba(0,212,255,0.6)" }}
          >
            {costDP}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">DP</p>
        </div>
        <button
          {...incHandlers}
          onContextMenu={preventCtx}
          style={noSelectStyle}
          className="select-none touch-none flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition-all hover:border-cyan-400/60 hover:text-cyan-300"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <p className="mb-6 text-center font-mono text-xs text-slate-500">
        ≈ {vnd} ₫
      </p>

      <button
        onClick={onLockIn}
        disabled={!valid}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-4 font-mono text-sm font-black uppercase tracking-[0.3em] text-slate-950 shadow-[0_0_30px_-5px_#a855f7] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" /> Lock It In
      </button>
    </div>
  );
}

function IntegrityModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl border border-amber-400/40 bg-slate-950/95 p-7 shadow-[0_0_60px_-10px_rgba(251,191,36,0.6)]">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300">
          Integrity Check
        </p>
        <h3 className="mb-4 text-xl font-black text-white">Not enough Discipline Points… yet.</h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          We know you want this, and it's tempting to close the app and just go buy it anyway. But your past self set these rules to protect your future self. Earn the points. It will feel so much better when it's real.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 py-3.5 font-mono text-sm font-black uppercase tracking-[0.3em] text-slate-950 shadow-[0_0_25px_-5px_rgba(251,191,36,0.7)] transition-all hover:scale-[1.01]"
        >
          I Will Wait.
        </button>
      </div>
    </div>
  );
}
