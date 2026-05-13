import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { fmtMoney } from "@/lib/splurge-utils";
import type { Currency } from "@/lib/splurge-types";

type RaidKind = "impulse" | "emergency";

interface Props {
  open: boolean;
  onClose: () => void;
  withdrawFromSavings: (
    amountCents: number,
    type: RaidKind,
    justification: string | null,
    options?: { onSuccess?: () => void },
  ) => void;
  maxRaidCents: number;
  displayCurrency: Currency;
  usdExchangeRate: number;
}

export function SavingsRaidModal({
  open,
  onClose,
  withdrawFromSavings,
  maxRaidCents,
  displayCurrency,
  usdExchangeRate,
}: Props) {
  const [amountStr, setAmountStr] = useState("");
  const [kind, setKind] = useState<RaidKind>("emergency");
  const [justification, setJustification] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmountStr("");
    setKind("emergency");
    setJustification("");
    setCountdown(3);
    setDone(false);
  }, [open]);

  useEffect(() => {
    if (!open || kind !== "impulse") return;
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [open, kind]);

  const amount = Math.floor(Number(amountStr.replace(/\D/g, "")) || 0);
  const impulseReady = countdown === 0;
  const emergencyReady = justification.trim().length >= 50;
  const confirmDisabled =
    amount <= 0 ||
    amount > maxRaidCents ||
    (kind === "impulse" ? !impulseReady : !emergencyReady);

  const onConfirm = () => {
    if (confirmDisabled) return;
    const j = kind === "emergency" ? justification.trim() : null;
    withdrawFromSavings(amount, kind, j, { onSuccess: () => setDone(true) });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3"
          onClick={done ? onClose : undefined}
          role="presentation"
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl outline-none"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-mono text-sm font-black uppercase tracking-widest text-amber-200">
                  Integrity Toll
                </h2>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Withdraw from your PYF savings into your spending pool. Choose the nature of this
                  withdrawal.
                </p>
              </div>
            </div>

            {done ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                <p className="text-sm font-semibold text-emerald-200 leading-relaxed">
                  This money is now in your spending pool. Log your purchase normally — do not
                  create a separate expense entry for the raid.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full rounded-xl border border-emerald-500/40 bg-emerald-500/20 py-3 font-mono text-xs font-bold uppercase tracking-widest text-emerald-100 hover:bg-emerald-500/30"
                >
                  Understood
                </button>
              </div>
            ) : (
              <>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Amount (max {fmtMoney(maxRaidCents, displayCurrency, usdExchangeRate)})
                </label>
                <input
                  inputMode="numeric"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  aria-label="Raid amount in whole currency units"
                  className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 font-mono text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />

                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Withdrawal type
                </p>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKind("impulse")}
                    className={`rounded-xl border py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      kind === "impulse"
                        ? "border-rose-500/60 bg-rose-500/15 text-rose-200"
                        : "border-slate-700 bg-slate-950/50 text-slate-400"
                    }`}
                  >
                    Impulse
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind("emergency")}
                    className={`rounded-xl border py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      kind === "emergency"
                        ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-200"
                        : "border-slate-700 bg-slate-950/50 text-slate-400"
                    }`}
                  >
                    Genuine emergency
                  </button>
                </div>

                {kind === "impulse" && (
                  <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                      <p className="text-xs text-rose-200/90 leading-relaxed">
                        Costs 200 DP &amp; breaks streak. Confirm unlocks after{" "}
                        <span className="font-mono font-bold text-rose-100">{countdown || "GO"}</span>
                        {countdown > 0 ? "…" : ""}
                      </p>
                    </div>
                  </div>
                )}

                {kind === "emergency" && (
                  <div className="mb-4">
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      Justification (min 50 characters)
                    </label>
                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                      placeholder="Describe the genuine emergency in detail…"
                    />
                    <p className="mt-1 text-right font-mono text-[10px] text-slate-500">
                      {justification.trim().length}/50
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-slate-700 py-3 font-mono text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-800/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={confirmDisabled}
                    onClick={onConfirm}
                    className="flex-1 rounded-xl border border-amber-500/50 bg-amber-500/15 py-3 font-mono text-xs font-bold uppercase tracking-widest text-amber-200 hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
