# SplurgeGuard

### Your money has a bodyguard now.

_A dark-styled, gamified, **100% offline** Financial RPG engineered to intercept impulse spending in real time — before the dopamine hits, before the regret lands._

🔗 **Live app:** [splurgeguard.lovable.app](https://splurgeguard.lovable.app)

---

## 😤 The 11 PM Problem

It is 11 PM. You are tired. You open your phone and suddenly you _need_ those sneakers. Or that food delivery. Or that thing you have been swearing off for a month.

Two minutes later, the money is gone. The dopamine fades in 20 seconds. And you are left refreshing your bank balance wondering where the month went.

> **SplurgeGuard was built for exactly that moment.** Not to scold you afterwards — to physically intercept you _before_ you tap "confirm order."

---

## 📸 The Interface

_(Drop your latest screenshots into the cells below.)_

| 🏠 Dashboard | 🔒 The Vault | 📊 Tactical Stats | 🛍️ The Exchange | 👑 Ascension |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

---

## 🔧 Core Systems

### 📈 1. The Ascension Protocol — Financial RPG Leveling

A 10-rank progression tree driven by a dedicated `ascensionXP` counter that **only ever moves on real discipline events** — never on Exchange spending.

- **10 Ranks** from **Initiate** through milestones like **The Doomer**, **Paper Hands**, **The Chad**, **Diamond Hands**, all the way to **Sovereign Sigma**.
- **Cinematic Level-Up Sequence** triggers automatically the moment a new threshold is crossed.
- **Demotions are real.** Breach your daily limits enough and you _lose_ ranks — complete with a brutal `DEMOTION` toast.
- **Danger Zone Warning.** When you sit within 100 XP of a demotion threshold, a pulsing red bar appears on the Dashboard.

### 🗓️ 2. The Daily Protocol — Micro-Contracts

Every midnight, a fresh board of **4 randomized tactical contracts** appears on the Dashboard:

- **The Grab Boycott** — drive your own bike. _+15 / −15 DP_
- **Caffeine Fast** — skip the cafe. _+10 / −10 DP_
- **The Shopee Shield** — zero flash-sale checkouts. _+20 / −20 DP_
- **Hawker Reserve** — cook at home. _+15 / −15 DP_
- **Boba Defiance** — walk past the tea shop. _+10 / −10 DP_

You **Secure** the contract to claim the reward, or **Yield** to take the penalty. Refresh is automatic — no streak hostage situations.

### 🔒 3. The Vault — Mandatory "Sleep On It"

When the urge hits, you don't buy. You _vault_ it.

- Item enters **`cooling`** state with your chosen delay (4h → 168h).
- A global 60-second tick + `visibilitychange` rehydration flips it to **`ready`** the moment the timer hits zero — battery-friendly, no foreground required.
- An unlock toast fires _once_ per item (deduplicated via ref).
- On `ready`: tap **Claim Item** to log the spend, or **Discard Impulse** to feed your **Freedom Engine** (see below).

### 📊 4. Smart Daily Limit — A Budget That Thinks

`calcSmartDailyLimit` recomputes every render from:

- Current cycle balance
- Days remaining until payday
- Proximity weighting (loosens slightly as you prove discipline)
- Live deduction of every active **Payload Decay** (amortized) drain

Stay under it → **+50 DP** the next morning. Breach it → **−25 DP, streak reset, breach modal**.

### 🌊 5. Payload Decay — Stateless Amortization

Bulk one-time costs (annual subscriptions, gear, flights) get spread over N days. The Stats screen visualizes each one as an **animated decay bar** draining from full → empty in real time. The math is fully stateless — projected on every render, never stored as mutable arrays.

### 🎯 6. The Vice Engine — Crush Your Worst Habit

Name your single weakness (delivery apps, coffee, gacha, boba). It gets a separate, brutal ruleset:

- **Buy directly?** Zero DP earned.
- **Vault it first?** Bonus DP on claim.
- **Stay under your weekly cap (Mon → Sun)?** Massive **+250 DP** every Monday morning.

### 🛍️ 7. The Exchange — Reward Store with Integrity

Convert hard-earned DP into pre-defined **Archetype rewards** (Late-Night Fast Food, Shopee Checkout, Da Nang Weekend) or define your own.

- Try to redeem something you can't afford → the **Integrity Modal** intercepts you. Hold the line. Earn it honestly.
- **Spending DP debits `totalDP` only.** Your `ascensionXP` is bulletproof — you can never spend yourself into a demotion.

---

## 📊 Tactical Stats Suite

A full intelligence dashboard with four hand-built modules:

### 🚀 Freedom Engine
Tracks **total capital preserved** from every discarded vault impulse, mapped against a **50-tier milestone ladder** ranging from `50K VND` early-game all the way up to billion-dong "Sovereign Sigma" tiers. Shows your currently secured milestone + animated progress bar to the next.

### ⏱️ Tactical Burn Rate Gauge
Side-by-side dual bars: **% of cycle elapsed** vs **% of fun-budget burned**. If burn outpaces time, the bar flares red — you are eating the future.

### 🛡️ Vice Firewall Matrix
A 14-day grid of your discretionary spending vs your Smart Daily Limit:
- 🟢 **Emerald** — perfect day (zero discretionary)
- 🔵 **Cyan** — controlled (under limit)
- 🔴 **Rose, pulsing** — breach
- Hover any cell for date + amount

### 🧾 Tactical Audit Trail
Transactions render as a **3-line terminal log**: category + `[VAULT]/[DIRECT]` tag, timestamp, optional `> "justification"` quote. Color-coded (emerald = essential, rose = discretionary). Each row ships with a `[REVERT]` command instead of a destructive trash icon.

---

## ⚡ Discipline Points Economy

| Action | DP / XP |
| --- | --- |
| ✅ Stay under daily limit | **+50** |
| 📝 Log expense (sub-50K / sub-200K / larger) | **+5 / +3 / +1** |
| 🔥 3-day streak bonus | **+100** |
| 🔥 7-day streak bonus | **+300** |
| 🔥 14-day streak bonus | **+750** |
| 📜 Secure a Daily Protocol contract | **+10 to +20** |
| 🗑️ Discard a Vault impulse | _Capital preserved → Freedom Engine_ |
| 💪 Beat weekly vice limit (Mondays) | **+250** |
| ❌ Exceed daily limit | **−25 + streak reset** |
| 😴 Miss a day entirely | **−10/day (capped at −50)** |
| 📜 Yield a contract | **−10 to −20** |

> **Critical:** Spending DP in the Exchange reduces `totalDP` _only_. Your `ascensionXP` and Rank are protected. Treat yourself without fear.

---

## 🔔 Notifications & PWA

A foreground notification engine fires while the app is open:
- **Welcome Back** after returning from 1+ hour away
- **Vice Check** every 4 hours
- **End-of-Day Recap** at 20:00 (deduplicated per day via localStorage)

Install it like a native app:
- **Android (Chrome)** → ⋮ → **Add to Home Screen**
- **iOS (Safari)** → Share → **Add to Home Screen**

Works fully offline after the first load.

---

## 🛡️ Zero-Knowledge Architecture

SplurgeGuard runs **100% inside your browser's local storage.** No backend. No cloud sync. No analytics. The app cannot transmit your data because it has nowhere to send it.

- Full **JSON export/import** in Settings for manual cross-device sync
- Native **VND ↔ USD currency toggle** with custom exchange rate
- Migration guard: legacy data without `ascensionXP` or `dailyContracts` is auto-seeded on first load

---

## 🛠️ For Developers

```bash
git clone https://github.com/Mahmoud-Ashraf98/splurgeguard.git
cd splurgeguard
bun install
bun run dev
```

**Stack:** React 19 · TanStack Start · TanStack Router · Vite 7 · Tailwind CSS v4 · Radix UI · Sonner · Lucide React · Zod. **Zero backend.**

### Architecture Notes Worth Reading

- **Decoupled XP Engine.** `totalDP` (spendable) and `ascensionXP` (rank) are intentionally separate ledgers. Positive actions credit both. Exchange purchases debit only `totalDP`. Breaches penalize both. Result: users spend rewards without panic-hoarding.
- **Stateless Amortization.** Active payload decays are projected into the Smart Daily Limit on every render — no stored array mutation, no stale state edge cases.
- **Battery-Friendly Vault.** A single global 60s `setInterval` + `visibilitychange` listener flips cooling items to ready. Toasts deduplicate via `useRef<Set>` so resuming the app never spams notifications.
- **Programmatic SVG Avatars.** Every Rank avatar is inline SVG — no image fetches, instant offline render.
- **Long-Press Gear-Shifting.** The Exchange DP stepper uses recursive `setTimeout` with a latest-callback ref pattern to shift gears (×50 → ×500) on hold — supports 60K+ DP picks without stale closures.
- **Cinematic Level-Up.** A dedicated overlay listens to `pendingAscension` and fires a full-screen rank reveal sequence, then advances the user one rank at a time.

---

## 🤝 Contributing

Built for real personal use. If you find a bug or have an idea that fits the core philosophy:

> **Make friction. Reward restraint. Stay offline.**

Open an issue or a PR.
