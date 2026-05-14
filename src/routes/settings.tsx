import { useRef, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Upload,
  Trash2,
  User,
  Sliders,
  ShieldCheck,
  Wallet,
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

function VndDigitsField({
  label,
  value,
  onValueChange,
  helper,
  Icon,
  fieldId,
}: {
  label: string;
  value: number;
  onValueChange: (n: number) => void;
  helper?: string;
  Icon?: React.ElementType;
  fieldId: string;
}) {
  const [displayValue, setDisplayValue] = useState(() =>
    value > 0 ? new Intl.NumberFormat("vi-VN").format(value) : "",
  );

  useEffect(() => {
    setDisplayValue(value > 0 ? new Intl.NumberFormat("vi-VN").format(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = raw === "" ? 0 : parseInt(raw, 10);
    setDisplayValue(raw === "" ? "" : new Intl.NumberFormat("vi-VN").format(num));
    onValueChange(num);
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={fieldId}
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-300"
      >
        {label}
      </label>
      <div className="relative w-full">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        )}
        <input
          id={fieldId}
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={() =>
            setDisplayValue(value > 0 ? new Intl.NumberFormat("vi-VN").format(value) : "")
          }
          onBlur={() =>
            setDisplayValue(value > 0 ? new Intl.NumberFormat("vi-VN").format(value) : "")
          }
          className={`w-full rounded-lg border border-slate-700 bg-slate-950/50 p-3 font-mono text-sm text-[#f1f5f9] transition-all duration-150 hover:border-slate-600 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)] focus:outline-none focus:ring-1 focus:ring-cyan-500/70 ${Icon ? "pl-10" : ""}`}
        />
      </div>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

function SettingsPage() {
  const app = useApp();
  const us = app.data.userState;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
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

  const Field = ({
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
    value: any;
    onChange: (e: any) => void;
    type?: string;
    helper?: string;
    Icon?: React.ElementType;
    extraInputClass?: string;
    fieldId?: string;
  }) => {
    const id =
      fieldId ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    return (
      <div className="mb-4">
        <label htmlFor={id} className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-300">
          {label}
        </label>
        <div className="relative w-full">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          )}
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className={`w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 ${Icon ? "pl-10" : ""} ${extraInputClass} text-[#f1f5f9] font-mono text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-slate-600`}
          />
        </div>
        {helper && <p className="text-xs text-slate-400 mt-1">{helper}</p>}
      </div>
    );
  };

  const sectionClass =
    "bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 mb-6 shadow-lg";
  const headerClass =
    "flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cyan-500 mb-4 pb-2 border-b border-slate-700/50";

  const paydayInputValue = us.paydayDate.split("T")[0];

  const dpRules: { Icon: React.ElementType; color: string; text: string }[] = [
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

        <section className={sectionClass}>
          <h2 className={headerClass}>
            <User className="h-4 w-4" /> Identity
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

        <section className={sectionClass}>
          <h2 className={headerClass}>
            <Sliders className="h-4 w-4" /> Budget & Limits
          </h2>
          {us.pyfIncomeInferred && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
            >
              <p className="font-semibold text-amber-200">We carried over your income from last cycle — please confirm it&apos;s still accurate</p>
              <p className="mt-2 text-xs text-amber-100/85 leading-relaxed">
                Please verify &quot;Cycle total income&quot; matches your real take-home. Editing that field clears
                this notice.
              </p>
            </div>
          )}
          <VndDigitsField
            fieldId="f-cycle-total-income-vnd"
            label="TAKE-HOME THIS CYCLE (VND)"
            value={us.total_income_cents}
            onValueChange={(num) =>
              app.updateUserState({
                total_income_cents: num,
                pyfIncomeInferred: false,
              })
            }
            helper="Your income for this cycle — used to calculate how much you can spend"
            Icon={Wallet}
          />
          <VndDigitsField
            fieldId="f-fixed-overhead-this-cycle-vnd"
            label="BILLS & FIXED COSTS"
            value={us.fixed_overhead_cents ?? 0}
            onValueChange={(num) => app.updateUserState({ fixed_overhead_cents: num })}
            helper="Regular expenses deducted before your splurge budget is calculated"
            Icon={Wallet}
          />
          <Field
            fieldId="f-available-splurge-budget-vnd"
            label="YOUR SPLURGE BUDGET"
            type="number"
            value={us.currentBalanceVND}
            onChange={(e) =>
              app.updateUserState({ currentBalanceVND: Math.floor(Number(e.target.value) || 0) })
            }
            helper="The money left for non-essentials until your next payday."
            Icon={Wallet}
          />
          <Field
            fieldId="f-next-payday-cycle-reset"
            label="NEXT CYCLE DATE"
            type="date"
            value={paydayInputValue}
            onChange={(e) =>
              app.updateUserState({
                paydayDate: paydayInputToIsoEndOfLocalDay(e.target.value),
              })
            }
            helper="Your budget refreshes on this date"
            Icon={Calendar}
            extraInputClass="pr-10"
          />
          <Field
            fieldId="f-target-habit-name"
            label="HABIT TO TRACK"
            value={us.targetHabit ?? ""}
            onChange={(e) => app.updateUserState({ targetHabit: e.target.value })}
            helper="The habit you want to control. Renaming this will update past transactions to keep history consistent."
            Icon={TargetIcon}
          />
          <Field
            fieldId="f-weekly-habit-limit-vnd"
            label="WEEKLY TARGET"
            type="number"
            value={us.weeklyHabitLimitVND}
            onChange={(e) =>
              app.updateUserState({ weeklyHabitLimitVND: Math.floor(Number(e.target.value) || 0) })
            }
            helper="Stay under this each week to earn your 250 Discipline Points weekly bonus"
            Icon={TargetIcon}
          />
          <Field
            fieldId="f-custom-usd-exchange-rate"
            label="USD EXCHANGE RATE"
            type="number"
            value={us.usdExchangeRate}
            onChange={(e) =>
              app.updateUserState({ usdExchangeRate: Math.floor(Number(e.target.value) || 1) })
            }
            helper="Used when toggling the dashboard between VND and USD."
            Icon={DollarSign}
          />
        </section>

        <section className={sectionClass}>
          <h2 className="flex items-center mb-2 pb-2 border-b border-slate-700/50">
            <Gamepad2 className="w-5 h-5 inline-block mr-2 text-cyan-500" />
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-500">
              How Discipline Points (DP) Work
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {dpRules.map((r, i) => (
              <div
                key={i}
                className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-center gap-3"
              >
                <r.Icon className={`w-5 h-5 shrink-0 ${r.color}`} />
                <span className="text-xs text-slate-300">{r.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headerClass}>
            <Bell className="h-4 w-4" /> Notifications
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

        <section className={sectionClass}>
          <h2 className={headerClass}>
            <ShieldCheck className="h-4 w-4" /> Backup & Security
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

        <section className="bg-rose-950/10 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-5 mb-6 shadow-lg">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-rose-400 mb-4 pb-2 border-b border-rose-500/30">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Warning: This will permanently wipe all transactions, points, and settings from this
            device.
          </p>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-rose-500/50 text-rose-400 bg-rose-950/20 transition-all hover:bg-rose-900/60 hover:border-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] font-mono text-xs uppercase tracking-wider"
            >
              <Trash2 className="h-4 w-4" /> Clear All Data
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-rose-300">This wipes everything. Sure?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg border border-slate-700 py-2.5 font-mono text-xs uppercase text-slate-400 hover:bg-slate-800/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    app.clearData();
                    setConfirmClear(false);
                  }}
                  className="rounded-lg bg-rose-500 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-rose-600 transition-all"
                >
                  Wipe
                </button>
              </div>
            </div>
          )}
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
