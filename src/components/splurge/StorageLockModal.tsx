import { useMemo } from "react";
import { useApp } from "@/context/AppContext";

/**
 * Blocking modal surfaced when `localStorage.setItem` rejects a write (typically
 * a `QuotaExceededError`). The AppContext mutate pipeline freezes all volatile
 * state mutations while `storageLocked` is true; this modal is the only way
 * back to a writable state. Each prune action attempts a fresh persist — on
 * success the lock auto-releases via the standard save effect.
 */
export function StorageLockModal() {
  const { storageLocked, data, pruneTransactionsOlderThan, pruneDiscardedVaultItems } = useApp();

  const stats = useMemo(() => {
    const now = Date.now();
    const txCount = data.transactions.length;
    const txOlder30 = data.transactions.filter(
      (t) => now - new Date(t.timestamp).getTime() > 30 * 86400000,
    ).length;
    const txOlder90 = data.transactions.filter(
      (t) => now - new Date(t.timestamp).getTime() > 90 * 86400000,
    ).length;
    const discardedVault = data.vaultItems.filter((v) => v.status === "discarded").length;
    return { txCount, txOlder30, txOlder90, discardedVault };
  }, [data.transactions, data.vaultItems]);

  if (!storageLocked) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/60 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(245,158,11,0.35)] backdrop-blur-xl">
        <div className="mb-3 text-5xl">⚠️</div>
        <h2 className="mb-2 font-mono text-2xl font-bold text-amber-400">
          STORAGE BREACH — WRITES FROZEN
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          The device cannot persist any new state. To prevent your in-memory
          ledger from diverging from disk, all edits are locked. Prune historical
          data below to release the write-lock.
        </p>

        <div className="mb-5 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3 font-mono text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Total transactions</span>
            <span className="text-slate-200">{stats.txCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Older than 30 days</span>
            <span className="text-slate-200">{stats.txOlder30}</span>
          </div>
          <div className="flex justify-between">
            <span>Older than 90 days</span>
            <span className="text-slate-200">{stats.txOlder90}</span>
          </div>
          <div className="flex justify-between">
            <span>Discarded vault items</span>
            <span className="text-slate-200">{stats.discardedVault}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => pruneTransactionsOlderThan(90)}
            disabled={stats.txOlder90 === 0}
            className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-3 font-mono text-xs uppercase tracking-wider text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prune transactions &gt; 90 days ({stats.txOlder90})
          </button>
          <button
            onClick={() => pruneTransactionsOlderThan(30)}
            disabled={stats.txOlder30 === 0}
            className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-3 font-mono text-xs uppercase tracking-wider text-slate-200 transition hover:border-amber-500/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prune transactions &gt; 30 days ({stats.txOlder30})
          </button>
          <button
            onClick={pruneDiscardedVaultItems}
            disabled={stats.discardedVault === 0}
            className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-3 font-mono text-xs uppercase tracking-wider text-slate-200 transition hover:border-rose-500/50 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear discarded vault items ({stats.discardedVault})
          </button>
        </div>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Lock auto-releases on the first successful write.
        </p>
      </div>
    </div>
  );
}
