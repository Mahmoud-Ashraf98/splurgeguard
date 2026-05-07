import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart3, Lock, Settings as SettingsIcon } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/stats", label: "Stats", Icon: BarChart3 },
  { to: "/vault", label: "Vault", Icon: Lock },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ to, label, Icon }) => {
          const active = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition-all duration-300 ${
                active ? "-translate-y-1 text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-all ${active ? "drop-shadow-[0_0_12px_rgba(0,212,255,0.8)]" : ""}`}
              />
              <span className="font-mono">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
