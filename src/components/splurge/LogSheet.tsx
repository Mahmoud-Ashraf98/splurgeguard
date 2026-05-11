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
import { useApp } from "@/context/AppContext";
import {
  DISCRETIONARY_CATEGORIES,
  ESSENTIAL_CATEGORIES,
  isEssentialCategory,
} from "@/lib/splurge-types";
import { fmtVND, fmtMoney } from "@/lib/splurge-utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LogSheet({ open, onClose }: Props) {
  const { logExpense, addToVault, data } = useApp();
  const [mode, setMode] = useState<"log" | "vault">("log");
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
      setMode("log");
      setCatOpen(false);
      setAmortizeDays(1);
    }
  }, [open]);

  const targetHabit = data.userState?.targetHabit ?? "";
  const habitLower = targetHabit.toLowerCase().trim();
  const isHabitCategory = !!habitLower && category.toLowerCase().trim() === habitLower;
  const isDiscretionarySelected = !!category && !isEssentialCategory(category) && !isHabitCategory;

  const discretionaryWithHabit = useMemo(
    () => Array.from(new Set([...DISCRETIONARY_CATEGORIES, ...(targetHabit ? [targetHabit] : [])])),
    [targetHabit]
  );

  useEffect(() => {
    if (!isDiscretionarySelected && amortize) setAmortize(false);
  }, [isDiscretionarySelected, amortize]);

  const showCurrency = category === "Travelling" || category === "Visa and documents fees";
  const rate = data.userState?.usdExchangeRate ?? 26310;

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
    const parsedAmort = amortize && isDiscretionarySelected ? Math.max(2, parseInt(amortDays, 10) || 2) : undefined;
    logExpense({
      amountVND,
      originalAmount: showCurrency && currency === "USD" ? Number(amount) : undefined,
      originalCurrency: showCurrency ? currency : "VND",
      category,
      justification: justification.trim(),
      amortizationDays: parsedAmort,
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
              <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-400/70">
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
              <div className="border-t border-slate-800 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/70">
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

        {mode === "log" && isDiscretionarySelected && (
          <div className="mb-5 rounded-xl border border-slate-700/60 bg-slate-950/50 p-4">
            <button
              type="button"
              onClick={() => setAmortize((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <div className="text-left">
                <p className="font-mono text-[11px] uppercase tracking-widest text-cyan-400">
                  Spread Cost Over Time
                </p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  Subscriptions / Bulk
                </p>
              </div>
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                  amortize ? "bg-cyan-400 shadow-[0_0_15px_-3px_#00d4ff]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition-transform ${
                    amortize ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
            {amortize && (
              <div className="mt-3">
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Duration in Days
                </label>
                <input
                  type="number"
                  min={2}
                  inputMode="numeric"
                  value={amortDays}
                  onChange={(e) => setAmortDays(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-lg border border-cyan-400/40 bg-slate-950 px-4 py-2.5 text-right font-mono text-lg tabular-nums text-cyan-400 outline-none focus:border-cyan-400"
                />
                {amountVND > 0 && parseInt(amortDays || "0", 10) >= 2 && (
                  <p className="mt-1.5 text-right font-mono text-[10px] tracking-widest text-slate-500">
                    ≈ {fmtVND(Math.floor(amountVND / parseInt(amortDays, 10)))} / day
                  </p>
                )}
              </div>
            )}
          </div>
        )}

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
