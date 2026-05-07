import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, Trash2, User, Sliders, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { STORAGE_KEY } from "@/lib/splurge-types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const app = useApp();
  const us = app.data.userState;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

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
  }: {
    label: string;
    value: any;
    onChange: (e: any) => void;
    type?: string;
    helper?: string;
  }) => (
    <div className="mb-4">
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[#f1f5f9] font-mono text-sm transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 hover:border-slate-600"
      />
      {helper && <p className="text-xs text-slate-400 mt-1">{helper}</p>}
    </div>
  );

  const sectionClass =
    "bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 mb-6 shadow-lg";
  const headerClass =
    "flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cyan-500 mb-4 pb-2 border-b border-slate-700/50";

  const paydayInputValue = us.paydayDate.split("T")[0];

  return (
    <div className="px-5 pb-24 pt-6">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Configuration
        </p>
        <h1 className="text-2xl font-bold text-white">Control Panel</h1>
      </header>

      <section className={sectionClass}>
        <h2 className={headerClass}>
          <User className="h-4 w-4" /> Identity
        </h2>
        <Field
          label="Your Name / Alias"
          value={us.userName ?? ""}
          onChange={(e) => app.updateUserState({ userName: e.target.value })}
          helper="How the app addresses you across the dashboard."
        />
      </section>

      <section className={sectionClass}>
        <h2 className={headerClass}>
          <Sliders className="h-4 w-4" /> Budget & Limits
        </h2>
        <Field
          label="Available Splurge Budget (VND)"
          type="number"
          value={us.currentBalanceVND}
          onChange={(e) =>
            app.updateUserState({ currentBalanceVND: Math.floor(Number(e.target.value) || 0) })
          }
          helper="The money left for non-essentials until your next payday."
        />
        <Field
          label="Next Payday / Cycle Reset"
          type="date"
          value={paydayInputValue}
          onChange={(e) =>
            app.updateUserState({ paydayDate: new Date(e.target.value + "T23:59:59").toISOString() })
          }
          helper="When your splurge budget refills and the cycle starts over."
        />
        <Field
          label="Weekly Weed Protocol Limit (VND)"
          type="number"
          value={us.weeklyWeedLimitVND}
          onChange={(e) =>
            app.updateUserState({ weeklyWeedLimitVND: Math.floor(Number(e.target.value) || 0) })
          }
          helper="Target maximum spend for this category to earn your 250 DP weekly bonus."
        />
        <Field
          label="Custom USD Exchange Rate"
          type="number"
          value={us.usdExchangeRate}
          onChange={(e) =>
            app.updateUserState({ usdExchangeRate: Math.floor(Number(e.target.value) || 1) })
          }
          helper="Used when toggling the dashboard between VND and USD."
        />
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

      <section className="bg-rose-950/10 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-5 mb-6 shadow-lg">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-rose-400 mb-4 pb-2 border-b border-rose-500/30">
          <Trash2 className="h-4 w-4" /> Danger Zone
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Warning: This will permanently wipe all transactions, points, and settings from this device.
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
  );
}
