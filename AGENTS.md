# AGENTS.md

## Cursor Cloud specific instructions

### Overview

SplurgeGuard is a 100% offline, gamified personal finance PWA. There is **no backend, no database, no external APIs**. All data is stored in the browser's `localStorage`. The only service needed is the Vite dev server.

### Running the dev server

```bash
bun run dev
```

Starts Vite on `http://localhost:8080/` with HMR. The port 8080 is configured by `@lovable.dev/vite-tanstack-config`.

### Lint / Format / Build

- **Lint:** `bun run lint` — ESLint with Prettier integration. The codebase has pre-existing Prettier formatting issues (single quotes vs double quotes); these are not blocking.
- **Format:** `bun run format` — auto-fix formatting with Prettier.
- **Build:** `bun run build` — produces both client and SSR (Cloudflare Workers) bundles in `dist/`.

### Architecture notes

- `vite.config.ts` delegates to `@lovable.dev/vite-tanstack-config` which bundles TanStack Start, React, Tailwind CSS v4, tsconfig-paths, and Cloudflare plugins. Do NOT add duplicate plugins.
- File-based routing via TanStack Router in `src/routes/`.
- Path alias `@/*` maps to `src/*`.
- The Cloudflare Workers entry (`src/server.ts`) is only relevant for production deployment, not local dev.
- The app shows a setup wizard on first load (no `localStorage` data). After completing setup, the Dashboard appears.
