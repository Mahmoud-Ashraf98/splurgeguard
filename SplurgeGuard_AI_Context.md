# SplurgeGuard — AI Context Document

> **Purpose.** Drop this in as a system / preamble prompt before an AI assistant works on SplurgeGuard. It is engineered to give expert-level context — identity, architecture, data model, algorithms, copy rules, and known footguns — without forcing a re-read of the entire repo. Everything below was extracted from the source on the date in §0.
>
> **Companion docs:**
> - [`AGENTS.md`](./AGENTS.md) — short operational guidelines for *running* the dev loop in Cursor (Cloud + Desktop). Read it first if you're booting an agent session.
> - [`repomix.xml`](./repomix.xml) — packed XML snapshot of the live source tree for fast LLM context loads.
> - This document — long-form architectural context. Use it for *understanding* and design decisions.

---

## 0. How to read this document

| Section | Use when |
|---|---|
| §1 Identity & Voice | Writing any user-facing copy, naming a feature, or tweaking tone |
| §2 Tech Stack | Adding a dependency or scaffolding a new module |
| §3 Source Map | "Which file owns X?" — single-source-of-truth pointers |
| §4 Routing | Adding/renaming a page |
| §5 Global State | Touching `AppContext.tsx`, persistence, migration, or background loops |
| §6 Data Model | Adding a field, migration, or backup-compat concern |
| §7 Core Systems | Reasoning about DP, ranks, vault, smart limit, PYF, contracts |
| §8 UI System | Visual tweaks, keyframes, glassmorphism patterns |
| §9 Backend Surface | Anything touching D1 / TanStack server functions |
| §10 PWA & Backup | Manifest, install, export/import |
| §11 Invariants & Footguns | **READ THIS BEFORE EDITING** — non-negotiable rules |
| §12 Cheat Sheet | "I want to change X — which file?" lookup |
| §13 Anti-patterns | Common LLM mistakes specific to this codebase |
| §14 Glossary | Term lookup |

**Verifiability.** Field names, file paths, thresholds, and constants are quoted verbatim from source. If you find a divergence, the source wins — fix this doc.

**Last verified against source:** 2026-05-19.

---

## 1. Project Identity

**SplurgeGuard** is a **mobile-first, offline-by-default, gamified personal-finance PWA** that intercepts impulse spending in real time. The core game loop:

1. User commits an "income → overhead → savings → flexible pool" allocation at the start of each cycle (**Pay Yourself First** model).
2. Every discretionary spend either fits inside the **Smart Daily Limit** or triggers a **breach** (DP penalty + streak reset).
3. Big urges go into **The Vault** to cool off; surviving the cooldown is rewarded.
4. **Discipline Points (DP)** accumulate into ranks and unlock self-defined rewards.

State lives in `localStorage` on the device. The only optional server surface is a Cloudflare D1 table for **subscriptions** (recurring auto-pay drains) — see §9.

### Voice & Identity (CRITICAL)

The app underwent a "**Master POV / Financial Discipline**" rebrand. Tone is **relatable, psychological, leveling-up** — *not* military / tactical / hacker terminal.

**FORBIDDEN user-facing vocabulary** (must never appear in visible UI):

`DIRECTIVE`, `BOUNTY`, `TERMINAL`, `BLACK MARKET`, `FORFEIT`, `MISSION`, `QUEST`.

**Preferred user-facing copy:**

| Action | Copy |
|---|---|
| Hold-to-confirm a contract | `HOLD TO COMMIT` / `COMMIT` |
| Confirm cancel of a contract | `STAY STRONG` |
| Confirm yielding a contract | `GIVE IN ANYWAY` (countdown gated) |
| Successful contract | `Challenge Conquered` / `SECURED [+N DP]` |
| Yielded contract | `Caved to Impulse` / `FORFEITED [-N DP]` |
| Vault subhead | `Impulse Control` |
| Vault active section | `Active Cooling` |
| Bottom nav: rewards tab | `REWARDS` (label) — but route stays `/exchange` |
| Rewards page header | `THE REWARDS` / `Level Ups` |
| Rank guide | `Ascension Ranks` / `Climb. Ascend. Transcend.` |
| Savings withdrawal (emergency) | `EMERGENCY OVERRIDE` |
| Savings withdrawal (impulse) | `IMPULSE RAID` (countdown gated, −200 DP) |

**Internal identifiers (variables, routes, function names) are intentionally NOT renamed** — code uses `forfeitProtocol`, `secureProtocol`, `dailyContracts`, `/exchange`, etc. **Separate code identifiers from user-facing copy. Never refactor legacy identifiers just to "match the rebrand."**

The terms `DISCIPLINE POINTS` (DP), `VAULT`, and `THE VAULT` are sacred — never rename.

---

## 2. Tech Stack

- **Runtime:** React 19 + TanStack Start v1.167+ + TanStack Router (file-based) + Vite 7
- **Styling:** Tailwind CSS v4 via `src/styles.css` (`@import "tailwindcss"` + `@theme inline`). **No `tailwind.config.js`** — tokens live in `@theme inline`.
- **UI primitives:** Radix UI + shadcn/ui (`new-york` style, base color `slate`)
- **Animation:** framer-motion
- **Toasts:** sonner
- **Icons:** lucide-react
- **Validation:** zod (incl. Drizzle schemas + TransactionMetadata discriminated unions)
- **DB (optional, server-only):** Cloudflare D1 via Drizzle ORM — see §9
- **Server functions:** TanStack `createServerFn` — currently used only for the subscriptions surface
- **Deployment target:** Cloudflare Workers (`@cloudflare/vite-plugin`, `wrangler.jsonc`)
- **Vite config:** delegates to `@lovable.dev/vite-tanstack-config`. **Do NOT add duplicate plugins** (it already bundles TanStack Start, React, Tailwind v4, tsconfig-paths, and Cloudflare).

---

## 3. Source Map (single-source-of-truth pointers)

```
src/
├── routes/                          # File-based routes (TanStack)
│   ├── __root.tsx                   # Providers: QueryClient, AppProvider, BottomNav, BreachModal,
│   │                                #            AscensionCinematic, Toaster. Head meta + JSON-LD.
│   ├── index.tsx                    # "/" Dashboard (sovereign card, status ring, daily contracts
│   │                                #            carousel, vault preview, SavingsRaidModal trigger)
│   ├── vault.tsx                    # "/vault" The Vault (cooling / ready / archived)
│   ├── exchange.tsx                 # "/exchange" Rewards store (archetypes + custom + integrity modal)
│   ├── stats.tsx                    # "/stats" Burn Rate, Freedom Engine, Vice Firewall, Subscriptions,
│   │                                #          Payload Decay, breakdown donut
│   ├── settings.tsx                 # "/settings" Identity, budget, PYF, notifications, backup, danger
│   └── sitemap[.]xml.ts             # Static sitemap.xml route
│
├── routeTree.gen.ts                 # AUTO-GENERATED. Never edit manually.
├── router.tsx                       # createRouter + QueryClient
├── server.ts / start.ts             # SSR / Workers entry (TanStack Start managed)
│
├── context/
│   └── AppContext.tsx               # ALL global state, persistence, migration, daily-check,
│                                    # vault tick, ascension monitor, notifications, mutators
│
├── components/
│   ├── splurge/                     # App-specific components (one file = one feature)
│   │   ├── Onboarding.tsx           # 2-phase setup: profile → savings slider (PYF)
│   │   ├── BottomNav.tsx            # 5-tab nav, active glow + ready/affordable badges
│   │   ├── StatusRing.tsx           # Reactor ring (outer = daily limit; inner = weekly habit)
│   │   ├── LogSheet.tsx             # Bottom sheet: "Log Expense" / "Add to Vault" (+ amortization picker)
│   │   ├── DailyContractsBoard.tsx  # Compact daily contract list (alt to dashboard carousel)
│   │   ├── HoldSecureButton.tsx     # Hold-to-confirm with circular progress (durationMs default 1500)
│   │   ├── ForfeitModal.tsx         # Cooldown-armed confirmation ("Stay Strong" / "Give In Anyway")
│   │   ├── BreachModal.tsx          # Daily-limit-exceeded modal (−25 DP, streak reset)
│   │   ├── SavingsRaidModal.tsx     # Emergency vs Impulse savings withdrawal (impulse: −200 DP, 3s gated)
│   │   ├── AscensionCinematic.tsx   # Full-screen rank-up ceremony (3s hold, HOLD_DURATION_MS = 3000)
│   │   └── LevelGuideModal.tsx      # Premium glassmorphism rank list (Ascension Ranks)
│   └── ui/                          # shadcn primitives (button, dialog, card, etc.)
│
├── lib/
│   ├── splurge-types.ts             # ALL types, STORAGE_KEY, category lists, LEVELS, levelForLifetimeDP
│   ├── splurge-utils.ts             # fmt money, dayKey, daysBetween, txIsCompleted,
│   │                                # calcBaseDailyAllowance, calcVisualDailyAllowance, calcSmartDailyLimit,
│   │                                # subscriptionDailyOverheadVND, discretionarySpentOn,
│   │                                # weeklyHabitSpent, dpForAmount, milestoneBonus, txLifespan,
│   │                                # selectNetSavingsCents, computeCurrentFlexiblePoolCents,
│   │                                # applyWithdrawFromSavingsState, calcFreedomEnginePreservedVND, uuid
│   ├── amortization.ts              # Stateless amortization helpers + idempotency keys + validation
│   ├── schemas.ts                   # zod: transactionMetadataSchema (discriminated union),
│   │                                # subscriptionSchema, Subscription, SubscriptionViewModel
│   ├── dateUtils.ts                 # getDaysSince / getDaysSinceFrom (timezone-safe day diffs),
│   │                                # paydayInputToIsoEndOfLocalDay, isPaydayStrictlyInFuture
│   ├── ranks.tsx                    # 10-rank Ascension table with inline SVG avatars (RANKS,
│   │                                # getRankForXP, getNextRank)
│   ├── milestones.ts                # 50+ Freedom Engine milestone tiers (50K → 3B VND)
│   ├── archetypes.ts                # 26 reward archetypes with emoji / baseDP / glow color
│   ├── contracts.ts                 # generateDailyContracts() — picks 4 of 33 from CONTRACT_POOL
│   ├── notifications.ts             # Foreground notification engine (welcome-back, vice, EOD)
│   ├── transaction-extraction-agent-prompt.ts
│   │                                # System-prompt fragment for offline transaction parsing
│   │                                # (defines amortization vs subscription disambiguation)
│   ├── error-capture.ts             # Out-of-band error capture so server.ts can recover stacks
│   │                                # after h3 swallows a throw into a generic 500
│   ├── error-page.ts                # Error-page renderer
│   └── utils.ts                     # cn() shadcn helper
│
├── hooks/
│   ├── useCurrencyInput.ts          # Currency-aware input (display formatting + human-readable badge)
│   ├── useLongPress.ts              # 5-gear long-press (immediate → 200ms → 50ms → 50ms × 10),
│   │                                # uses savedCallback = useRef(callback) pattern for HMR safety
│   └── use-mobile.tsx
│
├── db/                              # Cloudflare D1 (optional server surface — see §9)
│   ├── schema.ts                    # drizzle schema: `subscriptions` table
│   └── d1-client.ts                 # getDb() — returns drizzle(d1) or null if no binding
│
├── utils/
│   └── subscriptions.functions.ts   # TanStack server functions: get/create/update/delete subscription
│
└── styles.css                       # Tailwind v4 entry, fonts, ALL keyframes, ALL utility classes,
                                     # ALL theme tokens (no separate config file)
```

---

## 4. Routing Map (TanStack Router, file-based)

| Path | File | Component | Purpose |
|---|---|---|---|
| `/` | `routes/index.tsx` | `Index` | Dashboard: operator card, status ring, daily contracts carousel, vault preview, savings raid CTA |
| `/vault` | `routes/vault.tsx` | `VaultPage` | Cooling, ready (Resolution Phase), archived items |
| `/exchange` | `routes/exchange.tsx` | `ExchangePage` | Archetype grid → DP-cost stepper → Integrity modal. Accepts `?new=true` to jump to grid. |
| `/stats` | `routes/stats.tsx` | `StatsPage` | Burn Rate Gauge, Freedom Engine, breakdown donut, Vice Firewall, Subscriptions, Payload Decay |
| `/settings` | `routes/settings.tsx` | `SettingsPage` | Identity, budget cycle, PYF allocations, target habit, exchange rate, notifications, export/import, wipe |
| `/sitemap.xml` | `routes/sitemap[.]xml.ts` | (raw response) | Static sitemap |

Bottom nav order: **Home, Stats, Vault, REWARDS (label) → `/exchange`, Settings.**

---

## 5. Global State (`AppContext.tsx`)

### Persistence

- **Single localStorage key:** `splurgeGuardData_v1` (exported as `STORAGE_KEY`)
- Auxiliary keys: `sg_last_savings_base_cents` (suggests savings slider default on re-onboard), `sg_eod_notif_sent` (EOD notification dedup).
- Hydrate once on mount → save on every change. If `localStorage.setItem` throws (quota), shows a sticky error toast (`id: "storage-quota-error"`).

### Migration (`migrate(parsed)`)

Idempotent backfills, run on hydrate and on import:

- Backfills `lifetimeDP` from `totalDP`.
- Backfills `currentLevel` from `lifetimeDP` (via `levelForLifetimeDP`).
- **Ascension migration:** if `ascensionXP` missing → seeds from `totalDP`, recomputes `currentLevel` via `RANKS`, sets `_isMigrationLoad: true` so the ascension monitor skips the level-up cinematic on first load.
- Backfills `dailyContracts: []` and `lastContractRefreshDate: ""`.
- **PYF migration:** if `total_income_cents` missing → infers from `currentBalanceVND + Σ(non-essential completed tx amounts since cycleStart)` and marks `pyfIncomeInferred = true`. Backfills `fixed_overhead_cents`, `savings_base_cents`, `savings_sweeps_cents`, `savings_raided_cents`, `raid_history`, and `current_cycle_id` (uuid) when absent.
- **Transaction status backfill:** assigns `status = "completed"` and `vault_expires_at = null` to legacy rows missing those fields.
- **Vault → frozen-tx backfill:** for every `cooling`/`ready` vault item without a `frozenTransactionId`, synthesizes a frozen `Transaction` row and links it back.
- Backfills `subscriptions: []`.
- Drops legacy state missing `targetHabit`.

### `useApp()` — exposed mutators (canonical shape)

```ts
{
  data,                          // AppData
  initUser(input),               // First-time setup (2-phase onboarding fields)
  withdrawFromSavings(amountCents, type, justification, options?),
                                 // "impulse" | "emergency"; impulse → −200 DP, streak reset
  startNewCycle(),               // Resets cycle window + PYF sweeps/raids; carries savings pledge forward
  updateUserState(patch),        // Partial<UserState>; renaming targetHabit also rewrites past tx.category
  logExpense(input) → boolean,   // Idempotency-keyed; debits balance; awards/penalises DP; may breach
  addToVault(input),             // Pushes cooling vault item AND a frozen Transaction (the commitment ledger)
  markVaultReady(id),            // Manual cooling→ready (rare; the global tick handles it)
  approveVault(id),              // Confirms purchase: flips frozen→completed, debits balance, −10 DP cost-of-convenience
  discardVault(id),              // Marks discarded, +40 DP, flips frozen→rejected, capital flows to Freedom Engine
  spendDP(amount),               // Debits totalDP only (Exchange path)
  deleteVaultItem(id),           // Also flips linked frozen→rejected and credits +40 DP (treated as discard)
  deleteTransaction(id),         // Refunds balance / essentialSpent on completed rows only
  importData(json) → boolean,    // Restores backup + reloads
  clearData(),                   // Nukes all sg_* localStorage keys
  toggleCurrency(),              // VND ↔ USD display
  smartDailyLimit,               // memoised
  todayDiscretionary,            // memoised
  breach, clearBreach,           // BreachModal trigger
  createReward, redeemReward, deleteReward,
  pendingAscension, clearPendingAscension,
                                 // Drives AscensionCinematic
}
```

### Background loops inside `AppProvider`

1. **Daily login check** (`dailyCheckRan` ref-guarded once per session): if `lastLoginDate < today`,
   - if `gap === 1` and yesterday's discretionary ≤ `calcBaseDailyAllowance(us, yDate) − subscriptionDailyOverheadVND(subs)` → **+50 DP**, streak +1, milestone bonus check.
   - if `gap > 1` → **−10 DP per missed day, capped at −50**, streak reset to 0.
   - **If today is Monday (`getDay() === 1`)** and last-7-day `targetHabit` spend < `weeklyHabitLimitVND` → **+250 DP**.
   - Updates `lastLoginDate`.
2. **Daily contracts refresh:** if `lastContractRefreshDate !== todayStr`, regenerate 4 contracts (shuffle CONTRACT_POOL — currently 33 entries — and slice 4).
3. **Vault cooling tick:** single global `setInterval(check, 60000)` + `visibilitychange` listener. Flips `cooling → ready` when due, fires a single toast per item via `notifiedReadyRef: useRef<Set<string>>`. **Battery-friendly — never per-card setInterval.**
4. **Foreground notification engine** (lazy-imported only when `Notification.permission === "granted"`):
   - `notifyWelcomeBack` if user was hidden > 1h
   - `notifyViceCheck` every 4h
   - `notifyEndOfDay` once at 20:00 local (deduplicated via `localStorage["sg_eod_notif_sent"]`)
5. **Ascension monitor:** observes `ascensionXP` / `currentLevel`. If actual rank > current → `setPendingAscension(currentLevel + 1)` (one step at a time; `AscensionCinematic` handles confirmation). If actual < current → instantly demotes and shows red `DEMOTION` toast. Skips on `_isMigrationLoad`.

### `applyDPGain(us, gain)` — canonical DP credit helper

Credits **all three** ledgers:

- `totalDP += gain`
- `lifetimeDP += max(0, gain)` — never decreases
- `ascensionXP += max(0, gain)` — never decreases (positive accumulator only)

Penalties (`−25` breach, `−10 × missed days`, `−10` vault-approve cost, `−200` impulse raid) subtract from `totalDP` AND `ascensionXP` (clamped at 0). **`lifetimeDP` is never debited.**

---

## 6. Data Model (`splurge-types.ts` + `schemas.ts`)

### `AppData`

```ts
{
  userState: UserState | null,
  transactions: Transaction[],
  vaultItems: VaultItem[],
  rewards: Reward[],
  subscriptions: Subscription[],   // Local mirror; merged with D1 loader data on /stats
  _isMigrationLoad?: boolean,      // Transient; stripped by ascension monitor after first pass
}
```

### `UserState`

| Field | Notes |
|---|---|
| `userName` | "Master" by default |
| `currentBalanceVND` | The **flexible pool** for this cycle. Decremented by every non-essential completed spend. |
| `essentialSpentVND` | Cumulative essential spend (not subtracted from flex pool — it's tracked separately) |
| `cycleStartDate` / `paydayDate` | ISO strings. Set at `initUser` / `startNewCycle`. |
| `total_income_cents` | **PYF input**: gross take-home allocated to this cycle. Integer minor units, same scale as VND. |
| `fixed_overhead_cents` | **PYF input**: fixed unavoidable costs (rent, utilities, etc.) for the cycle |
| `savings_base_cents` | **PYF input**: amount pledged to savings this cycle (the "pay yourself first" amount) |
| `savings_sweeps_cents` | Optional automated sweeps into savings (not yet UI-driven; reserved) |
| `savings_raided_cents` | Cumulative withdrawn from savings back into the flexible pool this cycle |
| `raid_history` | `RaidRecord[]` — ledger of every raid (impulse \| emergency) for the active cycle |
| `current_cycle_id` | Stable uuid for the active cycle (raid records and exports key off this) |
| `pyfIncomeInferred` | Set by migration when `total_income_cents` was synthesized from legacy data — user should verify in Settings. |
| `totalDP` | **Spendable** wallet. Debited by Exchange. Penalised by breaches, vault approval cost, impulse raids. |
| `lifetimeDP` | Append-only legacy ledger (drives the legacy `LEVELS` table; not the rank engine). |
| `currentLevel` | 1..10 (Ascension Protocol step) |
| `ascensionXP` | **Rank-driving** ledger. Decoupled from `totalDP`. Floors at 0 on penalty. |
| `currentStreakDays` | Days under daily limit |
| `lastLoginDate` | dayKey string (`YYYY-MM-DD`) |
| `weeklyHabitLimitVND` | Target cap for weekly habit bonus |
| `targetHabit` | Free-text category name (e.g. "Vaping"). Renaming rewrites past transactions. |
| `usdExchangeRate` | Default 26310 (`DEFAULT_USD_EXCHANGE_RATE`) |
| `displayCurrency` | `"VND" \| "USD"` |
| `dailyContracts` | `DailyContract[]` (length 4) |
| `lastContractRefreshDate` | `YYYY-MM-DD` |

> **Alias:** `CycleState = UserState`. Some code refers to cycle-scoped shape under that name; the runtime type is identical.

### `RaidRecord` (impulse vs emergency)

```ts
| { type: "impulse";   amount_cents: number; justification: null;     timestamp: string; cycle_id: string }
| { type: "emergency"; amount_cents: number; justification: string;   timestamp: string; cycle_id: string }
```

- **Impulse raid:** −200 DP from `totalDP` and `ascensionXP` (XP clamped at 0), streak → 0. UI is `SavingsRaidModal` with a 3-second confirm gate.
- **Emergency raid:** no DP penalty. Requires non-empty `justification`.

### `DailyContract`

```ts
{ id, title, subtitle, reward, penalty, status: 'available'|'secured'|'yielded', iconType }
```

The pool currently holds **33 contracts** across 7 themed bands (Transport, Food & Drinks, Online Shopping, Digital & Gaming, Convenience, Social, High-Stakes Discipline). `reward` and `penalty` are symmetric per contract (`±10`, `±15`, `±20`, `±25` depending on difficulty).

### `Transaction`

| Field | Notes |
|---|---|
| `id`, `timestamp`, `amountVND` | |
| `originalAmount?`, `originalCurrency` | For USD-entered tx (Travelling, Visa) |
| `category` | One of `ESSENTIAL_CATEGORIES`, `DISCRETIONARY_CATEGORIES`, or `targetHabit` |
| `isEssential` | Computed via `isEssentialCategory(category)` |
| `justification` | min 5 chars |
| `fromVault` | true if approved out of cooling |
| `status?: "completed" \| "frozen" \| "rejected"` | **Ledger lifecycle.** Omitted in legacy persisted data — readers treat as `"completed"` via `txIsCompleted(tx)`. |
| `vault_expires_at?: string \| Date \| null` | Vault cooling deadline (ISO). Null for non-vault rows. |
| `amortizeDays?` | **Canonical** lifespan field (1, 3, 7, 14, 30) |
| `amortizationDays?` | Legacy alias — readers fall back via `txLifespan(tx)`. **New tx writes both** for forward+back compat. |
| `metadata?: TransactionMetadata` | Discriminated union (zod-validated). Either `{ is_recurring_subscription: true }` (no schedule) or `{ is_recurring_subscription: false, amortization_schedule?: { spread_days, amortization_start_date } }`. |

**Status semantics:**

- `completed` → contributes to spend curves, daily limit, breakdown, etc.
- `frozen` → exists because of an in-flight vault commitment; counted as "today's locked amount" via `sumFrozenTransactionsToday`, but excluded from completed-spend aggregations.
- `rejected` → user discarded or deleted the vault item; ignored everywhere except the trophy/Freedom Engine ledger.

`txIsCompleted(t)` is the canonical filter — **use it instead of inline `t.status === "completed"` checks** so legacy rows (no status field) still flow through.

### `VaultItem`

```ts
{
  id, itemName, estimatedAmountVND, category,
  createdAt, delayHours, justification,
  status: 'cooling' | 'ready' | 'approved' | 'discarded',
  frozenTransactionId?: string,   // Links to the frozen Transaction row created on `addToVault`
  discardedAt?: string,           // ISO; set on `discardVault` (powers trophy room ordering)
}
```

### `Subscription` (zod-validated; see `schemas.ts`)

```ts
{
  id: uuid, name, amountCents, billingCycle: "monthly" | "yearly",
  nextBillingDate: ISO, isActive: boolean, createdAt: ISO
}
```

`SubscriptionViewModel` adds `monthlyEquivalentCents` and `dailyDrainCents` for `/stats`.

### `Reward`

```ts
{ id, archetypeId, emoji, title, costDP, createdAt, redeemedAt?, status: 'active'|'redeemed' }
```

### Category lists

`ESSENTIAL_CATEGORIES` (8): Meat and chicken, Other essential home groceries, Motorbike expenses, Rent, Visa and documents fees, Utilities/Phone & Internet, Medical & Pharmacy, Other Essentials.

`DISCRETIONARY_CATEGORIES` (8): Diet soda…, Clothes, Travelling, Dining Out & Street Food, Software & Digital Subscriptions, Tech & Hardware Upgrades, Fitness & Supplements, Other Splurges.

**Plus `targetHabit`** is treated as its own discretionary category, **excluded from `discretionarySpentOn`** (it has its own weekly cap engine).

### `LEVELS` (legacy lifetime-DP ladder)

Used by `levelForLifetimeDP` migration only — 10 thresholds: 0, 300, 800, 1500, 2500, 4000, 6000, 8500, 11500, 15000. **Distinct from `RANKS` in `lib/ranks.tsx`** — `RANKS` drives the live rank.

---

## 7. Core Systems

### 7.1 Ascension Protocol — the rank engine (`lib/ranks.tsx`)

10 ranks driven by `ascensionXP` (**not** `totalDP`). Each has a programmatic SVG avatar, color, glow, and quote.

| Lv | Title | Threshold (XP) |
|---|---|---|
| 1 | The NPC | 0 |
| 2 | The Doomer | 1,000 |
| 3 | Paper Hands | 3,000 |
| 4 | Locked In | 7,000 |
| 5 | Based Earner | 12,000 |
| 6 | The Architect | 20,000 |
| 7 | The Chad | 30,000 |
| 8 | Diamond Hands | 45,000 |
| 9 | The Whale | 65,000 |
| 10 | Sovereign Sigma | 100,000 |

`getRankForXP(xp)` reverses RANKS to find the highest threshold met. `getNextRank(level)` returns the next rank or null.

**Promotion path:** ascension monitor in AppContext detects `actualLevel > currentLevel` → `setPendingAscension(currentLevel + 1)` (one rank at a time). `AscensionCinematic` shows a full-screen ceremony, requires a **3-second hold** (`HOLD_DURATION_MS = 3000`) on `HOLD TO ASCEND`, then confetti + advances level. User can `skip ›`.

**Demotion:** `actualLevel < currentLevel` → instant level update + red `DEMOTION` toast. `lifetimeDP` and `ascensionXP` floor at 0.

### 7.2 Pay Yourself First (PYF) — cycle allocation

This is the *fiscal* backbone underneath the gamified surface. On onboarding (and on `startNewCycle`):

```
total_income_cents       = user-declared take-home for this cycle
fixed_overhead_cents     = user-declared unavoidable fixed costs
savings_base_cents       = user-declared savings pledge (slider, capped at income − overhead)
currentBalanceVND        = total_income − fixed_overhead − savings_base   (the "flexible pool")
```

Two derived selectors (in `splurge-utils.ts`):

- `selectNetSavingsCents(state) = savings_base + savings_sweeps − savings_raided`
- `computeCurrentFlexiblePoolCents(us, txs) = total_income − fixed_overhead − savings_base − spentNonEssentialThisCycle + savings_raided`

`startNewCycle()` resets `cycleStartDate`, clears `savings_sweeps_cents`, `savings_raided_cents`, `raid_history`, mints a new `current_cycle_id`, and recomputes `currentBalanceVND` from the same income / overhead / savings inputs. It carries the savings pledge forward (stored to `sg_last_savings_base_cents` for the next onboarding default).

### 7.3 Savings Raids (`SavingsRaidModal` + `applyWithdrawFromSavingsState`)

When users want to break the PYF pledge, they explicitly mark *why*:

- **Emergency raid** → no DP penalty, `justification` required and stored in `raid_history`.
- **Impulse raid** → −200 DP from `totalDP` and `ascensionXP` (XP clamped at 0), streak → 0, `justification: null`. UI requires a 3-second countdown confirm before the button enables.

Both update `savings_raided_cents` and credit the withdrawn amount into `currentBalanceVND` (i.e. funds flow back into the flexible pool).

`applyWithdrawFromSavingsState(us, amountCents, type, justification)` is **pure** — throws on `amount <= 0` or insufficient savings. AppContext wraps it in a `mutate` and surfaces errors via toast.

### 7.4 Daily Protocol Contracts (`lib/contracts.ts`)

- Pool of **33 contracts** across 7 themed bands; `generateDailyContracts()` shuffles + slices 4.
- Refreshed on first dashboard render after midnight (compares `lastContractRefreshDate` to `YYYY-MM-DD` today). Refresh toast: `"New daily challenges available."`
- Statuses: `available` → user picks `secured` (+reward via `applyDPGain`) or `yielded` (penalty to `totalDP` + `ascensionXP`; XP clamps at 0; `lifetimeDP` untouched).
- Dashboard renders them as a **horizontal carousel** (≈85vw cards). Yield action goes through `ForfeitModal` (`STAY STRONG` / `GIVE IN ANYWAY` with countdown).

### 7.5 The Vault — Mandatory Cooling

State machine:

```
addToVault   ──►  cooling  ──tick──►  ready  ──approveVault──►  approved
                                       │
                                       └──discardVault──►  discarded
deleteVaultItem  ──►  removed  (treated as a discard)
```

Key invariants:

- `addToVault` **also** writes a `frozen` Transaction row (the financial commitment ledger). `VaultItem.frozenTransactionId` links the two.
- `delayHours ∈ { 1, 12, 24, 48, 72, 120, 168, 336, 720 }`. After `delayHours × 3,600,000ms`, the global 60s tick (+ `visibilitychange`) flips to `ready` and fires a single `🔓 Vault Item Ready: <name>` toast (dedup via `notifiedReadyRef`).
- **Approve → Buy:** flips the frozen tx to `completed`, debits `currentBalanceVND`, applies `−10 DP` (cost-of-convenience penalty), and if the vault category matches `targetHabit` *and* the path was a vault-claim with positive cooling, also credits the habit-vault bonus = `15 × floor(delayHours / 24)` (toasted as `🎯 Vault discipline! +N DP bonus`).
- **Discard → Defeat:** flips the frozen tx to `rejected`, credits **+40 DP** (all ledgers via `applyDPGain`), and `estimatedAmountVND` flows into the **Freedom Engine** (capital preserved sum). Toast: `🏆 Impulse defeated. +40 DP — Total Victory.`
- **Delete a vault item** is *also* treated as a discard (+40 DP, flips frozen → rejected) so users can clear stale items without losing the discipline credit.

### 7.6 Daily Allowance & Smart Daily Limit (`splurge-utils.ts`)

There are three concentric daily caps; each one is the previous minus a deduction:

```
calcBaseDailyAllowance(us, today)        = floor(currentBalanceVND / max(1, daysBetween(today, paydayDate)))

sumFrozenTransactionsToday(txs, today)   = Σ amountVND of `frozen` rows whose timestamp falls on local today

calcVisualDailyAllowance(us, today, txs) = max(0, baseAllowance − frozenToday)

calcSmartDailyLimit(us, today, txs,
                    subscriptionDailyOverheadVND)
                                         = max(0, visualAllowance − subscriptionDailyOverheadVND)
```

Where `subscriptionDailyOverheadVND(subs) = round(Σ (monthly-equivalent) / 30)`.

> **Critical:** subscription amounts are accounted for **only** as a daily-cap deduction. They are **not** subtracted from the flexible pool and **not** added into `discretionarySpentOn`.

The breach check inside `logExpense`:

- A non-essential, non-habit tx triggers a breach when `todayDiscretionary + slice > smartDailyLimit`, where `slice = amountVND / amortDays` if amortized, else `amountVND`.
- On breach: still records the tx, then `totalDP − 25`, `ascensionXP − 25` (clamp 0), `currentStreakDays = 0`, opens `BreachModal`.

### 7.7 Stateless Payload Decay (Amortization) (`lib/amortization.ts`)

- Available bucket sizes in LogSheet: `1, 3, 7, 14, 30` days.
- `1 = TODAY only` (no amortization). New tx writes both `amortizeDays` and `amortizationDays`.
- `txLifespan(tx) = max(1, tx.amortizeDays ?? tx.amortizationDays ?? 1)`.
- Active amortization "projection" is recomputed on every render via `getActiveAmortizations(transactions)`:
  - filters out non-`completed`, recurring subscriptions, malformed schedules, and future-dated start dates;
  - dedupes by `${category}:${amountVND}:${spreadDays}` (keeps newest);
  - excludes amortizations whose window has expired.
- `getDailyDrain(tx)` returns `amountVND / spreadDays`. `getRemainingDays(tx)` returns the remaining window length.
- **Idempotency keys** (`buildIdempotencyKey`, `buildIdempotencyKeyFromPending`): `${category}:${amountVND}:${minuteTimestamp}:${spreadDays}`. `logExpense` blocks duplicate inserts via this key (and `console.warn`s the rejection).

`discretionarySpentOn(txs, dKey, targetHabit?)` sums the per-day slice of every active amortization that overlaps that day. Skips essentials and the targetHabit (which has its own engine).

### 7.8 Vice Engine (Target Habit)

- Single free-text habit set during onboarding (e.g. "Vaping").
- Rendered alongside discretionary categories in LogSheet with the red `Target` icon and 🎯.
- DP rules:
  - Buy directly (not from vault) → `dpForAmount` returns **0** for habit.
  - Buy via vault → normal `dpForAmount` AND optional habit-vault bonus (`+15 DP per 24h delay`).
  - Stay under `weeklyHabitLimitVND` over the last 7 days → **+250 DP** on Monday morning.
- `weeklyHabitSpent(txs, habit, today)` uses sliding-7-day amortized overlap.
- Renaming `targetHabit` in Settings rewrites all matching past transactions (case-insensitive compare on trimmed lowercase) to keep history aligned.

### 7.9 Exchange / Rewards (`/exchange`, `lib/archetypes.ts`)

- **26 archetypes** (food, lifestyle, travel, tech, plus a "My Own Reward" `custom` slot with `baseDP: 500`).
- Stepper sets `costDP`, snapping in 50-DP increments via `useLongPress` 5-gear shifting (1 → 200ms → 50ms → 50ms × 10).
- Approximation: `1 DP ≈ 100 VND` (display only — `vnd = costDP * 100`).
- `redeemReward`:
  - returns `"insufficient_dp"` → opens **Integrity Modal** ("I Will Wait.") — does **NOT** debit anything.
  - returns `"success"` → debits **only `totalDP`**. **`ascensionXP` and `lifetimeDP` are sacred — never touched.**
- BottomNav badge: green dot on REWARDS when any active reward `costDP <= totalDP`.

### 7.10 Freedom Engine (`/stats`, `lib/milestones.ts`)

Capital preserved this cycle has two components, computed by `calcFreedomEnginePreservedVND`:

```
savingsPortionVND               = (savings_base / totalCycleDays) × effectiveElapsedDays
discretionaryUnspentPortionVND  = max(0, smartDailyLimit × effectiveElapsedDays − totalFunSpentInCycleVND)
total                           = round(savingsPortion + discretionaryUnspentPortion)
```

The total maps to one of 50+ **milestone tiers** (50K → 3B VND), labelled with VN-specific cultural anchors (bánh mì, motorbike, Đà Lạt, etc.). Stats shows the current milestone card, animated progress bar to next milestone, and a scrolling "Neutralized Impulses" list (sourced from `discarded` vault items).

### 7.11 Tactical Burn Rate (`/stats`)

Two stacked bars:

- **Cycle Time Elapsed** = `daysElapsed / totalCycleDays`
- **Budget Spent** = `totalFunSpent / startingBalance` where `startingBalance = currentBalanceVND + totalFunSpent`

If `burnPercent > timePercent` → red `WARNING: PACING EXCEEDED`, else green `OPTIMAL ACCUMULATION`.

### 7.12 Vice Firewall Matrix (`/stats`)

14-day grid of discretionary spend vs `smartDailyLimit`:

- **Perfect** (0 spend) → emerald
- **Controlled** (≤ limit) → cyan
- **Breach** (> limit) → rose, `animate-pulse`
- Future cells (after today) → muted slate
- Hover tooltip with date + amount.

### 7.13 Subscriptions Surface (`/stats`)

Read from `data.subscriptions` (local mirror) on the client. The server functions in `src/utils/subscriptions.functions.ts` provide a CRUD surface against D1 when a `DB` binding is present — see §9. Subscriptions are **never** subtracted from `currentBalanceVND` or fed into `discretionarySpentOn`; they only reduce the daily cap via `subscriptionDailyOverheadVND`.

### 7.14 DP Economy (canonical table)

| Action | totalDP | ascensionXP | lifetimeDP |
|---|---|---|---|
| Stay under daily limit (yesterday) | +50 | +50 | +50 |
| Log expense, < 50K VND | +5 | +5 | +5 |
| Log expense, 50K–200K | +3 | +3 | +3 |
| Log expense, > 200K | +1 | +1 | +1 |
| Habit purchase (direct, not vault) | 0 | 0 | 0 |
| Vault claim (approve), habit category | +base + (15 × floor(h/24)) − 10 | base + bonus | base + bonus |
| Vault claim (approve), non-habit | +base − 10 | base | base |
| Vault discard / delete | +40 | +40 | +40 |
| Daily contract — secure | +reward | +reward | +reward |
| Daily contract — yield | +penalty (negative) | clamped at 0 | unchanged |
| 3-day streak | +100 | +100 | +100 |
| 7-day streak | +300 | +300 | +300 |
| 14-day streak | +750 | +750 | +750 |
| Beat weekly habit cap (Mon) | +250 | +250 | +250 |
| Daily breach | −25 + streak reset | −25 (clamp 0) | unchanged |
| Miss day(s) | −min(50, missed × 10) + streak reset | same (clamp 0) | unchanged |
| Impulse savings raid | −200 + streak reset | −200 (clamp 0) | unchanged |
| Emergency savings raid | 0 | 0 | 0 |
| Redeem reward in Exchange | −costDP | unchanged | unchanged |

> The `−10` on vault approve is a deliberate "cost-of-convenience" so claiming is never strictly DP-positive relative to discarding. Removing it would break the gamified incentive to discard.

### 7.15 Streak Milestones (`milestoneBonus` / `nextMilestone`)

- Day 3 → +100, Day 7 → +300, Day 14 → +750. Otherwise 0.
- `nextMilestone(streak)` projects 3 → 7 → 14 → next 7-day boundary.

### 7.16 Notification Engine (`lib/notifications.ts`)

- **Foreground only** (no service worker push).
- Requires `Notification.permission === "granted"` (request via Settings → "Enable Reminders").
- Three triggers (registered in AppContext after hydration):
  1. `notifyWelcomeBack` — when document becomes visible after >1h hidden.
  2. `notifyViceCheck` — every 4 hours.
  3. `notifyEndOfDay` — once at 20:00 local, deduplicated by `localStorage["sg_eod_notif_sent"] = YYYY-M-D`.

### 7.17 Transaction Extraction Agent (`lib/transaction-extraction-agent-prompt.ts`)

This file exports `TRANSACTION_EXTRACTION_SYSTEM_PROMPT` — a system-prompt fragment used when an offline/Cursor-side agent parses SMS/receipts/notes into structured `TransactionMetadata`. It encodes the canonical disambiguation rules between **subscription** and **amortization (spread cost)**:

- A duration tag (`30D`, `60D`, "spread 30 days") MUST produce `is_recurring_subscription: false` with a populated `amortization_schedule` (with ISO `amortization_start_date` and integer `spread_days`).
- An auto-renewing billing-cycle charge MUST produce `is_recurring_subscription: true` with **no** `amortization_schedule`.
- The agent never emits a per-day drain field — that's computed client-side.

If you change this prompt, also update the zod `transactionMetadataSchema` in `lib/schemas.ts` to match — the schema is the runtime gate.

---

## 8. UI / Design System

- **Background:** `#0a0e1a` deep navy. Page wrappers use `radial-gradient(ellipse_at_top, ...)`.
- **Accent palette:** cyan-400 (`#00d4ff`), emerald-400/teal (`#00ff87`), amber (warnings), rose-500 (breach/forfeit/impulse-raid), fuchsia (rewards).
- **Glow language:** `drop-shadow(0 0 Npx rgba(...))` and `boxShadow: 0 0 Npx <color>`.
- **Typography:** `Inter` for sans (body), `JetBrains Mono` for all numerals/labels (`font-mono`), `Share Tech Mono` available as `.font-tactical` (rare). All loaded via Google Fonts `<link>` from `styles.css`.
- **Common micro-styles:**
  - `tracking-[0.3em]` / `[0.4em]` for uppercase mono labels
  - Glassmorphism cards: `bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl`
  - Premium glassmorphism (LevelGuide): `bg-white/[0.02]`, `bg-cyan-500/10`, `ring-1 ring-cyan-500/20`, `shadow-[0_0_20px_rgba(6,182,212,0.15)]`
- **Keyframes (in `styles.css`):** `flicker`, `gradient-cycle`, `header-scan`, `ripple-pop`, `vault-pulse`, `vault-glow-breathe`, `vault-ready-pulse`, `payload-drain`, `shimmer`, `contract-scan`. Most components use `style={{ animation: '... infinite' }}` rather than Tailwind animate utilities.
- **Custom utility classes:** `.bg-cyber-mesh`, `.xp-power-cells`, `.scanline-effect`, `.header-scanline`, `.payload-decay-bar`, `.cta-ripple`, `.custom-scrollbar-hide`.
- **No `tailwind.config.js`** — only `@theme inline` block in `styles.css` defines tokens.

---

## 9. Backend Surface (Cloudflare D1) — *the only* server-touching code

> Historically this project was 100% offline. It is **still** offline by default; D1 is an *optional* surface used exclusively for **recurring subscription rows**. If you need to add server-touching behavior, it must follow this same shape.

### Schema (`src/db/schema.ts`)

Single table `subscriptions` (drizzle / sqlite-core):

| Column | Type | Notes |
|---|---|---|
| `id` | text, PK | uuid (auto via `$defaultFn(crypto.randomUUID)`) |
| `name` | text, not null | max 100 chars (zod) |
| `amount_cents` | integer, not null | positive integer (zod) |
| `billing_cycle` | text enum `monthly \| yearly` | |
| `next_billing_date` | text, not null | ISO datetime string |
| `is_active` | integer (boolean mode), default `true` | soft delete on `deleteSubscription` |
| `created_at` | text, not null | ISO; `$defaultFn(() => new Date().toISOString())` |

### Client (`src/db/d1-client.ts`)

`getDb()` returns `drizzle(d1, { schema })` when a `DB` binding exists in `getStartContext().contextAfterGlobalMiddlewares`, otherwise `null`. **All server functions guard on null** — local dev without a binding falls back to "no data" gracefully (`getSubscriptions` returns `[]`, mutations throw `"Database is not configured"`).

### Server functions (`src/utils/subscriptions.functions.ts`)

Four TanStack `createServerFn` endpoints, all input-validated with zod:

- `getSubscriptions` (GET) → active rows mapped to `Subscription` shape.
- `createSubscription` (POST) → uuid + `isActive: true` + `createdAt`. Returns `{ id }`.
- `updateSubscription` (POST) → discriminated update (at least one field required by `.refine(...)`).
- `deleteSubscription` (POST) → soft delete (sets `is_active = false`).

**Do not add Node-only deps** — this runs on Cloudflare Workers. The `error-capture.ts` module exists to recover stack traces after h3 swallows throws into generic 500 responses; if you add a new server function, prefer letting it throw and rely on that capture for diagnostics.

---

## 10. Persistence, Backup, Currency, PWA

- Settings → Backup & Security → "Download Backup File" exports the entire `AppData` as `splurgeGuardData_v1_YYYY-MM-DD.json`.
- "Restore from Backup" → reads JSON, runs through `migrate()`, replaces state, hard-reloads.
- "Clear All Data" (Danger Zone, two-step confirm) → wipes `STORAGE_KEY`, `sg_last_savings_base_cents`, `sg_eod_notif_sent`; resets to `defaultData`.
- Currency toggle: header pill cycles `displayCurrency`. `fmtMoney(vnd, currency, rate)` divides by `usdExchangeRate` for USD. Default rate: `DEFAULT_USD_EXCHANGE_RATE = 26310`. Editable in Settings.
- **PWA:** `public/manifest.json` + `/icon.png` registered in `__root.tsx`. `theme-color: #0a0e1a`. Install: Android Chrome ⋮ → Add to Home Screen; iOS Safari → Share → Add to Home Screen. Works offline after first load.

---

## 11. Architectural Invariants & Footguns

> **Read every line. The blast radius of breaking one of these is the entire game economy.**

1. **Decoupled XP ledgers.** Never debit `lifetimeDP` or `ascensionXP` for an Exchange spend or any "cost-of-convenience" deduction. Use `applyDPGain` for credits. Penalties subtract from `totalDP` and `ascensionXP` (clamped at 0) only.
2. **Stateless amortization.** Active payload decays are projected per-render from the transaction list (`getActiveAmortizations`). **Never store/mutate** a per-day breakdown array.
3. **Vault tick is global.** One 60s `setInterval` + `visibilitychange` listener in AppContext. Toast dedup via `notifiedReadyRef: useRef<Set<string>>`. **Never** spawn per-card timers.
4. **Vault items always pair with a frozen Transaction.** Every `addToVault` writes a `frozen` row; `approveVault` flips it to `completed`; `discardVault` / `deleteVaultItem` flips it to `rejected`. The migration backfills any missing pair. Don't break this pairing.
5. **`txIsCompleted` is the only correct status filter.** Use it instead of inline `t.status === "completed"` so legacy rows (no field) still count.
6. **Subscriptions are a daily-cap deduction only.** Never add them to `discretionarySpentOn`. Never subtract them from `currentBalanceVND`.
7. **PYF inputs are integers in minor units** (named `*_cents`) but conceptually live on the same scale as VND. Don't convert; just treat them as integer VND.
8. **Idempotency in `logExpense`.** Duplicates blocked by `${category}:${amountVND}:${minuteTimestamp}:${spreadDays}`. Don't strip the minute timestamp granularity — that's the dedup window.
9. **Long-press gear-shifting.** `useLongPress` uses `savedCallback = useRef(callback)` updated in an effect to avoid stale closures across rapid re-renders. Don't refactor it to inline closures.
10. **Cinematic ascension.** `pendingAscension` advances **one level at a time** (`currentLevel + 1`). On `_isMigrationLoad`, the monitor silently aligns `currentLevel` without showing the cinematic.
11. **Routes are file-based.** Never edit `routeTree.gen.ts`. The root file is `src/routes/__root.tsx` (no `_app/`, no `pages/`).
12. **No new Node-only deps.** The Workers runtime is the constraint, even though most state is local.
13. **Internal identifiers ≠ user copy.** Routes `/exchange`, functions like `forfeitProtocol`, `secureProtocol`, fields like `dailyContracts.status === 'yielded'` MUST stay. Only user-visible strings follow the rebrand vocabulary.
14. **Both `amortizeDays` and `amortizationDays` are written** on new transactions for forward+back compatibility. Always read via `txLifespan(tx)`.
15. **`TransactionMetadata` is a zod discriminated union.** A recurring subscription tx **must not** carry `amortization_schedule`. A spread-cost tx **must not** be flagged recurring. The agent prompt in §7.17 encodes this; the schema enforces it; don't bypass either.
16. **Impulse raid = −200 DP, streak reset.** Emergency raid = no penalty but justification required. Both flow through `applyWithdrawFromSavingsState` (pure). Don't add a third type without updating modal, state transition, and §7.14 table.
17. **`startNewCycle` carries the savings pledge forward.** It does not reset `savings_base_cents`. It does reset `savings_sweeps_cents`, `savings_raided_cents`, `raid_history`, mints a fresh `current_cycle_id`, and recomputes `currentBalanceVND`.

---

## 12. Contribution Cheat Sheet

| If asked to… | Edit |
|---|---|
| Add a daily contract / change one | `src/lib/contracts.ts` (`CONTRACT_POOL`) |
| Add/rename a category | `src/lib/splurge-types.ts` (`ESSENTIAL_CATEGORIES`/`DISCRETIONARY_CATEGORIES`) + icon maps in `routes/stats.tsx` & `components/splurge/LogSheet.tsx` |
| Change a rank's title/threshold/quote/avatar | `src/lib/ranks.tsx` `RANKS[]` |
| Tweak XP awards/penalties | `src/lib/splurge-utils.ts` (`dpForAmount`, `milestoneBonus`) + the daily-check / breach / vault-approve / discard / raid blocks in `src/context/AppContext.tsx` |
| Change daily-limit math | `calcBaseDailyAllowance` / `calcVisualDailyAllowance` / `calcSmartDailyLimit` in `src/lib/splurge-utils.ts` |
| Change PYF / cycle math | `src/lib/splurge-utils.ts` (`selectNetSavingsCents`, `computeCurrentFlexiblePoolCents`, `applyWithdrawFromSavingsState`) + `startNewCycle` / `initUser` in `src/context/AppContext.tsx` |
| Add a Freedom Engine milestone | `src/lib/milestones.ts` |
| Adjust Freedom Engine math | `calcFreedomEnginePreservedVND` in `src/lib/splurge-utils.ts` |
| Add a reward archetype | `src/lib/archetypes.ts` |
| Vault delay options | `src/components/splurge/LogSheet.tsx` (cooling-period grid) |
| Amortization buckets | Same file (`[1,3,7,14,30]` array) |
| Add/change a subscription field | `src/db/schema.ts` + `src/lib/schemas.ts` (zod) + `src/utils/subscriptions.functions.ts` + `/stats` consumers |
| Transaction-extraction agent rules | `src/lib/transaction-extraction-agent-prompt.ts` + matching update to `transactionMetadataSchema` in `src/lib/schemas.ts` |
| Bottom-nav order/labels | `src/components/splurge/BottomNav.tsx` (don't change the route paths) |
| Onboarding fields | `src/components/splurge/Onboarding.tsx` + `initUser` in `AppContext.tsx` + add to `UserState` + extend `migrate()` |
| Notification copy/timing | `src/lib/notifications.ts` + intervals in `AppContext.tsx`'s notification effect |
| Cinematic visuals/timing | `src/components/splurge/AscensionCinematic.tsx` (`HOLD_DURATION_MS`) |
| Hold-to-confirm length on contracts | `HoldSecureButton.tsx` `durationMs` (default 1500) |
| Forfeit confirmation cooldown | `ForfeitModal.tsx` `cooldownMs` (default 1500) |
| Savings raid confirmation gate | `SavingsRaidModal.tsx` (`countdown` initial = 3) |
| Global colors / keyframes | `src/styles.css` |
| Migration logic for legacy users | `migrate()` at top of `src/context/AppContext.tsx` |

**Default workflow rules:**

- Use semantic Tailwind classes; reach for inline `style={{ ... }}` only for dynamic colors derived from rank/glow.
- Do NOT introduce a `tailwind.config.js`. Add tokens to `@theme inline` in `styles.css`.
- Always update both `amortizeDays` AND `amortizationDays` when writing transactions.
- When adding any DP credit path, use `applyDPGain` — do not hand-roll three writes.
- When reading transactions for aggregates, gate with `txIsCompleted(t)`.

---

## 13. Anti-patterns (common LLM mistakes specific to this codebase)

These are mistakes that AI assistants make *predictably* on this repo. Read them before touching the relevant area.

| Anti-pattern | Correct approach |
|---|---|
| "I'll just decrement `ascensionXP` for the Exchange purchase." | **No.** Exchange debits `totalDP` only. XP is sacred. |
| "I'll add a `setInterval` per cooling card so the UI is responsive." | The global 60s tick + `visibilitychange` is intentional. Use it. |
| "Let me cache the active amortizations to an array on `AppData`." | Amortization is *stateless*. Project per render with `getActiveAmortizations`. |
| "I'll subtract subscription amounts from `currentBalanceVND`." | Subscriptions reduce the daily cap only. They never touch the flexible pool or `discretionarySpentOn`. |
| "I'll deduplicate via just `category + amount` in `logExpense`." | The idempotency key includes minute-precision timestamp + spread days. Keep it that way. |
| "Vault discard should be +50 DP per the docs." | It is **+40 DP** in current source. The DP economy table in §7.14 is the source of truth. |
| "I'll rename `forfeitProtocol` to `yieldProtocol` to match the rebrand." | **Don't.** Internal identifiers stay. Only user-facing copy follows §1. |
| "I'll have the agent set `is_recurring_subscription: true` for any tx tagged with a day count." | A duration tag means *amortization*, not a subscription. They are semantically distinct (see §7.17). |
| "I'll use `t.status === 'completed'` in this filter." | Use `txIsCompleted(t)` — legacy rows have no status field. |
| "Migration only runs on first install." | It runs on **every** hydrate and on import. Make sure your fields are idempotent. |
| "I'll add a `tailwind.config.js` for this one custom color." | All tokens go in `@theme inline` in `styles.css`. |
| "I'll edit `routeTree.gen.ts` to add a hidden internal route." | It's generated. Add a file under `src/routes/` instead. |
| "Habit purchases earn DP just like other expenses." | Direct habit purchases earn 0 DP. Only vault-claimed habit purchases earn DP (with bonus). |
| "I'll let the cinematic catch up multiple ranks at once if the user jumps several thresholds." | Cinematic advances **one level per pass**. The monitor re-fires until aligned. |

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **DP** | Discipline Points. Three ledgers: `totalDP` (spendable), `ascensionXP` (rank-driving), `lifetimeDP` (append-only legacy). |
| **Ascension XP** | Append-only positive accumulator that drives the rank tree (clamps at 0 on penalty). |
| **Rank / Level** | One of 10 entries in `RANKS` (NPC → Sovereign Sigma). |
| **Cycle** | Period from `cycleStartDate` to `paydayDate`. Has a stable `current_cycle_id`. |
| **PYF (Pay Yourself First)** | The income → overhead → savings → flexible-pool allocation model. |
| **Flexible Pool** | `currentBalanceVND`. What's left after PYF deductions; consumed by non-essential spend. |
| **Savings Raid** | Withdrawing from the savings pledge back into the flexible pool. Two types: emergency (free) and impulse (−200 DP). |
| **Smart Daily Limit** | Per-render computed safe daily discretionary spend, after subtracting today's frozen vault total and the subscription daily overhead. |
| **Vault** | Cooling buffer for impulse purchases. Items go cooling → ready → approved or discarded. Always paired with a frozen Transaction. |
| **Frozen Transaction** | A `Transaction` row with `status: "frozen"` representing an in-flight vault commitment. |
| **Cooling** | Vault state while delay hours haven't elapsed. |
| **Ready / Resolution Phase** | Cooling complete, awaiting Claim or Discard decision. |
| **Discard / Impulse Defeated** | User chose not to buy → +40 DP, capital flows to Freedom Engine, frozen → rejected. |
| **Vice / Target Habit** | Single user-named bad-habit category with weekly cap and bonus rules. |
| **Daily Protocol Contract** | One of 4 randomized daily micro-challenges (drawn from a pool of 33). Internal status enum: `available \| secured \| yielded`. |
| **Payload Decay** | Statelessly amortized expense (1, 3, 7, 14, 30 days). |
| **Freedom Engine** | `savingsPortion + discretionaryUnspentPortion`, mapped to 50+ milestones. |
| **Burn Rate** | Stats comparison of cycle-time-elapsed vs budget-spent. |
| **Vice Firewall** | 14-day color-coded grid of daily discretionary vs Smart Daily Limit. |
| **Breach** | Today's discretionary slice would exceed Smart Daily Limit. −25 DP, streak reset, BreachModal. |
| **Cinematic** | Full-screen rank-up ceremony, 3s hold to confirm. |
| **Operator Card / Sovereign Card** | Dashboard's top "ID" card with avatar, rank, XP bar. |
| **Status Ring / Reactor** | Center dashboard widget. Outer ring = daily limit. Inner ring = weekly habit. |
| **Integrity Modal** | Exchange's "Not enough DP yet" intervention dialog. |
| **Idempotency Key** | `${category}:${amountVND}:${minuteTimestamp}:${spreadDays}` — gates duplicate `logExpense` inserts. |
| **Transaction Extraction Agent** | Offline / Cursor-side LLM prompt (`TRANSACTION_EXTRACTION_SYSTEM_PROMPT`) that parses bank SMS / receipts / notes into structured `TransactionMetadata`. |

---

*End of context document. When in doubt: read the source file from §12, follow the invariants in §11, avoid the anti-patterns in §13, and obey the copy rules in §1.*
