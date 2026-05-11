## Goal
Produce a single, comprehensive Markdown document that gives any AI assistant full expert-level context on the SplurgeGuard project — features, architecture, data model, algorithms, file organization, conventions, and gotchas.

## Format
- **Markdown (`.md`)** — the most AI-compatible format (plain text, structured headings, code blocks, tables). Universally parseable, fits in context windows, copy-pasteable into any LLM.
- Saved to `/mnt/documents/SplurgeGuard_AI_Context.md` and delivered as a downloadable artifact.

## Document structure
1. **Project Identity** — what SplurgeGuard is, philosophy ("Master POV / Financial Discipline" rebrand), tone rules (forbidden vs. preferred vocabulary)
2. **Tech Stack & Build** — React 19, TanStack Start v1, TanStack Router (file-based), Vite 7, Tailwind v4, Radix/shadcn, Sonner, Zod, Lucide. 100% offline, no backend.
3. **File & Folder Organization** — full tree map of `src/` with the role of each file (routes, components/splurge/*, context, lib/*, hooks)
4. **Routing Map** — every route, its file, what it renders
5. **Global State (AppContext)** — shape of `AppData`, persistence (`localStorage` key `splurgeGuardData_v1`), migration guard, all mutator actions exposed
6. **Data Model** — every type from `splurge-types.ts` with field-by-field meaning (UserState, Transaction, VaultItem, Reward, DailyContract, LevelDef, Currency enums, category lists)
7. **Core Systems (deep)** — for each: trigger, inputs, formula, side effects, edge cases
   - Ascension Protocol (10 ranks, `ascensionXP` vs `totalDP` decoupling, demotions, danger zone, cinematic)
   - Daily Contracts (refresh logic, secure/yield, randomization)
   - The Vault (cooling → ready transition, 60s global tick + visibilitychange, dedup ref, claim/discard)
   - Smart Daily Limit (`calcSmartDailyLimit` formula with proximity weighting + amortized payload decay)
   - Payload Decay (stateless amortization, `amortizeDays` vs legacy `amortizationDays`)
   - Vice Engine (target habit, weekly cap Mon→Sun, +250 DP Monday bonus)
   - Exchange / Rewards (archetypes, integrity modal, DP-only debit)
   - Freedom Engine (50-tier milestone ladder, capital preserved)
   - Burn Rate Gauge, Vice Firewall Matrix, Audit Trail
   - DP economy table (every credit/debit with exact values)
   - Streak system (3/7/14-day bonuses, reset on breach, miss-day penalty cap)
   - Notification engine (welcome-back, vice check, EOD recap with localStorage dedup)
8. **Key Algorithms (with code references)** — pointers to exact functions in `splurge-utils.ts`, `dateUtils.ts`, `milestones.ts`, `ranks.tsx`, `contracts.ts`, `archetypes.ts`
9. **UI/Design System** — Tailwind v4 via `src/styles.css`, semantic tokens (oklch), cyan/emerald accent palette, "premium glassmorphism" patterns, the gradient-cycle keyframe, mono fonts
10. **Copy & Identity Rules** — forbidden vocabulary (DIRECTIVE, BOUNTY, TERMINAL, BLACK MARKET, FORFEIT, MISSION, QUEST), preferred phrasing (STAY STRONG, GIVE IN ANYWAY, Challenge Conquered, Caved to Impulse, Impulse Control, Active Cooling, Ascension Ranks, Rewards). Internal identifiers (routes `/spoils` etc., variable names like `forfeitCount`) intentionally NOT renamed — separation of code identifiers from user-facing copy.
11. **Persistence & Migration** — STORAGE_KEY, migration auto-seed for legacy data missing `ascensionXP` / `dailyContracts`, JSON export/import, currency toggle (VND/USD)
12. **PWA** — manifest, offline-first, install instructions
13. **Architectural Invariants & Gotchas**
    - Decoupled XP ledgers
    - Stateless amortization (never mutate arrays)
    - Vault toast dedup via `useRef<Set>`
    - Battery-friendly single global interval
    - Long-press gear-shifting via recursive setTimeout + latest-callback ref
    - TanStack route file conventions (no `_app/index.tsx`, never edit `routeTree.gen.ts`)
    - Server runtime constraints (irrelevant — no backend)
14. **Contribution Cheat Sheet** — "If you're asked to X, edit Y" mapping for the most common change types
15. **Glossary** — all domain terms (DP, XP, Vault, Cooling, Ready, Discard, Vice, Payload Decay, Freedom Engine, Ascension, etc.)

## Method
- Read every file in `src/` (routes, components/splurge, context, lib, styles) to extract exact field names, formulas, and constants — no guessing.
- Cross-reference README for tone, then verify against current code (README may lag rebrand).
- Inline real code snippets for non-obvious algorithms (Smart Daily Limit, Vault tick, demotion logic).
- Output: one self-contained `.md` file delivered via `<lov-artifact>`.
