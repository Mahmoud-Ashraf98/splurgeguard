import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  contractName: string;
  penalty: number;
  onCancel: () => void;
  onConfirm: () => void;
  cooldownMs?: number;
}

export function ForfeitModal({ open, contractName, penalty, onCancel, onConfirm, cooldownMs = 1500 }: Props) {
  const [seconds, setSeconds] = useState(Math.ceil(cooldownMs / 1000));
  const [armed, setArmed] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setArmed(false);
    setSeconds(Math.ceil(cooldownMs / 1000));
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const left = Math.max(0, cooldownMs - (Date.now() - startedAt));
      const s = Math.ceil(left / 1000);
      setSeconds(s);
      if (left <= 0) {
        setArmed(true);
        clearInterval(tick);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [open, cooldownMs]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onCancel}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forfeit-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm mx-3 mb-3 sm:mb-0 rounded-2xl border border-rose-700/50 bg-gradient-to-b from-[#180810] to-[#0a0306] p-5 shadow-[0_20px_60px_rgba(180,20,40,0.45)] outline-none"
            style={{ willChange: "transform" }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 id="forfeit-title" className="font-mono text-sm font-black uppercase tracking-widest text-rose-300">
                  Giving In
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-rose-100/80">
                  Giving in to <span className="font-bold text-white">{contractName}</span> cannot be undone.
                  You will lose the DP reward ({penalty} DP). Are you sure?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              >
                Stay Strong
              </button>
              <button
                disabled={!armed}
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  armed
                    ? "bg-rose-700 border-rose-500 text-white hover:bg-rose-600 active:scale-95"
                    : "bg-rose-950/60 border-rose-900 text-rose-300/40 cursor-not-allowed"
                }`}
              >
                {armed ? "Give In Anyway" : `Give In Anyway (${seconds})`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
