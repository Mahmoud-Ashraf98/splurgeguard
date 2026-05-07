import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, Trash2 } from "lucide-react";
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

  const Field = ({ label, value, onChange, type = "text" }: any) => (
    <div className="mb-3">
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-400"
      />
    </div>
  );

  const paydayInputValue = us.paydayDate.split("T")[0];

  return (
    <div className="px-5 pb-24 pt-6">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Configuration</p>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      <section className="mb-6 rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_50px_-20px_rgba(0,0,0,0.8)]">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-slate-400">Operator</h2>
        <Field
          label="Operator Name"
          value={us.userName ?? ""}
          onChange={(e: any) => app.updateUserState({ userName: e.target.value })}
        />
      </section>

      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-slate-400">Cycle</h2>
        <Field
          label="Current Balance (VND)"
          type="number"
          value={us.currentBalanceVND}
          onChange={(e: any) => app.updateUserState({ currentBalanceVND: Math.floor(Number(e.target.value) || 0) })}
        />
        <Field
          label="Next Payday"
          type="date"
          value={paydayInputValue}
          onChange={(e: any) => app.updateUserState({ paydayDate: new Date(e.target.value + "T23:59:59").toISOString() })}
        />
        <Field
          label="Weekly Weed Limit (VND)"
          type="number"
          value={us.weeklyWeedLimitVND}
          onChange={(e: any) => app.updateUserState({ weeklyWeedLimitVND: Math.floor(Number(e.target.value) || 0) })}
        />
        <Field
          label="USD Exchange Rate"
          type="number"
          value={us.usdExchangeRate}
          onChange={(e: any) => app.updateUserState({ usdExchangeRate: Math.floor(Number(e.target.value) || 1) })}
        />
      </section>

      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-slate-400">Data</h2>
        <button
          onClick={exportData}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/5 py-3 font-mono text-xs uppercase tracking-wider text-emerald-400 hover:bg-emerald-400/10"
        >
          <Download className="h-4 w-4" /> Export JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400/5 py-3 font-mono text-xs uppercase tracking-wider text-cyan-400 hover:bg-cyan-400/10"
        >
          <Upload className="h-4 w-4" /> Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])}
        />
      </section>

      <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-rose-400">Danger Zone</h2>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/50 py-3 font-mono text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" /> Clear All Data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-rose-300">This wipes everything. Sure?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-slate-700 py-2.5 font-mono text-xs uppercase text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => { app.clearData(); setConfirmClear(false); }}
                className="rounded-lg bg-rose-500 py-2.5 font-mono text-xs font-bold uppercase text-white"
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
