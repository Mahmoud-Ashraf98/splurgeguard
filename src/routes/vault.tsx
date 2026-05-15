import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Lock, CheckCircle2, Trash2, Trophy, Clock, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fmtMoney } from '@/lib/splurge-utils';
import type { VaultItem } from '@/lib/splurge-types';
import { toast } from 'sonner';
import { LogSheet } from '@/components/splurge/LogSheet';

export const Route = createFileRoute('/vault')({
  head: () => ({
    meta: [
      { title: 'Vault — SplurgeGuard' },
      { name: 'description', content: 'Cooling-off queue for impulse purchases. Items unlock after a delay so you can decide rationally.' },
      { property: 'og:title', content: 'The Vault — Cool off your impulse buys' },
      { property: 'og:description', content: 'Behavioral friction that turns impulse into intention.' },
      { property: 'og:url', content: 'https://splurgeguard.lovable.app/vault' },
    ],
    links: [{ rel: 'canonical', href: 'https://splurgeguard.lovable.app/vault' }],
  }),
  component: VaultPage,
});

function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SectionLabel({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${color}`}>
      {icon}
      <h2 className="font-mono text-[9px] uppercase tracking-[0.4em]">{label}</h2>
    </div>
  );
}

function CoolingCard({
  item: v,
  index,
  now,
  cur,
  rate,
  onRemove,
}: {
  item: VaultItem;
  index: number;
  now: number;
  cur: 'VND' | 'USD';
  rate: number;
  onRemove: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const totalMs = v.delayHours * 3600000;
  const elapsed = Math.max(0, now - new Date(v.createdAt).getTime());
  const remaining = Math.max(0, new Date(v.createdAt).getTime() + totalMs - now);
  const pct = Math.min(100, (elapsed / totalMs) * 100);

  return (
    <div
      className="rounded-2xl border border-amber-500/20 bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-500"
      style={{
        transitionDelay: `${index * 50}ms`,
        animation: 'vault-glow-breathe 4s ease-in-out infinite',
      }}
    >
      <div className="flex items-start gap-3 min-w-0 mb-3">
        <div className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/30">
          <Lock className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{v.itemName}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 truncate">
            {v.category} · {v.delayHours}h cool
          </p>
        </div>
        <p className="flex-shrink-0 font-mono text-sm font-bold text-cyan-400">
          {fmtMoney(v.estimatedAmountVND, cur, rate)}
        </p>
      </div>

      {v.justification && (
        <p className="mb-3 text-[11px] italic text-slate-500 break-words line-clamp-2">
          "{v.justification}"
        </p>
      )}

      <div className="mb-3 rounded-lg border border-amber-500/10 bg-slate-950/60 px-3 py-2 text-center">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500">
          Unlocks In
        </p>
        <p className="font-mono text-2xl font-bold tabular-nums text-amber-400 tracking-wider">
          {formatHMS(remaining)}
        </p>
      </div>

      <div className="mb-3">
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

      <div className="flex justify-end">
        <button
          onPointerDown={onRemove}
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-rose-400 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10 active:scale-95 select-none touch-none"
        >
          <Trash2 className="h-3 w-3" />
          Remove
        </button>
      </div>
    </div>
  );
}

function ReadyCard({
  item: v,
  index,
  cur,
  rate,
  onClaim,
  onDiscard,
}: {
  item: VaultItem;
  index: number;
  cur: 'VND' | 'USD';
  rate: number;
  onClaim: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onDiscard: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div
      className="rounded-2xl border border-emerald-400/30 bg-slate-900/50 backdrop-blur-md p-4 transition-all duration-500"
      style={{
        transitionDelay: `${index * 60}ms`,
        animation: 'vault-ready-pulse 2.5s ease-in-out infinite',
      }}
    >
      <div className="flex items-start gap-3 min-w-0 mb-3">
        <div className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 border border-emerald-400/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{v.itemName}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 truncate">
            {v.category} · Cooling complete
          </p>
        </div>
        <p className="flex-shrink-0 font-mono text-sm font-bold text-emerald-400">
          {fmtMoney(v.estimatedAmountVND, cur, rate)}
        </p>
      </div>

      {v.justification && (
        <p className="mb-3 text-[11px] italic text-slate-500 break-words line-clamp-2">
          "{v.justification}"
        </p>
      )}

      <div className="mb-4 rounded-lg bg-emerald-400/5 border border-emerald-400/10 px-3 py-1">
        <p className="text-center font-mono text-[9px] uppercase tracking-[0.4em] text-emerald-400">
          Vault Unlocked — Decision Required
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onPointerDown={onClaim}
          className="rounded-xl border border-slate-600/40 bg-slate-800/60 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-all duration-200 hover:border-slate-500 hover:text-white active:scale-95 select-none touch-none"
        >
          Claim Item
        </button>

        <button
          onPointerDown={onDiscard}
          className="rounded-xl py-3 font-mono text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all duration-200 active:scale-95 select-none touch-none"
          style={{
            background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
            boxShadow: '0 0 20px rgba(0,255,135,0.4)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 35px rgba(0,255,135,0.7)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 20px rgba(0,255,135,0.4)';
          }}
        >
          <Trophy className="inline h-3 w-3 mr-1" />
          Discard Impulse
        </button>
      </div>
      <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/70">
        Total Victory · DP Rewarded
      </p>
    </div>
  );
}

function ArchivedRow({
  item: v,
  index,
  cur,
  rate,
}: {
  item: VaultItem;
  index: number;
  cur: 'VND' | 'USD';
  rate: number;
}) {
  const isDiscard = v.status === 'discarded';
  return (
    <div
      className={`flex items-center gap-3 min-w-0 rounded-xl border px-4 py-3 transition-all duration-500 ${
        isDiscard ? 'border-emerald-400/10 bg-emerald-400/5' : 'border-white/5 bg-slate-900/20'
      }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex-shrink-0">
        {isDiscard ? (
          <Trophy className="h-4 w-4 text-emerald-400/50" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-slate-600" />
        )}
      </div>
      <p
        className={`flex-1 min-w-0 truncate font-mono text-xs ${
          isDiscard ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        {v.itemName}
      </p>
      <p
        className={`flex-shrink-0 font-mono text-xs tabular-nums ${
          isDiscard ? 'text-emerald-400/50' : 'text-slate-700'
        }`}
      >
        {fmtMoney(v.estimatedAmountVND, cur, rate)}
      </p>
      <p
        className={`flex-shrink-0 font-mono text-[8px] uppercase tracking-widest ${
          isDiscard ? 'text-emerald-400/60' : 'text-slate-600'
        }`}
      >
        {isDiscard ? 'Victory' : 'Claimed'}
      </p>
    </div>
  );
}

function VaultPage() {
  const app = useApp();
  const [now, setNow] = useState(Date.now());
  const [vaultSheetOpen, setVaultSheetOpen] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  // Vault cooling->ready transitions are handled globally in AppContext.

  const us = app.data.userState;
  if (!us) return <div className="p-6 font-mono text-slate-400">Set up the app first.</div>;

  const cur = us.displayCurrency;
  const rate = us.usdExchangeRate;
  const items = app.data.vaultItems;

  const cooling = items.filter((v) => v.status === 'cooling');
  const ready = items.filter((v) => v.status === 'ready');
  const archived = items.filter((v) => v.status === 'approved' || v.status === 'discarded');

  return (
    <div className="px-5 pb-32 pt-6">
      <header className="mb-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-cyan-400/70">
          Impulse Control
        </p>
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">The Vault</h1>
        <p className="mt-1 font-mono text-[10px] text-slate-500">
          {cooling.length} locked · {ready.length} ready · {archived.length} archived
        </p>
      </header>

      {cooling.length === 0 && ready.length === 0 && (
        <div
          className="
            mx-4 mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-700/80
            bg-slate-900/40 p-8 text-center
          "
        >
          <div
            className="
              mb-1 flex h-12 w-12 items-center justify-center rounded-full
              border border-slate-700 bg-slate-800
            "
          >
            <Lock className="h-5 w-5 text-slate-500" />
          </div>
          <p className="font-mono text-sm tracking-wide text-slate-300">VAULT EMPTY</p>
          <p className="max-w-[220px] text-xs leading-relaxed text-slate-500">
            Resist an impulse purchase and stash it here.{' '}
            <span className="text-slate-400">Build your Freedom Engine.</span>
          </p>
        </div>
      )}

      {cooling.length > 0 && (
        <section className="mb-8">
          <SectionLabel
            icon={<Lock className="h-3 w-3" />}
            label="Active Cooling"
            color="text-amber-400"
          />
          <div className="space-y-3">
            {cooling.map((v, index) => (
              <CoolingCard
                key={v.id}
                item={v}
                index={index}
                now={now}
                cur={cur}
                rate={rate}
                onRemove={(e) => {
                  e.stopPropagation();
                  app.deleteVaultItem(v.id);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {ready.length > 0 && (
        <section className="mb-8">
          <SectionLabel
            icon={<CheckCircle2 className="h-3 w-3" />}
            label="Resolution Phase"
            color="text-emerald-400"
          />
          <div className="space-y-3">
            {ready.map((v, index) => (
              <ReadyCard
                key={v.id}
                item={v}
                index={index}
                cur={cur}
                rate={rate}
                onClaim={(e) => {
                  e.stopPropagation();
                  app.approveVault(v.id);
                }}
                onDiscard={(e) => {
                  e.stopPropagation();
                  app.discardVault(v.id);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section>
          <SectionLabel
            icon={<Clock className="h-3 w-3" />}
            label="Archived Records"
            color="text-slate-500"
          />
          <div className="space-y-2">
            {archived.map((v, index) => (
              <ArchivedRow key={v.id} item={v} index={index} cur={cur} rate={rate} />
            ))}
          </div>
        </section>
      )}

      {/* Vault FAB — fades out while LogSheet is animating open */}
      <div
        className={`fixed bottom-20 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-5 transition-all duration-300 ${
          vaultSheetOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 pointer-events-auto scale-100"
        }`}
      >
        <button
          onClick={() => setVaultSheetOpen(true)}
          className="cta-ripple relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-mono text-sm font-bold uppercase tracking-[0.25em] text-slate-950 shadow-[0_0_28px_-6px_#00d4ff] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_200%] animate-[gradient-cycle_4s_linear_infinite]"
          style={{
            backgroundImage: "linear-gradient(90deg, #00C8FF, #00FFA3, #00C8FF)",
            willChange: "transform",
          }}
        >
          <Plus className="h-5 w-5" /> Delay a Purchase
        </button>
      </div>

      <LogSheet
        open={vaultSheetOpen}
        onClose={() => setVaultSheetOpen(false)}
        initialMode="vault"
      />
    </div>
  );
}
