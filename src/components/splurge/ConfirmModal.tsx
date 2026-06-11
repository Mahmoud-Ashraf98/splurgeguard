import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useDialogA11y } from "@/hooks/useDialogA11y";

interface Props {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" = destructive (rose), "info" = neutral commitment (cyan). */
  tone?: "danger" | "info";
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * App-styled confirmation dialog. Replaces window.confirm and guards
 * destructive / money-moving actions (vault removal, claims, reward deletion).
 */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  onCancel,
  onConfirm,
}: Props) {
  const dialogRef = useDialogA11y(open, onCancel);
  const danger = tone === "danger";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onCancel}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-sm mx-3 mb-3 sm:mb-0 rounded-2xl border p-5 outline-none ${
              danger
                ? "border-rose-700/50 bg-gradient-to-b from-[#180810] to-[#0a0306] shadow-[0_20px_60px_rgba(180,20,40,0.45)]"
                : "border-cyan-700/50 bg-gradient-to-b from-[#06121d] to-[#030a10] shadow-[0_20px_60px_rgba(8,145,178,0.35)]"
            }`}
            style={{ willChange: "transform" }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border ${
                  danger
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                    : "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                }`}
              >
                {danger ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <h2
                  id="confirm-modal-title"
                  className={`font-mono text-sm font-black uppercase tracking-widest ${
                    danger ? "text-rose-300" : "text-cyan-300"
                  }`}
                >
                  {title}
                </h2>
                <div className="mt-1.5 text-[12px] leading-relaxed text-slate-200/85">{body}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-transparent border border-slate-700/50 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 hover:border-slate-600 active:scale-95 transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest transition-all border active:scale-95 ${
                  danger
                    ? "bg-rose-700 border-rose-500 text-white hover:bg-rose-600"
                    : "bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
