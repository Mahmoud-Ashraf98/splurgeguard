import { motion, AnimatePresence } from 'framer-motion';
import { Bike, Coffee, ShoppingCart, Utensils, CupSoda, Check, X, Target, type LucideIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DailyContract } from '@/lib/splurge-types';

const ICON_MAP: Record<string, LucideIcon> = {
  Bike,
  Coffee,
  ShoppingCart,
  Utensils,
  CupSoda,
};

function ContractCard({
  contract,
  onExecute,
  onYield,
}: {
  contract: DailyContract;
  onExecute: (id: string) => void;
  onYield: (id: string) => void;
}) {
  const Icon = ICON_MAP[contract.iconType] ?? Coffee;
  const isSecured = contract.status === 'secured';
  const isYielded = contract.status === 'yielded';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
        isSecured
          ? 'border-emerald-500/30 bg-emerald-950/20'
          : isYielded
          ? 'border-rose-500/30 bg-rose-950/20'
          : 'border-slate-800/80 bg-slate-950/40'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border ${
            isSecured
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : isYielded
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
              : 'border-slate-700 bg-slate-900 text-cyan-400'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-bold ${isYielded ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
            {contract.title}
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">{contract.subtitle}</p>
        </div>
      </div>

      {contract.status === 'available' ? (
        <div className="flex items-center gap-1 flex-shrink-0 touch-none select-none">
          <button
            onClick={() => onYield(contract.id)}
            className="touch-none select-none p-2 rounded hover:bg-slate-800 text-slate-600 hover:text-rose-400 transition-colors"
            aria-label="Yield"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => onExecute(contract.id)}
            className="touch-none select-none px-3 py-1 bg-slate-800 hover:bg-cyan-900/50 border border-slate-700/50 rounded text-[10px] font-mono font-bold text-cyan-400 tracking-widest transition-colors flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> SECURE
          </button>
        </div>
      ) : (
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${
            isSecured ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isSecured ? `SECURED [+${contract.reward} DP]` : `FORFEITED [${contract.penalty} DP]`}
        </span>
      )}
    </motion.div>
  );
}

export function DailyContractsBoard() {
  const { data, updateUserState } = useApp();
  const us = data.userState;
  const contracts = us?.dailyContracts ?? [];

  const handleExecute = (id: string) => {
    if (!us) return;
    const contract = contracts.find((c) => c.id === id);
    if (!contract || contract.status !== 'available') return;
    updateUserState({
      totalDP: us.totalDP + contract.reward,
      ascensionXP: (us.ascensionXP ?? 0) + contract.reward,
      lifetimeDP: us.lifetimeDP + Math.max(0, contract.reward),
      dailyContracts: contracts.map((c) =>
        c.id === id ? { ...c, status: 'secured' as const } : c,
      ),
    });
  };

  const handleYield = (id: string) => {
    if (!us) return;
    const contract = contracts.find((c) => c.id === id);
    if (!contract || contract.status !== 'available') return;
    updateUserState({
      totalDP: us.totalDP + contract.penalty,
      ascensionXP: Math.max(0, (us.ascensionXP ?? 0) + contract.penalty),
      dailyContracts: contracts.map((c) =>
        c.id === id ? { ...c, status: 'yielded' as const } : c,
      ),
    });
  };

  if (!contracts.length) return null;
  const isSettled = contracts.every((c) => c.status !== 'available');

  return (
    <div className="mb-6 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-cyan-400" />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            The Daily Protocol
          </h2>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          {contracts.filter((c) => c.status !== 'available').length}/{contracts.length}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onExecute={handleExecute}
              onYield={handleYield}
            />
          ))}
        </AnimatePresence>
      </div>

      {isSettled && (
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Contracts settled. Refresh at midnight.
        </p>
      )}
    </div>
  );
}
