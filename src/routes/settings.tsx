import { useRef, useState, type ChangeEvent, type ElementType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HoldSecureButton } from "@/components/splurge/HoldSecureButton";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";
import {
  Download,
  Upload,
  Trash2,
  User,
  Sliders,
  ShieldCheck,
  Calendar,
  Target as TargetIcon,
  DollarSign,
  Gamepad2,
  PenTool,
  Target,
  Flame,
  AlertTriangle,
  Lock,
  Bell,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { STORAGE_KEY } from "@/lib/splurge-types";
import { fmtMoney } from "@/lib/splurge-utils";
import { paydayInputToIsoEndOfLocalDay } from "@/lib/dateUtils";

type NotifPermissionState = NotificationPermission | "unsupported";

const DP_FAQ = [
  { q: "How do I earn DP for logging splurges?", a: "Logging any splurge earns +1 to +5 Discipline Points." },
  { q: "What happens if I stay under my Daily Limit?", a: "You earn +50 DP each day you stay under your Smart Daily Limit." },
  { q: "Are there bonuses for streaks?", a: "Yes — hitting 3, 7, and 14 day streaks unlocks bonus Discipline Points." },
  { q: "What happens if I exceed my Daily Limit?", a: "You lose 25 DP and your current streak resets to zero." },
  { q: "Can I earn DP from the Vault?", a: "Yes — delaying purchases through the cooling-off Vault earns DP while you wait." },
];

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SplurgeGuard" },
      { name: "description", content: "Configure your identity, budget cycle, target habit, notifications, and back up your data." },
      { property: "og:title", content: "Settings — Tune your discipline system" },
      { property: "og:description", content: "Cycle, limits, notifications, backup/restore, and the rules of Discipline Points." },
      { property: "og:url", content: "https://splurgeguard.lovable.app/settings" },
    ],
    links: [{ rel: "canonical", href: "https://splurgeguard.lovable.app/settings" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: DP_FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: SettingsPage,
});

// ─── MODULE-LEVEL — outside SettingsPage ─────────────────────────────────
interface CurrencyFieldProps {
  label: string;
  value: number;
  onCommit: (n: number) => void;
  helper?: string;
  ticker?: string;
}

function CurrencyField({ label, value, onCommit, helper, ticker = "VND" }: CurrencyFieldProps) {
  const id = `cf-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const { displayValue, humanBadge, handleFocus, handleChange, handleBlur } = useCurrencyInput(
    value,
    onCommit,
  );

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-300"
      >
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 pl-4 pr-[108px] text-[#f1f5f9] font-mono text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-slate-600"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
          {humanBadge && (
            <span
              className="px-2 py-0.5 bg-cyan-950/70 text-cyan-300 text-[10px] font-black rounded border border-cyan-700/50"
              style={{ boxShadow: "0 0 8px rgba(34,211,238,0.2)" }}
            >
              {humanBadge}
            </span>
          )}
          <span className="px-2.5 py-1 bg-slate-800/80 text-slate-400 text-[9px] font-bold uppercase rounded-md tracking-widest border border-slate-700/60">
            {ticker}
          </span>
        </div>
      </div>
      {helper && (
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{helper}</p>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────

/** Returns human-readable days-until string for the payday badge. */
function daysUntilLabel(isoDate: string): { days: number; label: string; urgent: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
  if (diff <= 0) return { days: 0, label: "Today", urgent: true };
  if (diff === 1) return { days: 1, label: "Tomorrow", urgent: true };
  return { days: diff, label: `${diff} days`, urgent: diff <= 5 };
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  helper,
  Icon,
  extraInputClass = "",
  fieldId,
}: {
  label: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  helper?: string;
  Icon?: ElementType;
  extraInputClass?: string;
  fieldId?: string;
}) {
  const id =
    fieldId ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-300">
        {label}
      </label>
      <div className="relative w-full">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 ${
            Icon ? "pl-10" : ""
          } ${extraInputClass} text-[#f1f5f9] font-mono text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-slate-600`}
        />
      </div>
      {helper && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{helper}</p>}
    </div>
  );
}

function SettingsPage() {
  const app = useApp();
  const us = app.data.userState;
  const fileRef = useRef<HTMLInputElement>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotifPermissionState>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  if (!us) return <div className="p-6 text-slate-400">Set up the app first.</div>;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(app.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${STORAGE_KEY}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => app.importData(String(r.result || ""));
    r.readAsText(f);
  };

  const sectionClass =
    "bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 mb-6 shadow-lg";
  const headerClass =
    "flex items-center gap-2 text-xs font-black tracking-[0.25em] uppercase mb-4 pb-2 border-b border-slate-800/80";

  const paydayInputValue = us.paydayDate.split("T")[0];

  const dpRules: { Icon: ElementType; color: string; text: string }[] = [
    { Icon: PenTool, color: "text-cyan-400", text: "Log any splurge: +1 to +5 DP" },
    { Icon: Target, color: "text-emerald-400", text: "Stay under Daily Limit: +50 DP" },
    { Icon: Flame, color: "text-amber-400", text: "Hit 3, 7, 14 day streaks for bonuses" },
    { Icon: AlertTriangle, color: "text-rose-500", text: "Exceed Daily Limit: -25 DP & Streak Resets" },
    { Icon: Lock, color: "text-cyan-400", text: "Delay via Vault: Earn DP while waiting" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0e1a] to-[#0a0e1a]">
      <div className="px-5 pb-24 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Your Settings</h1>
        </header>

        <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <ShieldCheck className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
              Your Data is 100% Private
            </span>
            <span className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
              Everything stays on your device. Your data never touches a server — not ours, not
              anyone&apos;s.
            </span>
          </div>
        </div>

        <section className={sectionClass + " scroll-mt-4"}>
          <h2 className={headerClass}>
            <User
              className="h-4 w-4 text-cyan-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
              Identity
            </span>
          </h2>
          <Field
            fieldId="f-master-name-alias"
            label="Display Name"
            value={us.userName ?? ""}
            onChange={(e) => app.updateUserState({ userName: e.target.value })}
            helper="We'll use this to greet you throughout the app"
            Icon={User}
          />
        </section>

        <section className={sectionClass + " scroll-mt-4"}>
          <h2 className={headerClass}>
            <Sliders
              className="h-4 w-4 text-cyan-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
              Budget & Limits
            </span>
          </h2>
          {us.pyfIncomeInferred && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
            >
              <p className="font-semibold text-amber-200">We carried over your income from last cycle — please confirm it&apos;s still accurate</p>
              <p className="mt-2 text-xs text-amber-100/85 leading-relaxed">
                Please verify &quot;Monthly Income (VND)&quot; matches your real take-home. Editing that field clears
                this notice.
              </p>
            </div>
          )}
          {/* ── MONTHLY INCOME ── */}
          <CurrencyField
            label="Monthly Income (VND)"
            value={us.total_income_cents}
            onCommit={(n) =>
              app.updateUserState({ total_income_cents: n, pyfIncomeInferred: false })
            }
            helper="Your take-home pay for this month."
            ticker={us.displayCurrency}
          />

          {/* ── NEEDS & BILLS ── */}
          <CurrencyField
            label="Needs & Bills (VND)"
            value={us.fixed_overhead_cents ?? 0}
            onCommit={(n) => app.updateUserState({ fixed_overhead_cents: n })}
            helper="Rent, groceries, utilities, transport — everything you need to stay alive and comfortable."
            ticker={us.displayCurrency}
          />

          {/* ── WEALTH SHIELD (Savings) ── */}
          <CurrencyField
            label="Wealth Shield — Savings Target (VND)"
            value={us.savings_base_cents}
            onCommit={(n) => app.updateUserState({ savings_base_cents: n })}
            helper="Pay yourself first. This gets locked away before your fun money is calculated."
            ticker={us.displayCurrency}
          />

          {/* ── LIVE BUDGET MATH PANEL ── */}
          {(() => {
            const income = us.total_income_cents ?? 0;
            const bills = us.fixed_overhead_cents ?? 0;
            const shield = us.savings_base_cents ?? 0;
            const pool = income - bills - shield;
            const isRed = pool < 0;

            const end = new Date(us.paydayDate);
            end.setHours(0, 0, 0, 0);
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const daysLeft = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
            const dailySlice = pool > 0 ? Math.floor(pool / daysLeft) : 0;

            const Row = ({
              label,
              value,
              sign,
              color,
              bold,
            }: {
              label: string;
              value: number;
              sign?: "+" | "−" | "=";
              color?: string;
              bold?: boolean;
            }) => (
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  {sign && (
                    <span
                      className={`font-mono text-base w-4 text-center flex-shrink-0 ${color ?? "text-slate-500"}`}
                    >
                      {sign}
                    </span>
                  )}
                  {!sign && <span className="w-4 flex-shrink-0" />}
                  <span
                    className={`font-mono text-[11px] uppercase tracking-widest ${bold ? "text-slate-200 font-bold" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
                <span
                  className={`font-mono tabular-nums ${bold ? "text-lg font-black" : "text-sm"} ${color ?? "text-slate-300"}`}
                  style={
                    bold && !isRed
                      ? { textShadow: "0 0 12px rgba(52,211,153,0.55)" }
                      : bold && isRed
                        ? { textShadow: "0 0 12px rgba(251,113,133,0.55)" }
                        : undefined
                  }
                >
                  {fmtMoney(Math.abs(value), us.displayCurrency, us.usdExchangeRate)}
                </span>
              </div>
            );

            return (
              <div
                className={`mb-5 rounded-2xl border overflow-hidden transition-colors duration-300 backdrop-blur-md ${
                  isRed
                    ? "border-rose-500/40 bg-rose-950/15 shadow-[0_0_20px_rgba(244,63,94,0.08)]"
                    : "border-cyan-500/20 bg-slate-950/80 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                }`}
              >
                <div
                  className={`px-4 py-3 border-b flex items-center gap-2 ${
                    isRed ? "border-rose-500/20 bg-rose-950/20" : "border-cyan-500/10 bg-slate-900/60"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isRed ? "bg-rose-400" : "bg-cyan-400"
                    }`}
                    style={{
                      boxShadow: isRed
                        ? "0 0 6px rgba(251,113,133,0.8)"
                        : "0 0 6px rgba(34,211,238,0.8)",
                    }}
                  />
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-slate-500">
                    Live Budget Breakdown
                  </p>
                </div>

                {/* Math rows */}
                <div className="px-4 py-3">
                  <Row label="Monthly Income" value={income} sign="+" color="text-emerald-400" />
                  <Row label="Needs & Bills" value={bills} sign="−" color="text-amber-400/80" />
                  <Row label="Wealth Shield" value={shield} sign="−" color="text-cyan-400/80" />
                  <div className="border-t border-dashed border-slate-700/60 my-2" />
                  <Row
                    label="Guilt-Free Allowance"
                    value={Math.max(0, pool)}
                    sign="="
                    color={isRed ? "text-rose-400" : "text-emerald-300"}
                    bold
                  />
                </div>

                {/* Result footer */}
                {!isRed && dailySlice > 0 && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between rounded-xl border border-cyan-800/30 bg-cyan-950/30 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1 h-4 rounded-full bg-emerald-400"
                          style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }}
                        />
                        <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-slate-500">
                          Daily Allowance
                        </span>
                        <span className="font-mono text-[9px] text-slate-600">
                          ({daysLeft}d left)
                        </span>
                      </div>
                      <span
                        className="font-mono text-sm font-black tabular-nums text-emerald-300"
                        style={{ textShadow: "0 0 10px rgba(52,211,153,0.5)" }}
                      >
                        {fmtMoney(dailySlice, us.displayCurrency, us.usdExchangeRate)}/day
                      </span>
                    </div>
                  </div>
                )}

                {/* Red state warning */}
                {isRed && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl bg-rose-950/30 border border-rose-500/30 px-3 py-2.5 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-rose-300 font-bold">
                        ⚠️ You&apos;re in the red
                      </p>
                      <p className="text-xs text-rose-400/80 mt-1">
                        Lower your savings target or reduce bills to unlock your fun budget.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <CurrencyField
            label="Live Fun Money Balance (VND)"
            value={us.currentBalanceVND}
            onCommit={(n) => app.updateUserState({ currentBalanceVND: n })}
            helper="What you actually have left to spend right now — shrinks every time you log an expense."
            ticker={us.displayCurrency}
          />
          {/* ── NEXT PAYDAY / CYCLE RESET ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="f-next-payday-cycle-reset"
                className="font-mono text-[10px] uppercase tracking-wider text-slate-300"
              >
                Next Payday / Cycle Reset
              </label>
              {(() => {
                const { label, urgent } = daysUntilLabel(us.paydayDate);
                return (
                  <span
                    className={`font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      urgent
                        ? "text-amber-300 bg-amber-900/30 border-amber-600/40"
                        : "text-cyan-400 bg-cyan-900/20 border-cyan-700/30"
                    }`}
                  >
                    {label}
                  </span>
                );
              })()}
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                id="f-next-payday-cycle-reset"
                type="date"
                value={paydayInputValue}
                onChange={(e) =>
                  app.updateUserState({
                    paydayDate: paydayInputToIsoEndOfLocalDay(e.target.value),
                  })
                }
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 pl-10 pr-4 text-[#f1f5f9] font-mono text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-slate-600"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Your fun budget refreshes on this date and the cycle starts over.
            </p>
          </div>
          <Field
            fieldId="f-target-habit-name"
            label="Target Habit Name"
            value={us.targetHabit ?? ""}
            onChange={(e) => app.updateUserState({ targetHabit: e.target.value })}
            helper="The habit you want to control. Renaming this will update past transactions to keep history consistent."
            Icon={TargetIcon}
          />
          <CurrencyField
            label="Weekly Habit Cap (VND)"
            value={us.weeklyHabitLimitVND}
            onCommit={(n) => app.updateUserState({ weeklyHabitLimitVND: n })}
            helper="Stay under this each week to earn your +250 DP Monday bonus."
            ticker={us.displayCurrency}
          />
          <Field
            fieldId="f-custom-usd-exchange-rate"
            label="Custom USD Exchange Rate"
            type="number"
            value={us.usdExchangeRate}
            onChange={(e) =>
              app.updateUserState({ usdExchangeRate: Math.max(1, Math.floor(Number(e.target.value) || 0)) })
            }
            helper="Used when toggling the dashboard between VND and USD."
            Icon={DollarSign}
          />
        </section>

        <section className={sectionClass + " scroll-mt-4"}>
          <h2 className="flex items-center mb-2 pb-2 border-b border-slate-700/50">
            <Gamepad2 className="w-5 h-5 inline-block mr-2 text-cyan-500" />
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-500">
              How Discipline Points (DP) Work
            </span>
          </h2>
          <div className="mt-4 space-y-2">
            {dpRules.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3"
              >
                <div
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border ${
                    r.color === "text-rose-500"
                      ? "bg-rose-500/10 border-rose-500/20"
                      : r.color === "text-amber-400"
                        ? "bg-amber-400/10 border-amber-400/20"
                        : "bg-cyan-500/10 border-cyan-500/20"
                  }`}
                >
                  <r.Icon className={`w-4 h-4 ${r.color}`} />
                </div>
                <span className="text-xs text-slate-300 leading-snug flex-1">{r.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass + " scroll-mt-4"}>
          <h2 className={headerClass}>
            <Bell
              className="h-4 w-4 text-cyan-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
              Notifications
            </span>
          </h2>
          {notifPermission === "unsupported" ? (
            <p className="text-xs text-slate-400">
              Notifications are not supported in this browser.
            </p>
          ) : notifPermission === "granted" ? (
            <p className="text-xs text-emerald-400">
              ✓ Notifications enabled. The grind will remind you.
            </p>
          ) : notifPermission === "denied" ? (
            <p className="text-xs text-rose-400">
              Notifications blocked. Enable them in your browser settings to receive reminders.
            </p>
          ) : (
            <button
              onClick={async () => {
                const { requestNotificationPermission } = await import("@/lib/notifications");
                const granted = await requestNotificationPermission();
                setNotifPermission(granted ? "granted" : "denied");
              }}
              className="w-full rounded-xl bg-cyan-400/10 border border-cyan-400/20 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-400/20 transition-all touch-none select-none"
            >
              Enable Reminders
            </button>
          )}
        </section>

        <section className={sectionClass + " scroll-mt-4"}>
          <h2 className={headerClass}>
            <ShieldCheck
              className="h-4 w-4 text-cyan-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
              Backup & Security
            </span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Your data lives only on this device. Save a backup file you can restore later.
          </p>
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 transition-all hover:bg-cyan-900/40 hover:border-cyan-400 mb-2 font-mono text-xs uppercase tracking-wider"
          >
            <Download className="h-4 w-4" /> Download Backup File
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 transition-all hover:bg-cyan-900/40 hover:border-cyan-400 font-mono text-xs uppercase tracking-wider"
          >
            <Upload className="h-4 w-4" /> Restore from Backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])}
          />
        </section>

        <hr className="border-slate-800 my-8" />

        <section className="bg-rose-950/10 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-5 mb-6 shadow-lg scroll-mt-4">
          <h2 className="flex items-center gap-2 text-xs font-black tracking-[0.25em] uppercase mb-4 pb-2 border-b border-rose-900/50 text-rose-400">
            <Trash2
              className="h-4 w-4 text-rose-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(251,113,133,0.6))" }}
            />
            Danger Zone
          </h2>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Permanently erases all transactions, discipline points, and settings from this device.
            There is no undo.
          </p>
          <HoldSecureButton
            onSecure={() => {
              app.clearData();
            }}
            durationMs={3000}
            label="Hold 3s to wipe all data"
          />
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-widest text-slate-600">
            Hold for 3 seconds to confirm permanent deletion
          </p>
        </section>

        {/* Cycle Management Section */}
        <div className="mt-8 rounded-xl border border-red-900/40 bg-red-950/20 p-5 space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-red-400">Cycle Management</p>
            <p className="text-sm text-slate-400 mt-1">This will archive your current cycle and start fresh. Your history is preserved.</p>
          </div>

          {!isConfirmingReset ? (
            <button
              type="button"
              onClick={() => setIsConfirmingReset(true)}
              className="w-full rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              Reset & Start New Cycle →
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={async () => {
                  app.startNewCycle();
                  setIsConfirmingReset(false);
                }}
                className="w-full rounded-lg bg-red-900/60 py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-900"
              >
                Tap again to confirm reset
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingReset(false)}
                className="w-full rounded-lg bg-transparent py-2 text-sm text-slate-500 transition-colors hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
