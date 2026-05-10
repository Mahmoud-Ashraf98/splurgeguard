import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart3, Lock, Settings as SettingsIcon, ShoppingBag } from "lucide-react";
import { useApp } from "@/context/AppContext";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/stats", label: "Stats", Icon: BarChart3 },
  { to: "/vault", label: "Vault", Icon: Lock },
  { to: "/exchange", label: "Spoils", Icon: ShoppingBag },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomNav() {
  const loc = useLocation();
  const app = useApp();
  if (!app.data.userState) return null;
  const totalDP = app.data.userState.totalDP;
  const hasAffordableReward = app.data.rewards.some(
    (r) => r.status === "active" && r.costDP <= totalDP
  );
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ to, label, Icon }) => {
          const active = loc.pathname === to;
          const showBadge =
            (to === "/vault" && app.data.vaultItems.some((v) => v.status === "ready")) ||
            (to === "/exchange" && hasAffordableReward);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition-all duration-300 ${
                active ? "-translate-y-1 text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="relative">
                <Icon
                  className={`h-6 w-6 transition-all ${active ? "drop-shadow-[0_0_12px_rgba(0,212,255,0.8)]" : ""}`}
                />
                {showBadge && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                )}
              </span>
              <span className="font-mono">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
