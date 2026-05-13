import { useRef, useState } from "react";
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

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const app = useApp();
  const us = app.data.userState;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
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
  }: {
    label: string;
    value: any;
    onChange: (e: any) => void;
    type?: string;
    helper?: string;
    Icon?: React.ElementType;
    extraInputClass?: string;
  }) => (
    <div className="mb-4">
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-300">
        {label}
      </label>
      <div className="relative w-full">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 ${Icon ? "pl-10" : ""} ${extraInputClass} text-[#f1f5f9] font-mono text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-slate-600`}
        />
      </div>
      {helper && <p className="text-xs text-slate-400 mt-1">{helper}</p>}
    </div>
  );

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
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Configuration
          </p>
          <h1 className="text-2xl font-bold text-white">Control Panel</h1>
        </header>

        <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <ShieldCheck className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
              Your Data is 100% Private
            </span>
            <span className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
              SplurgeGuard operates completely offline on your device. Your financial data,
              justifications, and habits never leave this phone. We cannot access it, and neither
              can anyone else.
            </span>
          </div>
        </div>

        <section className={sectionClass}>
          <h2 className={headerClass}>
            <User className="h-4 w-4" /> Identity
          </h2>
          <Field
            label="Master Name / Alias"
            value={us.userName ?? ""}
            onChange={(e) => app.updateUserState({ userName: e.target.value })}
            helper="How the app addresses you across the dashboard."
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
              <p className="font-semibold text-amber-200">Cycle income was estimated from legacy data</p>
              <p className="mt-2 text-xs text-amber-100/85 leading-relaxed">
                Please verify &quot;Cycle total income&quot; matches your real take-home. Editing that field clears
                this notice.
              </p>
            </div>
          )}
          <Field
            label="Cycle total income (VND)"
            type="number"
            value={us.total_income_cents}
            onChange={(e) =>
              app.updateUserState({
                total_income_cents: Math.floor(Number(e.target.value) || 0),
                pyfIncomeInferred: false,
              })
            }
            helper="Gross take-home allocated to this budget cycle (used for PYF math)."
            Icon={Wallet}
          />
          <Field
            label="Fixed overhead this cycle (VND)"
            type="number"
            value={us.fixed_overhead_cents ?? 0}
            onChange={(e) =>
              app.updateUserState({ fixed_overhead_cents: Math.floor(Number(e.target.value) || 0) })
            }
            helper="Rent, subscriptions, and other non-negotiables subtracted before flexible pool."
            Icon={Wallet}
          />
          <Field
            label="Available Splurge Budget (VND)"
            type="number"
            value={us.currentBalanceVND}
            onChange={(e) =>
              app.updateUserState({ currentBalanceVND: Math.floor(Number(e.target.value) || 0) })
            }
            helper="The money left for non-essentials until your next payday."
            Icon={Wallet}
          />
          <Field
            label="Next Payday / Cycle Reset"
            type="date"
            value={paydayInputValue}
            onChange={(e) =>
              app.updateUserState({
                paydayDate: paydayInputToIsoEndOfLocalDay(e.target.value),
              })
            }
            helper="When your splurge budget refills and the cycle starts over."
            Icon={Calendar}
            extraInputClass="pr-10"
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start a new cycle? PYF savings counters reset; flexible pool refills to income minus overhead.")) {
                app.startNewCycle();
              }
            }}
            className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/60 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/10 transition-colors mb-2"
          >
            Start new budget cycle
          </button>
          <Field
            label="Target Habit Name"
            value={us.targetHabit ?? ""}
            onChange={(e) => app.updateUserState({ targetHabit: e.target.value })}
            helper="The habit you want to control. Renaming this will update past transactions to keep history consistent."
            Icon={TargetIcon}
          />
          <Field
            label="Weekly Habit Limit (VND)"
            type="number"
            value={us.weeklyHabitLimitVND}
            onChange={(e) =>
              app.updateUserState({ weeklyHabitLimitVND: Math.floor(Number(e.target.value) || 0) })
            }
            helper="Target maximum spend on this habit per week to earn your 250 DP weekly bonus."
            Icon={TargetIcon}
          />
          <Field
            label="Custom USD Exchange Rate"
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
      </div>
    </div>
  );
}
