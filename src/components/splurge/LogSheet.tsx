import { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronDown,
  ShieldCheck,
  BarChart3,
  Check,
  Beef,
  ShoppingCart,
  Fuel,
  Home,
  FileText,
  CupSoda,
  Shirt,
  Plane,
  Target,
  Wifi,
  HeartPulse,
  Archive,
  UtensilsCrossed,
  CreditCard,
  Cpu,
  Dumbbell,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "Meat and chicken": Beef,
  "Other essential home groceries": ShoppingCart,
  "Motorbike expenses": Fuel,
  "Rent": Home,
  "Visa and documents fees": FileText,
  "Utilities, Phone & Internet": Wifi,
  "Medical & Pharmacy": HeartPulse,
  "Other Essentials": Archive,
  "Diet soda and bottled cold tea soft drinks": CupSoda,
  "Clothes": Shirt,
  "Travelling": Plane,
  
  "Dining Out & Street Food": UtensilsCrossed,
  "Software & Digital Subscriptions": CreditCard,
  "Tech & Hardware Upgrades": Cpu,
  "Fitness & Supplements": Dumbbell,
  "Other Splurges": Sparkles,
};

const CatIcon = ({ name, className, isHabit }: { name: string; className?: string; isHabit?: boolean }) => {
  if (isHabit) return <Target className={className} />;
  const Icon = categoryIcons[name] ?? MoreHorizontal;
  return <Icon className={className} />;
};
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import {
  DISCRETIONARY_CATEGORIES,
  ESSENTIAL_CATEGORIES,
  isEssentialCategory,
} from "@/lib/splurge-types";
import { fmtVND, fmtMoney } from "@/lib/splurge-utils";

/** Compact human-readable magnitude badge: 1.5M, 750K. */
const humanAmountBadge = (n: number): string | null => {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return (Number.isInteger(m) ? m : m.toFixed(1)) + "M";
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return (Number.isInteger(k) ? k : k.toFixed(1)) + "K";
  }
  return null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  initialMode?: "log" | "vault";
  /** Optional values to pre-fill the "Log Expense" form (e.g. from a receipt scan). */
  prefill?: { amountVND: number; category: string; justification: string } | null;
}

export function LogSheet({ open, onClose, initialMode = "log", prefill = null }: Props) {
  const { logExpense, addToVault, data } = useApp();
  const [mode, setMode] = useState<"log" | "vault">(initialMode);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [justification, setJustification] = useState("");
  const [currency, setCurrency] = useState<"VND" | "USD">("VND");
  // vault
  const [itemName, setItemName] = useState("");
  const [delayHours, setDelayHours] = useState(24);
  // amortization (Consumption Lifespan): 1 = today only
  const [amortizeDays, setAmortizeDays] = useState<number>(1);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setCategory("");
      setJustification("");
      setCurrency("VND");
      setItemName("");
      setDelayHours(24);
      setMode(initialMode);
      setCatOpen(false);
      setAmortizeDays(1);
    }
  }, [open, initialMode]);

  // Apply receipt-scan values when the sheet opens with a prefill.
  useEffect(() => {
    if (open && prefill) {
      setMode("log");
      setAmount(prefill.amountVND > 0 ? String(prefill.amountVND) : "");
      setCategory(prefill.category ?? "");
      setJustification(prefill.justification ?? "");
      setCurrency("VND");
    }
  }, [open, prefill]);

  const targetHabit = data.userState?.targetHabit ?? "";
  const habitLower = targetHabit.toLowerCase().trim();
  const isHabitCategory = !!habitLower && category.toLowerCase().trim() === habitLower;
  const isDiscretionarySelected = !!category && !isEssentialCategory(category) && !isHabitCategory;

  const discretionaryWithHabit = useMemo(
    () => Array.from(new Set([...DISCRETIONARY_CATEGORIES, ...(targetHabit ? [targetHabit] : [])])),
    [targetHabit]
  );

  useEffect(() => {
    if (!isDiscretionarySelected && amortizeDays !== 1) setAmortizeDays(1);
  }, [isDiscretionarySelected, amortizeDays]);

  const showCurrency = category === "Travelling" || category === "Visa and documents fees";
  const rate = data.userState?.usdExchangeRate ?? 26310;
  const cur = data.userState?.displayCurrency ?? "VND";

  const amountVND = useMemo(() => {
    const n = Number(amount);
    if (!n) return 0;
    return showCurrency && currency === "USD" ? Math.round(n * rate) : Math.floor(n);
  }, [amount, currency, showCurrency, rate]);

  // vi-VN grouping (dots) to match fmtVND / useCurrencyInput everywhere else.
  const formattedAmount = amount ? new Intl.NumberFormat("vi-VN").format(Number(amount)) : "";
  const amountBadge = !showCurrency || currency === "VND" ? humanAmountBadge(amountVND) : null;

  const justificationLen = justification.trim().length;
  const canLog = amountVND > 0 && !!category && justificationLen >= 5;
  const canVault = itemName.trim().length > 0 && amountVND > 0 && !!category && justificationLen >= 5;

  // First unmet requirement — surfaced next to the disabled submit button so
  // users are never stuck guessing why they can't continue.
  const blocker = (() => {
    if (mode === "vault" && itemName.trim().length === 0) return "Name the item";
    if (amountVND <= 0) return "Enter an amount";
    if (!category) return "Pick a category";
    if (justificationLen < 5)
      return `Justification needs ${5 - justificationLen} more character${5 - justificationLen === 1 ? "" : "s"}`;
    return null;
  })();

  const dialogRef = useDialogA11y(open, onClose);

  if (!open) return null;

  const buildLogInput = (force = false) => ({
    amountVND,
    originalAmount: showCurrency && currency === "USD" ? Number(amount) : undefined,
    originalCurrency: showCurrency ? currency : ("VND" as const),
    category,
    justification: justification.trim(),
    amortizationDays: isDiscretionarySelected && amortizeDays > 1 ? amortizeDays : undefined,
    force,
  });

  const submitLog = () => {
    if (!canLog) return;
    const result = logExpense(buildLogInput());
    if (result === "duplicate") {
      // Same category + amount within the same minute. Keep the sheet open and
      // let the user decide — never drop a legitimate expense silently.
      toast.warning("Possible duplicate: this amount & category was just logged.", {
        duration: 8000,
        action: {
          label: "Log anyway",
          onClick: () => {
            logExpense(buildLogInput(true));
            onClose();
          },
        },
      });
      return;
    }
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "log" ? "Log expense" : "Add to vault"}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t-2 border-emerald-400/40 bg-slate-900/95 backdrop-blur-2xl p-5 shadow-[0_-10px_60px_rgba(0,255,135,0.15)] outline-none"
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
          <button onClick={onClose} aria-label="Close log sheet" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "vault" && (
          <div className="mb-4">
            <label htmlFor="ls-item-name" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Item Name
            </label>
            <input
              id="ls-item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="New jacket..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="ls-amount" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Amount {showCurrency && `(${currency})`}
          </label>
          <div className="relative">
            <input
              id="ls-amount"
              inputMode="numeric"
              value={formattedAmount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 text-right font-mono text-3xl font-bold text-emerald-400 outline-none focus:border-emerald-400"
            />
            {amountBadge && (
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none rounded border border-cyan-700/50 bg-cyan-950/70 px-2 py-0.5 text-[10px] font-black text-cyan-300"
                style={{ boxShadow: "0 0 8px rgba(34,211,238,0.2)" }}
              >
                {amountBadge}
              </span>
            )}
          </div>
          {showCurrency && currency === "USD" && amountVND > 0 && (
            <p className="mt-1 text-right font-mono text-xs text-slate-500">≈ {fmtVND(amountVND)}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Category
          </label>
          <button
            type="button"
            onClick={() => setCatOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white outline-none transition-all hover:border-emerald-400/50 focus:border-emerald-400"
          >
            <span className="flex items-center gap-2">
              {category ? (
                <CatIcon
                  name={category}
                  isHabit={isHabitCategory}
                  className={`h-4 w-4 ${
                    isEssentialCategory(category)
                      ? "text-cyan-400"
                      : isHabitCategory
                        ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        : "text-emerald-400"
                  }`}
                />
              ) : null}
              <span className={category ? "text-white" : "text-slate-500"}>
                {category || "Select category..."}
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${catOpen ? "rotate-180" : ""}`} />
          </button>

          {catOpen && (
            <div className="mt-2 max-h-60 overflow-y-auto overscroll-contain rounded-lg border border-slate-700 bg-slate-950 shadow-[0_10px_40px_-10px_rgba(0,255,135,0.15)] animate-fade-in [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
                Essentials
              </div>
              {ESSENTIAL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCategory(c); setCatOpen(false); }}
                  className="flex w-full items-center justify-between border-t border-slate-800/60 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-cyan-400/10"
                >
                  <span className="flex items-center gap-2 text-cyan-400">
                    <CatIcon name={c} className="h-4 w-4" />
                    <span className="text-slate-200">{c}</span>
                  </span>
                  {category === c && <Check className="h-4 w-4 text-cyan-400" />}
                </button>
              ))}
              <div className="border-t border-slate-800 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/70">
                Discretionary
              </div>
              {discretionaryWithHabit.map((c) => {
                const isHabit = !!habitLower && c.toLowerCase().trim() === habitLower;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCategory(c); setCatOpen(false); }}
                    className="flex w-full items-center justify-between border-t border-slate-800/60 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-emerald-400/10"
                  >
                    <span className={`flex items-center gap-2 ${isHabit ? "text-rose-500" : "text-emerald-400"}`}>
                      <CatIcon name={c} isHabit={isHabit} className="h-4 w-4" />
                      <span className="text-slate-200">{c}{isHabit && " 🎯"}</span>
                    </span>
                    {category === c && <Check className={`h-4 w-4 ${isHabit ? "text-rose-500" : "text-emerald-400"}`} />}
                  </button>
                );
              })}
            </div>
          )}
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
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { label: "1h", hours: 1 },
                { label: "12h", hours: 12 },
                { label: "24h", hours: 24 },
                { label: "48h", hours: 48 },
                { label: "3 days", hours: 72 },
                { label: "5 days", hours: 120 },
                { label: "7 days", hours: 168 },
                { label: "14 days", hours: 336 },
                { label: "30 days", hours: 720 },
              ].map(({ label, hours }) => (
                <button
                  key={hours}
                  onClick={() => setDelayHours(hours)}
                  className={`rounded-lg border font-mono text-xs sm:text-sm py-2 px-1 whitespace-nowrap text-center transition-all ${
                    delayHours === hours
                      ? "text-cyan-400 border-cyan-400/50 bg-cyan-950/30"
                      : "text-slate-400 border-slate-700/50 bg-slate-950"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="ls-justification" className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Justification (min 5 chars)
            </label>
            <span
              className={`font-mono text-[10px] tabular-nums ${justificationLen >= 5 ? "text-emerald-400" : "text-slate-500"}`}
              aria-hidden
            >
              {justificationLen}/5
            </span>
          </div>
          <textarea
            id="ls-justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Why are you making this purchase?"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
          />
        </div>

        {mode === "log" && isDiscretionarySelected && (
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Consumption Lifespan
              </p>
              <p className="font-mono text-[10px] text-cyan-400">
                {amountVND > 0
                  ? `Impact: ${fmtMoney(amountVND / amortizeDays, cur, rate)} / Day`
                  : "Enter amount above"}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {[1, 3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setAmortizeDays(days)}
                  className={`py-2 rounded-lg font-mono text-[10px] font-bold transition-all duration-150 ${
                    amortizeDays === days
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                      : "bg-transparent border border-transparent text-slate-500 hover:text-slate-300 active:text-slate-100"
                  }`}
                >
                  {days === 1 ? "TODAY" : `${days}D`}
                </button>
              ))}
            </div>
            {amortizeDays > 1 && amountVND > 0 && (
              <p className="mt-2 text-[10px] italic text-slate-500 text-center leading-relaxed">
                Bulk protection active. Only{" "}
                <span className="text-cyan-500/80">
                  {fmtMoney(amountVND / amortizeDays, cur, rate)}/day
                </span>{" "}
                will count against your daily limit for {amortizeDays} days.
              </p>
            )}
          </div>
        )}

        {blocker && (
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-slate-500" role="status">
            → {blocker}
          </p>
        )}
        <button
          onClick={mode === "log" ? submitLog : submitVault}
          disabled={mode === "log" ? !canLog : !canVault}
          style={{
            boxShadow:
              mode === "log"
                ? canLog
                  ? "0 0 20px rgba(0,255,135,0.25)"
                  : undefined
                : canVault
                  ? "0 0 20px rgba(0,212,255,0.2)"
                  : undefined,
          }}
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
