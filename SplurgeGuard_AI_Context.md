# SplurgeGuard — AI Context Document

> **Purpose.** This single document is engineered to give any AI assistant complete, expert-level context on the SplurgeGuard project — its identity, architecture, data model, algorithms, file layout, copy rules, and gotchas — so it can contribute correctly without re-reading the entire codebase. Use it as the system prompt / preamble when seeking AI help on this project.
> **Last verified against source:** All code paths, formulas, constants, copy strings, and field names below were extracted directly from the project's source files.

---

## 1. Project Identity

**SplurgeGuard** is a **100% offline, gamified personal-finance PWA** that intercepts impulse spending in real time. It runs entirely in the browser (localStorage), has no backend, and uses behavioral-finance friction (cooling-off vault, smart daily limit, discipline points, ranks) to convert urges into restraint.

### Voice & Identity (CRITICAL)
The app underwent a "**Master POV / Financial Discipline**" rebrand. Tone is **relatable, psychological, leveling-up** — *not* military/tactical/hacker terminal.

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

**Internal identifiers (variables, routes, function names) are intentionally NOT renamed** — code uses `forfeitProtocol`, `secureProtocol`, `dailyContracts`, `/exchange`, etc. Separate code identifiers from user-facing copy. **Never refactor legacy identifiers just to "match the rebrand."**

The terms `DISCIPLINE POINTS` (DP), `VAULT`, and `THE VAULT` are sacred — never rename.

---

## 2. Tech Stack

- **Runtime:** React 19 + TanStack Start v1.167+ + TanStack Router (file-based) + Vite 7
- **Styling:** Tailwind CSS v4 via `src/styles.css` (`@import "tailwindcss"` + `@theme inline`). No `tailwind.config.js`.
- **UI primitives:** Radix UI + shadcn/ui (`new-york` style, base color `slate`)
- **Animation:** framer-motion
- **Toasts:** sonner
- **Icons:** lucide-react
- **Validation:** zod
- **Backend:** **NONE.** No Supabase, no Lovable Cloud, no API. Everything in `localStorage`.
- **Deployment target:** Cloudflare Workers (`@cloudflare/vite-plugin`, `wrangler.jsonc`)

---

## 3. File & Folder Organization

```
src/
├── routes/                          # File-based routes (TanStack)
│   ├── __root.tsx                   # Root shell: providers, BottomNav, BreachModal, AscensionCinematic, Toaster
│   ├── index.tsx                    # "/" Dashboard (sovereign card, status ring, daily contracts carousel)
│   ├── vault.tsx                    # "/vault" The Vault (cooling/ready/archived)
│   ├── exchange.tsx                 # "/exchange" Rewards store (archetypes + custom)
│   ├── stats.tsx                    # "/stats" Tactical Stats suite (Burn Rate, Freedom Engine, Vice Firewall, breakdown)
│   └── settings.tsx                 # "/settings" Identity, budget, notifications, backup, danger zone
│
├── routeTree.gen.ts                 # AUTO-GENERATED. Never edit manually.
├── router.tsx                       # createRouter + QueryClient
├── server.ts / start.ts             # SSR entry (TanStack Start managed)
│
├── context/
│   └── AppContext.tsx               # ALL global state, persistence, daily-check, vault tick, ascension monitor, mutators
│
├── components/
│   ├── splurge/                     # All app-specific components
│   │   ├── Onboarding.tsx           # First-run setup form (name, balance, payday, target habit, weekly limit)
│   │   ├── BottomNav.tsx            # 5-tab bottom nav with active glow + ready/affordable badges
│   │   ├── StatusRing.tsx           # Reactor ring (outer = daily limit; inner = weekly habit)
│   │   ├── LogSheet.tsx             # Bottom sheet for "Log Expense" / "Add to Vault" (with amortization)
│   │   ├── DailyContractsBoard.tsx  # Compact list view of daily contracts (alt to dashboard carousel)
│   │   ├── HoldSecureButton.tsx     # 1.5s hold-to-confirm with circular progress
│   │   ├── ForfeitModal.tsx         # 1.5s cooldown-armed confirmation dialog ("Stay Strong" / "Give In Anyway")
│   │   ├── BreachModal.tsx          # Daily-limit-exceeded modal (-25 DP, streak reset)
│   │   ├── AscensionCinematic.tsx   # Full-screen rank-up ceremony (3s hold to ascend) + confetti
│   │   └── LevelGuideModal.tsx      # Premium glassmorphism rank list (Ascension Ranks)
│   └── ui/                          # shadcn primitives (button, dialog, card, etc.)
│
├── lib/
│   ├── splurge-types.ts             # ALL TypeScript types, STORAGE_KEY, category lists, LEVELS, levelForLifetimeDP
│   ├── splurge-utils.ts             # fmt money, dayKey, daysBetween, calcSmartDailyLimit, discretionarySpentOn,
│   │                                # weeklyHabitSpent, dpForAmount, milestoneBonus, txLifespan, uuid
│   ├── dateUtils.ts                 # getDaysSince / getDaysSinceFrom (timezone-safe day diffs)
│   ├── ranks.tsx                    # 10-rank Ascension table with inline SVG avatars (RANKS, getRankForXP, getNextRank)
│   ├── milestones.ts                # 50+ Freedom Engine milestone tiers (50K → 3B VND)
│   ├── archetypes.ts                # 26 reward archetypes with emoji/baseDP/glow
│   ├── contracts.ts                 # generateDailyContracts() — picks 4 of 5 from CONTRACT_POOL
│   ├── notifications.ts             # Foreground notification engine (welcome-back, vice check, EOD)
│   └── utils.ts                     # cn() shadcn helper
│
├── hooks/
│   ├── useLongPress.ts              # 5-gear long-press (immediate → 200ms → 50ms → 50ms×10)
│   └── use-mobile.tsx
│
└── styles.css                       # Tailwind v4 entry, fonts, all keyframes (flicker, gradient-cycle, vault-pulse,
                                     # vault-glow-breathe, vault-ready-pulse, payload-drain, header-scan, shimmer,
                                     # contract-scan, ripple-pop)
```

---

## 4. Routing Map (TanStack Router, file-based)

| Path | File | Component | Purpose |
|---|---|---|---|
| `/` | `routes/index.tsx` | `Index` | Dashboard: operator card, status ring, daily contracts carousel, vault preview |
| `/vault` | `routes/vault.tsx` | `VaultPage` | Cooling, ready (Resolution Phase), archived items |
| `/exchange` | `routes/exchange.tsx` | `ExchangePage` | Rewards list / archetype grid / DP-cost stepper / Integrity modal. Accepts `?new=true` to jump to grid. |
| `/stats` | `routes/stats.tsx` | `StatsPage` | Burn Rate Gauge, Freedom Engine, breakdown donut, Vice Firewall Matrix |
| `/settings` | `routes/settings.tsx` | `SettingsPage` | Identity, budget, target habit, exchange rate, notifications, export/import, wipe |

Bottom nav order: Home, Stats, Vault, **REWARDS** (label) → `/exchange`, Settings.

---

## 5. Global State (`AppContext.tsx`)

### Persistence
- **Single localStorage key:** `splurgeGuardData_v1` (exported as `STORAGE_KEY`)
- Hydrate once on mount → save on every change. If `localStorage.setItem` throws (quota), shows a sticky error toast.
- **Migration guard `migrate(parsed)`:**
  - Backfills `lifetimeDP` from `totalDP`
  - Backfills `currentLevel` from `lifetimeDP`
  - **Ascension migration:** if `ascensionXP` missing → seeds from `totalDP`, recomputes `currentLevel` via `RANKS`, sets `_isMigrationLoad: true` so the ascension monitor skips the level-up cinematic on first load.
  - Backfills `dailyContracts: []` and `lastContractRefreshDate: ""`
  - Drops legacy state missing `targetHabit`.

### `useApp()` — exposed mutators

```ts
{
  data,                          // AppData
  initUser(input),               // First-time setup
  updateUserState(patch),        // Partial<UserState>; renaming targetHabit also rewrites past tx.category
  logExpense(input) → boolean,   // Adds tx, debits balance, awards/penalises DP, may breach
  addToVault(input),             // Pushes a cooling vault item
  markVaultReady(id),            // Manual cooling→ready (rare; tick handles it)
  approveVault(id),              // Wraps logExpense with fromVault:true and vault habit bonus (+15 DP / 24h delay)
  discardVault(id),              // Marks discarded, +50 DP, capital flows to Freedom Engine
  spendDP(amount),               // Debits totalDP only (used by exchange flows externally)
  deleteVaultItem(id),
  deleteTransaction(id),         // Refunds balance / essentialSpent
  importData(json) → boolean,    // Restores backup + reloads
  clearData(),                   // Nukes localStorage
  toggleCurrency(),              // VND ↔ USD display
  smartDailyLimit,               // memoised
  todayDiscretionary,            // memoised
  breach, clearBreach,           // BreachModal trigger
  createReward, redeemReward, deleteReward,
  pendingAscension, clearPendingAscension,  // Drives AscensionCinematic
}
```

### Background loops inside `AppProvider`

1. **Daily login check** (`dailyCheckRan` ref-guarded once per session): if `lastLoginDate < today`,
   - if gap == 1 and yesterday's discretionary ≤ yesterday's `calcSmartDailyLimit` → **+50 DP**, streak +1, milestone bonus check.
   - if gap > 1 → **−10 DP per missed day, capped at −50**, streak reset to 0.
   - **If today is Monday (`getDay() === 1`)** and `targetHabit` weekly spend < `weeklyHabitLimitVND` → **+250 DP**.
   - Updates `lastLoginDate`.
2. **Daily contracts refresh:** if `lastContractRefreshDate !== todayStr`, regenerate 4 contracts.
3. **Vault cooling tick:** single global `setInterval(check, 60000)` + `visibilitychange` listener. Flips `cooling → ready` when due, fires a single toast per item via `notifiedReadyRef: useRef<Set<string>>`. **Battery-friendly — never per-card setInterval.**
4. **Foreground notification engine** (only when `Notification.permission === 'granted'`):
   - `welcomeBack` if user was hidden > 1h
   - `viceCheck` every 4h
   - `endOfDay` once at 20:00 (deduplicated via `localStorage['sg_eod_notif_sent']`)
5. **Ascension monitor:** observes `ascensionXP`/`currentLevel`. If actual rank > current → sets `pendingAscension = currentLevel + 1` (one step at a time, AscensionCinematic handles confirmation). If actual < current → instantly demotes and shows red `DEMOTION` toast. Skips on `_isMigrationLoad`.

### `applyDPGain(us, gain)` (the canonical DP credit helper)
Always credits **all three** ledgers:
- `totalDP += gain`
- `lifetimeDP += max(0, gain)` — never decreases
- `ascensionXP += max(0, gain)` — never decreases (positive accumulator only)

Penalties (-25 breach, -10×missed days, -reset-streak) subtract from `totalDP` AND `ascensionXP` (clamped at 0). **Lifetime is never debited.**

---

## 6. Data Model (`splurge-types.ts`)

### `AppData`
```ts
{
  userState: UserState | null,
  transactions: Transaction[],
  vaultItems: VaultItem[],
  rewards: Reward[],
  _isMigrationLoad?: boolean,   // transient, stripped after first ascension monitor pass
}
```

### `UserState`
| Field | Notes |
|---|---|
| `userName` | "Master" by default |
| `currentBalanceVND` | Discretionary balance remaining until payday |
| `essentialSpentVND` | Cumulative essential spend |
| `cycleStartDate` | ISO. Set at `initUser` time. |
| `paydayDate` | ISO. End of cycle. |
| `totalDP` | **Spendable** wallet. Debited by Exchange. Penalised by breaches. |
| `lifetimeDP` | Append-only legacy ledger. |
| `currentLevel` | 1..10 (Ascension Protocol step) |
| `ascensionXP` | **Rank-driving** ledger. Decoupled from `totalDP`. |
| `currentStreakDays` | Days under daily limit |
| `lastLoginDate` | dayKey string (`YYYY-MM-DD`) |
| `weeklyHabitLimitVND` | Target cap for weekly bonus |
| `targetHabit` | Free-text category name (e.g. "Vaping"). Renaming rewrites past transactions. |
| `usdExchangeRate` | Default 26310 |
| `displayCurrency` | `"VND" \| "USD"` |
| `dailyContracts` | `DailyContract[]` (length 4) |
| `lastContractRefreshDate` | `YYYY-MM-DD` |

### `DailyContract`
```ts
{ id, title, subtitle, reward, penalty, status: 'available'|'secured'|'yielded', iconType }
```
Pool of 5: Grab Boycott (±15), Caffeine Fast (±10), Shopee Shield (±20), Hawker Reserve (±15), Boba Defiance (±10).

### `Transaction`
| Field | Notes |
|---|---|
| `id`, `timestamp`, `amountVND` | |
| `originalAmount`, `originalCurrency` | For USD-entered tx (Travelling, Visa) |
| `category` | One of `ESSENTIAL_CATEGORIES`, `DISCRETIONARY_CATEGORIES`, or `targetHabit` |
| `isEssential` | Computed via `isEssentialCategory(category)` |
| `justification` | min 5 chars |
| `fromVault` | true if approved out of cooling |
| `amortizeDays` | **Canonical** lifespan field (1, 3, 7, 14, 30) |
| `amortizationDays` | Legacy alias — readers fall back via `txLifespan(tx)` |

### `VaultItem`
```ts
{ id, itemName, estimatedAmountVND, category, createdAt,
  delayHours, justification,
  status: 'cooling' | 'ready' | 'approved' | 'discarded' }
```

### `Reward`
```ts
{ id, archetypeId, emoji, title, costDP, createdAt, redeemedAt?, status: 'active'|'redeemed' }
```

### Category lists
`ESSENTIAL_CATEGORIES` (8): Meat and chicken, Other essential home groceries, Motorbike expenses, Rent, Visa and documents fees, Utilities/Phone/Internet, Medical & Pharmacy, Other Essentials.
`DISCRETIONARY_CATEGORIES` (8): Diet soda…, Clothes, Travelling, Dining Out & Street Food, Software & Digital Subscriptions, Tech & Hardware Upgrades, Fitness & Supplements, Other Splurges.
**Plus `targetHabit`** is treated as its own discretionary category, excluded from `discretionarySpentOn` (it has its own weekly cap).

### `LEVELS` (legacy lifetime-DP ladder, used by `levelForLifetimeDP` migration only)
10 thresholds: 0, 300, 800, 1500, 2500, 4000, 6000, 8500, 11500, 15000.
**Distinct from `RANKS` in `lib/ranks.tsx`** — that drives the live rank.

---

## 7. Core Systems

### 7.1 Ascension Protocol (the rank engine — `lib/ranks.tsx`)

10 ranks driven by `ascensionXP` (NOT `totalDP`). Each has a programmatic SVG avatar, color, glow, and quote.

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

`getRankForXP(xp)` reverses RANKS to find the highest threshold met. `getNextRank(level)` returns level+1 or null.

**Promotion path:** ascension monitor in AppContext detects `actualLevel > currentLevel` → `setPendingAscension(currentLevel + 1)` (one rank at a time). `AscensionCinematic` shows full-screen ceremony, requires **3-second hold** (`HOLD_DURATION_MS = 3000`) on `HOLD TO ASCEND`, then confetti + advances level. User can `skip ›`.

**Demotion:** `actualLevel < currentLevel` → instant level update + red toast. `lifetimeDP` and `ascensionXP` floor at 0.

### 7.2 Daily Protocol Contracts (`lib/contracts.ts`)
- Pool of 5 contract templates; `generateDailyContracts()` shuffles + slices 4.
- Refreshed on first dashboard render after midnight (compares `lastContractRefreshDate` to `YYYY-MM-DD` today).
- Statuses: `available` → user picks `secured` (+reward to all DP ledgers) or `yielded` (penalty to totalDP+ascensionXP, NOT lifetime — penalty is negative; `Math.max(0, ...)` guards floor).
- Dashboard renders them as a **horizontal carousel** (85vw cards). The yield action goes through `ForfeitModal` with `STAY STRONG` / `GIVE IN ANYWAY (countdown)`.

### 7.3 The Vault — Mandatory Cooling
- User adds an item with `delayHours` ∈ {1, 12, 24, 48, 72, 120, 168, 336, 720}.
- Created in `cooling`. After `delayHours * 3600000ms`, the global tick (60s + visibility) flips it to `ready` and fires a single `🔓 Vault Item Ready: <name>` toast.
- **Ready actions:**
  - **Claim Item** → calls `approveVault` → wraps `logExpense({ fromVault: true })` → debits balance, awards small `dpForAmount`, **plus** if vault category matches `targetHabit`: bonus = `15 × floor(delayHours/24)` DP (toasted as "🎯 Vault discipline! +N DP bonus").
  - **Discard Impulse** → `discardVault` → status=`discarded`, **+50 DP** (all ledgers), `estimatedAmountVND` flows to **Freedom Engine** (capital preserved sum).

### 7.4 Smart Daily Limit (`calcSmartDailyLimit` in `splurge-utils.ts`)

```
daysUntilPayday  = max(1, daysBetween(today, paydayDate))
totalCycleDays   = max(1, daysBetween(cycleStartDate, paydayDate))
daysPassed       = max(0, daysBetween(cycleStartDate, today))
proximityWeight  = min(1.2, 1.0 + 0.2 * (daysPassed / totalCycleDays))   // loosens up to +20%

totalUnAmortized = Σ over txs with lifespan>1:
                   amountVND * (1 - daysSince/lifespan)   // remaining future drain

virtualBalance   = currentBalanceVND + totalUnAmortized   // adds back future amortized drains
limit            = floor((virtualBalance / daysUntilPayday) * proximityWeight)
```

`discretionarySpentOn(txs, dayKey, targetHabit)` sums the **per-day slice** (`amount/lifespan`) of every active amortization that overlaps that day. Skips essentials and the targetHabit (the habit has its own engine).

### 7.5 Payload Decay (Stateless Amortization)
- Available bucket sizes in LogSheet: `1, 3, 7, 14, 30` days.
- `1 = TODAY only` (no amortization).
- Stored on transaction as `amortizeDays` (canonical) and `amortizationDays` (legacy mirror, both written for forward+back compat).
- `txLifespan(tx) = max(1, tx.amortizeDays ?? tx.amortizationDays ?? 1)`.
- Stats screen renders each active decay as a draining diagonal-stripe bar (`.payload-decay-bar` keyframe `payload-drain`).
- **Never stored as mutable arrays** — projection is recomputed on every render from the transaction list.

### 7.6 Vice Engine (Target Habit)
- Single free-text habit set during onboarding (e.g. "Vaping").
- Listed alongside discretionary categories in LogSheet (rendered with red `Target` icon and 🎯).
- DP rules:
  - Buy directly (not from vault) → `dpForAmount` returns **0** for habit.
  - Buy via vault → normal `dpForAmount` AND optional habit-vault bonus (+15 DP per 24h delay).
  - Stay under `weeklyHabitLimitVND` over Mon→Sun → **+250 DP** Monday morning.
- `weeklyHabitSpent(txs, habit, today)` uses sliding-7-day amortized overlap.
- Renaming `targetHabit` in Settings rewrites all matching past transactions to keep history aligned.

### 7.7 Exchange / Rewards (`/exchange`, `lib/archetypes.ts`)
- 26 archetypes (food, lifestyle, travel, tech, plus a "My Own Reward" `custom` slot with `baseDP: 500`).
- Stepper sets `costDP`, snapping in 50-DP increments via `useLongPress` 5-gear shifting (1 → 200ms → 50ms → 50ms×10).
- Approximation: `1 DP ≈ 100 VND` (display only — `vnd = costDP * 100`).
- `redeemReward`:
  - returns `"insufficient_dp"` → opens **Integrity Modal** ("I Will Wait.") — does NOT debit anything.
  - returns `"success"` → debits **only `totalDP`**. **`ascensionXP` and `lifetimeDP` are sacred — never touched.**
- BottomNav badge: green dot on REWARDS when any active reward `costDP <= totalDP`.

### 7.8 Freedom Engine (`/stats`, `lib/milestones.ts`)
- Sum of `estimatedAmountVND` of all `discarded` vault items = "Capital Preserved".
- Mapped against 50+ milestone tiers (50K → 3B VND), labels are culturally specific (VN context).
- Shows current milestone card + animated progress bar to next milestone + "Neutralized Impulses" scrolling list.

### 7.9 Tactical Burn Rate (`/stats`)
Two stacked bars:
- **Cycle Time Elapsed** = `daysElapsed / totalCycleDays`
- **Budget Spent** = `totalFunSpent / startingBalance` where `startingBalance = currentBalanceVND + totalFunSpent`
- If `burnPercent > timePercent` → red `WARNING: PACING EXCEEDED`, else green `OPTIMAL ACCUMULATION`.

### 7.10 Vice Firewall Matrix (`/stats`)
14-day grid of discretionary spend vs `smartDailyLimit`:
- **Perfect** (0 spend) — emerald
- **Controlled** (≤ limit) — cyan
- **Breach** (> limit) — rose, animate-pulse
- Future cells (after today) → muted slate.
- Hover tooltip with date + amount.

### 7.11 DP Economy (canonical table)

| Action | totalDP | ascensionXP | lifetimeDP |
|---|---|---|---|
| Stay under daily limit (yesterday) | +50 | +50 | +50 |
| Log expense, < 50K VND | +5 | +5 | +5 |
| Log expense, 50K–200K | +3 | +3 | +3 |
| Log expense, > 200K | +1 | +1 | +1 |
| Habit purchase (direct, not vault) | 0 | 0 | 0 |
| Vault claim, habit category | +base + (15 × floor(h/24)) | same | same |
| 3-day streak | +100 | +100 | +100 |
| 7-day streak | +300 | +300 | +300 |
| 14-day streak | +750 | +750 | +750 |
| Secure a daily contract | +contract.reward | +reward | +reward |
| Yield a daily contract | +penalty (negative) | clamped at 0 | unchanged |
| Discard vault impulse | +50 | +50 | +50 |
| Beat weekly habit cap (Mon) | +250 | +250 | +250 |
| Exceed daily limit (breach) | −25 + streak reset | −25 (clamp 0) | unchanged |
| Miss day(s) | −min(50, missed×10) + streak reset | same (clamp 0) | unchanged |
| Redeem reward in Exchange | −costDP | unchanged | unchanged |

### 7.12 Streak Milestones (`milestoneBonus`)
- Day 3 → +100, Day 7 → +300, Day 14 → +750. Otherwise 0. `nextMilestone(streak)` projects 3 → 7 → 14 → next 7-day boundary.

### 7.13 Notification Engine (`lib/notifications.ts`)
- **Foreground only** (no service worker push).
- Requires `Notification.permission === 'granted'` (request via Settings → "Enable Reminders").
- Three triggers (registered in AppContext after hydration):
  1. `notifyWelcomeBack` — when document becomes visible after >1h hidden.
  2. `notifyViceCheck` — every 4 hours.
  3. `notifyEndOfDay` — once at 20:00 local, deduplicated by `localStorage['sg_eod_notif_sent'] = YYYY-M-D`.

---

## 8. UI / Design System

- **Background:** `#0a0e1a` deep navy. Page wrappers use `radial-gradient(ellipse_at_top, ...)`.
- **Accent palette:** cyan-400 (#00d4ff), emerald-400/teal (#00ff87), amber (warnings), rose-500 (breach/forfeit), fuchsia (rewards).
- **Glow/shadow language:** `drop-shadow(0 0 Npx rgba(...))` and `boxShadow: 0 0 Npx <color>`.
- **Typography:** `Inter` for sans (body), `JetBrains Mono` for all numerals/labels (`font-mono`), `Share Tech Mono` available as `.font-tactical` (rare). All loaded via Google Fonts `<link>` from `styles.css`.
- **Common micro-styles:**
  - `tracking-[0.3em]` / `[0.4em]` for uppercase mono labels
  - Glassmorphism cards: `bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl`
  - Premium glassmorphism (LevelGuide): `bg-white/[0.02]`, `bg-cyan-500/10`, `ring-1 ring-cyan-500/20`, `shadow-[0_0_20px_rgba(6,182,212,0.15)]`
- **Keyframes (in `styles.css`):** `flicker`, `gradient-cycle`, `header-scan`, `ripple-pop`, `vault-pulse`, `vault-glow-breathe`, `vault-ready-pulse`, `payload-drain`, `shimmer`, `contract-scan`. Most components use `style={{ animation: '... infinite' }}` rather than Tailwind animate utilities.
- **Custom utility classes:** `.bg-cyber-mesh`, `.xp-power-cells`, `.scanline-effect`, `.header-scanline`, `.payload-decay-bar`, `.cta-ripple`, `.custom-scrollbar-hide`.
- **No tailwind.config.js** — only `@theme inline` block in `styles.css` defines tokens.

---

## 9. Persistence, Backup, Currency

- Settings → Backup & Security → "Download Backup File" exports the entire `AppData` as `splurgeGuardData_v1_YYYY-MM-DD.json`.
- "Restore from Backup" → reads JSON, runs through `migrate()`, replaces state, hard-reloads.
- "Clear All Data" (Danger Zone, two-step confirm) → wipes localStorage and resets to `defaultData`.
- Currency toggle: button in dashboard header header pill cycles `displayCurrency`. `fmtMoney(vnd, currency, rate)` divides by `usdExchangeRate` for USD. Default rate: 26310. Editable in Settings.

---

## 10. PWA

- `public/manifest.json` + `/icon.png` registered in `__root.tsx`.
- `theme-color: #0a0e1a`.
- Install: Android Chrome ⋮ → Add to Home Screen; iOS Safari → Share → Add to Home Screen.
- Works offline after first load (no API calls).

---

## 11. Architectural Invariants & Gotchas

1. **Decoupled XP ledgers.** Never debit `lifetimeDP` or `ascensionXP` for an Exchange spend. Use `applyDPGain` for credits. Penalties subtract from `totalDP` and `ascensionXP` (clamped at 0) only.
2. **Stateless amortization.** Active payload decays are projected per-render from the transaction list. Never store/mutate a per-day breakdown array.
3. **Vault tick is global.** One 60s `setInterval` + `visibilitychange` listener in AppContext. Toast dedup via `notifiedReadyRef: useRef<Set<string>>`.
4. **Long-press gear-shifting.** `useLongPress` uses `savedCallback = useRef(callback)` updated in an effect to avoid stale closures across rapid re-renders.
5. **Cinematic ascension.** `pendingAscension` advances **one level at a time** (`currentLevel + 1`). On `_isMigrationLoad`, the monitor silently aligns `currentLevel` without showing the cinematic.
6. **Routes are file-based.** Never edit `routeTree.gen.ts`. The root file is `src/routes/__root.tsx` (no `_app/`, no `pages/`).
7. **No backend.** Don't add Supabase / Lovable Cloud / fetch calls unless explicitly requested. Notifications are foreground-only.
8. **Internal identifiers ≠ user copy.** Routes `/exchange`, functions like `forfeitProtocol`, `secureProtocol`, fields like `dailyContracts.status === 'yielded'` MUST stay. Only user-visible strings follow the rebrand vocabulary.
9. **Both `amortizeDays` and `amortizationDays` are written** on new transactions for forward+back compatibility. Always read via `txLifespan(tx)`.
10. **Server runtime.** This template targets Cloudflare Workers; never add Node-only deps. There is no real backend in this app — but if one is ever added, follow the project's TanStack server-function rules.

---

## 12. Contribution Cheat Sheet

| If asked to… | Edit |
|---|---|
| Change a daily contract title/reward | `src/lib/contracts.ts` |
| Add/rename a category | `src/lib/splurge-types.ts` (`ESSENTIAL_CATEGORIES`/`DISCRETIONARY_CATEGORIES`) + icon maps in `routes/stats.tsx` & `components/splurge/LogSheet.tsx` |
| Change a rank's title/threshold/quote | `src/lib/ranks.tsx` `RANKS[]` |
| Tweak XP awards/penalties | `src/lib/splurge-utils.ts` (`dpForAmount`, `milestoneBonus`) and the daily-check / breach blocks in `src/context/AppContext.tsx` |
| Change daily-limit math | `calcSmartDailyLimit` in `src/lib/splurge-utils.ts` |
| Add a Freedom Engine milestone | `src/lib/milestones.ts` |
| Add a reward archetype | `src/lib/archetypes.ts` |
| Vault delay options | `src/components/splurge/LogSheet.tsx` (cooling-period grid) |
| Amortization buckets | Same file (`[1,3,7,14,30]` array) |
| Bottom-nav order/labels | `src/components/splurge/BottomNav.tsx` (don't change the route paths) |
| Onboarding fields | `src/components/splurge/Onboarding.tsx` + `initUser` in `AppContext.tsx` + add to `UserState` |
| Notification copy/timing | `src/lib/notifications.ts` + intervals in `AppContext.tsx`'s notification effect |
| Cinematic visuals/timing | `src/components/splurge/AscensionCinematic.tsx` (`HOLD_DURATION_MS`) |
| Hold-to-confirm length on contracts | `HoldSecureButton.tsx` `durationMs` (default 1500) |
| Forfeit confirmation cooldown | `ForfeitModal.tsx` `cooldownMs` (default 1500) |
| Global colors / keyframes | `src/styles.css` |
| Migration logic for legacy users | `migrate()` at top of `src/context/AppContext.tsx` |

**Default workflow rules:**
- Use semantic Tailwind classes; reach for inline `style={{ ... }}` only for dynamic colors derived from rank/glow.
- Do NOT introduce a tailwind.config.js. Add tokens to `@theme inline` in `styles.css`.
- Always update both `amortizeDays` AND `amortizationDays` when writing transactions.
- When adding any DP credit path, use `applyDPGain` — do not hand-roll three writes.

---

## 13. Glossary

| Term | Meaning |
|---|---|
| **DP** | Discipline Points. Two ledgers: `totalDP` (spendable) and `ascensionXP` (rank). |
| **Ascension XP** | Append-only positive accumulator that drives the rank tree. |
| **Rank / Level** | One of 10 entries in `RANKS` (NPC → Sovereign Sigma). |
| **Cycle** | Period from `cycleStartDate` to `paydayDate`. |
| **Smart Daily Limit** | Per-render computed safe daily discretionary spend. |
| **Vault** | Cooling buffer for impulse purchases. Items go cooling → ready → approved or discarded. |
| **Cooling** | Vault state while delay hours haven't elapsed. |
| **Ready / Resolution Phase** | Cooling complete, awaiting Claim or Discard decision. |
| **Discard / Impulse Defeated** | User chose not to buy → +50 DP, capital flows to Freedom Engine. |
| **Vice / Target Habit** | Single user-named bad-habit category with weekly cap and bonus rules. |
| **Daily Protocol Contract** | One of 4 randomized daily micro-challenges. Internal status enum: `available | secured | yielded`. |
| **Payload Decay** | Statelessly amortized expense (1, 3, 7, 14, 30 days). |
| **Freedom Engine** | Sum of discarded vault `estimatedAmountVND`, mapped to 50+ milestones. |
| **Burn Rate** | Stats comparison of cycle-time-elapsed vs budget-spent. |
| **Vice Firewall** | 14-day color-coded grid of daily discretionary vs Smart Daily Limit. |
| **Breach** | Today's discretionary slice would exceed Smart Daily Limit. -25 DP, streak reset, BreachModal. |
| **Cinematic** | Full-screen rank-up ceremony, 3s hold to confirm. |
| **Operator Card / Sovereign Card** | Dashboard's top "ID" card with avatar, rank, XP bar. |
| **Status Ring / Reactor** | Center dashboard widget. Outer ring = daily limit. Inner ring = weekly habit. |
| **Integrity Modal** | Exchange's "Not enough DP yet" intervention dialog. |

---

*End of context document. When in doubt: read the source file from the cheat sheet, follow the invariants in §11, and obey the copy rules in §1.*
