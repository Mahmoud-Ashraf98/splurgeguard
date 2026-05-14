import type { CSSProperties } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { AppProvider, useApp } from "@/context/AppContext";
import { BottomNav } from "@/components/splurge/BottomNav";
import { BreachModal } from "@/components/splurge/BreachModal";
import { AscensionCinematic } from "@/components/splurge/AscensionCinematic";
import { LogSheet } from "@/components/splurge/LogSheet";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a0e1a" },
      { title: "SplurgeGuard — Fight Impulse Spending" },
      { name: "description", content: "A behavioral finance PWA: cooling-off vault, smart daily limit, discipline points." },
      { property: "og:site_name", content: "SplurgeGuard" },
      { property: "og:title", content: "SplurgeGuard — Fight Impulse Spending" },
      { name: "twitter:title", content: "SplurgeGuard — Fight Impulse Spending" },
      { property: "og:description", content: "A behavioral finance PWA: cooling-off vault, smart daily limit, discipline points." },
      { name: "twitter:description", content: "A behavioral finance PWA: cooling-off vault, smart daily limit, discipline points." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/3233c1dd-5b94-429e-b020-0bccf8569e34" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/3233c1dd-5b94-429e-b020-0bccf8569e34" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", type: "image/png", href: "/icon.png" },
      { rel: "apple-touch-icon", href: "/icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SplurgeGuard",
          url: "https://splurgeguard.lovable.app",
          logo: "https://splurgeguard.lovable.app/icon.png",
          description: "A behavioral finance PWA that helps you fight impulse spending.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SplurgeGuard",
          url: "https://splurgeguard.lovable.app",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="font-mono text-6xl font-bold text-emerald-400">404</h1>
        <Link to="/" className="mt-4 inline-block font-mono text-sm text-slate-400 hover:text-emerald-400">← back home</Link>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-950">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const shellChromeStyle = {
  "--bottom-nav-height": "4.25rem",
} as CSSProperties;

function AppShell() {
  const app = useApp();
  const us = app.data.userState;

  return (
    <div className="relative min-h-screen" style={shellChromeStyle}>
      <main className="mx-auto min-h-screen max-w-md bg-slate-950 pb-[calc(var(--bottom-nav-height,4rem)+4.5rem)]">
        <Outlet />
      </main>
      {us && (
        <>
          <LogSheet open={app.logSheetOpen} onClose={() => app.setLogSheetOpen(false)} />
          <div
            className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
            style={{ bottom: `calc(var(--bottom-nav-height, 4rem) + 1.25rem)` }}
          >
            <button
              type="button"
              onClick={() => app.setLogSheetOpen(true)}
              className="
                pointer-events-auto
                flex items-center gap-2
                px-6 py-3
                bg-cyan-500 hover:bg-cyan-400
                text-slate-950 font-mono font-bold text-sm tracking-widest uppercase
                rounded-full
                shadow-[0_0_20px_rgba(34,211,238,0.35),0_4px_24px_rgba(0,0,0,0.5)]
                hover:shadow-[0_0_30px_rgba(34,211,238,0.55),0_4px_24px_rgba(0,0,0,0.6)]
                active:scale-95
                transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80
              "
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              LOG EXPENSE
            </button>
          </div>
        </>
      )}
      <BottomNav />
      <BreachModal />
      <AscensionCinematic />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#111827",
            border: "1px solid #1e293b",
            color: "#f1f5f9",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </QueryClientProvider>
  );
}
