import { useApp } from "@/context/AppContext";

export function BreachModal() {
  const { breach, clearBreach } = useApp();
  if (!breach) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border-2 border-rose-500 bg-slate-900 p-6 shadow-[0_0_60px_rgba(255,71,87,0.4)]">
        <div className="mb-3 text-5xl">🚨</div>
        <h2 className="mb-2 font-mono text-2xl font-bold text-rose-500">DAILY LIMIT EXCEEDED</h2>
        <p className="mb-4 text-sm text-slate-300">
          Streak Reset to 0. <span className="font-mono text-rose-400">−25 DP.</span>
        </p>
        <button
          onClick={clearBreach}
          className="w-full rounded-lg bg-rose-500 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white hover:bg-rose-600"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
