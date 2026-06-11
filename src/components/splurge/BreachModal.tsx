import { Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { fmtMoney } from "@/lib/splurge-utils";

export function BreachModal() {
  const { breach, clearBreach, data } = useApp();
  const dialogRef = useDialogA11y(!!breach, clearBreach);
  if (!breach) return null;

  const cur = data.userState?.displayCurrency ?? "VND";
  const rate = data.userState?.usdExchangeRate ?? 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={clearBreach}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="breach-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border-2 border-rose-500 bg-slate-900 p-6 shadow-[0_0_60px_rgba(255,71,87,0.4)] outline-none"
      >
        <div className="mb-3 text-5xl" aria-hidden>🚨</div>
        <h2 id="breach-title" className="mb-2 font-mono text-2xl font-bold text-rose-500">
          DAILY LIMIT EXCEEDED
        </h2>

        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-widest text-slate-400">This purchase</span>
            <span className="font-bold tabular-nums text-rose-400">
              {fmtMoney(breach.amountVND, cur, rate)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-widest text-slate-400">Daily limit</span>
            <span className="font-bold tabular-nums text-slate-200">
              {fmtMoney(breach.limitVND, cur, rate)}
            </span>
          </div>
        </div>

        {breach.alreadyPenalized ? (
          <p className="mb-4 text-sm text-slate-300">
            Already penalized today — no additional DP loss. Stop the bleeding.
          </p>
        ) : (
          <p className="mb-4 text-sm text-slate-300">
            Streak Reset to 0. <span className="font-mono text-rose-400">−25 DP.</span>
          </p>
        )}

        <button
          onClick={clearBreach}
          className="w-full rounded-lg bg-rose-500 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white hover:bg-rose-600"
        >
          Acknowledge
        </button>
        <Link
          to="/vault"
          search={{ new: true }}
          onClick={clearBreach}
          className="mt-2 block w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 py-3 text-center font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-500/20"
        >
          Next time, vault it →
        </Link>
      </div>
    </div>
  );
}
