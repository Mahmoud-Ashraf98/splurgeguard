import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  ALL_CATEGORIES,
  DISCRETIONARY_CATEGORIES,
  ESSENTIAL_CATEGORIES,
} from "@/lib/splurge-types";
import { fmtVND } from "@/lib/splurge-utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LogSheet({ open, onClose }: Props) {
  const { logExpense, addToVault, data } = useApp();
  const [mode, setMode] = useState<"log" | "vault">("log");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [justification, setJustification] = useState("");
  const [currency, setCurrency] = useState<"VND" | "USD">("VND");
  // vault
  const [itemName, setItemName] = useState("");
  const [delayHours, setDelayHours] = useState(24);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setCategory("");
      setJustification("");
      setCurrency("VND");
      setItemName("");
      setDelayHours(24);
      setMode("log");
    }
  }, [open]);

  const showCurrency = category === "Travelling" || category === "Visa and documents fees";
  const rate = data.userState?.usdExchangeRate ?? 25400;

  const amountVND = useMemo(() => {
    const n = Number(amount);
    if (!n) return 0;
    return showCurrency && currency === "USD" ? Math.round(n * rate) : Math.floor(n);
  }, [amount, currency, showCurrency, rate]);

  const formattedAmount = amount ? Number(amount).toLocaleString("en-US") : "";

  const canLog = amountVND > 0 && category && justification.trim().length >= 5;
  const canVault = itemName.trim().length > 0 && amountVND > 0 && category && justification.trim().length >= 5;

  if (!open) return null;

  const submitLog = () => {
    if (!canLog) return;
    logExpense({
      amountVND,
      originalAmount: showCurrency && currency === "USD" ? Number(amount) : undefined,
      originalCurrency: showCurrency ? currency : "VND",
      category,
      justification: justification.trim(),
    });
    onClose();
  };

  const submitVault = () => {
    if (!canVault) return;
    addToVault({
      itemName: itemName.trim(),
      estimatedAmountVND: amountVND,
      category,
      delayHours,
      justification: justification.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t-2 border-emerald-400/40 bg-slate-900 p-5 shadow-[0_-10px_60px_rgba(0,255,135,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1">
            <button
              onClick={() => setMode("log")}
              className={`rounded-md px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                mode === "log" ? "bg-emerald-400 text-slate-950" : "text-slate-400"
              }`}
            >
              Log Expense
            </button>
            <button
              onClick={() => setMode("vault")}
              className={`rounded-md px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                mode === "vault" ? "bg-cyan-400 text-slate-950" : "text-slate-400"
              }`}
            >
              Add to Vault
            </button>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "vault" && (
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Item Name
            </label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="New jacket..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Amount {showCurrency && `(${currency})`}
          </label>
          <input
            inputMode="numeric"
            value={formattedAmount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 text-right font-mono text-3xl font-bold text-emerald-400 outline-none focus:border-emerald-400"
          />
          {showCurrency && currency === "USD" && amountVND > 0 && (
            <p className="mt-1 text-right font-mono text-xs text-slate-500">≈ {fmtVND(amountVND)}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
          >
            <option value="">Select category...</option>
            <optgroup label="Essentials">
              {ESSENTIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
            <optgroup label="Discretionary">
              {DISCRETIONARY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {showCurrency && mode === "log" && (
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Currency
            </label>
            <div className="flex gap-2">
              {(["VND", "USD"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`flex-1 rounded-lg border py-2 font-mono text-sm ${
                    currency === c
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                      : "border-slate-700 bg-slate-950 text-slate-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "vault" && (
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Cooling Period
            </label>
            <div className="flex gap-2">
              {[
                { v: 24, l: "24h" },
                { v: 48, l: "48h" },
                { v: 168, l: "7 days" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setDelayHours(v)}
                  className={`flex-1 rounded-lg border py-2 font-mono text-sm ${
                    delayHours === v
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-700 bg-slate-950 text-slate-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Justification (min 5 chars)
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Why are you making this purchase?"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
          />
        </div>

        <button
          onClick={mode === "log" ? submitLog : submitVault}
          disabled={mode === "log" ? !canLog : !canVault}
          className={`w-full rounded-xl py-4 font-mono text-sm font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 ${
            mode === "log"
              ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          }`}
        >
          {mode === "log" ? "Confirm Expense" : "Lock in Vault"}
        </button>
      </div>
    </div>
  );
}
