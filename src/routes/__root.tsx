import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { AppProvider } from "@/context/AppContext";
import { BottomNav } from "@/components/splurge/BottomNav";
import { BreachModal } from "@/components/splurge/BreachModal";
import { AscensionCinematic } from "@/components/splurge/AscensionCinematic";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0a0e1a" },
      { title: "SplurgeGuard — Fight Impulse Spending" },
      { name: "description", content: "A behavioral finance PWA: cooling-off vault, smart daily limit, discipline points." },
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="mx-auto min-h-screen max-w-md bg-slate-950 pb-20">
          <Outlet />
        </div>
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
      </AppProvider>
    </QueryClientProvider>
  );
}
