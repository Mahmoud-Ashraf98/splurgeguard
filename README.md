# SplurgeGuard

### Your money has a bodyguard now.

_The gamified, 100% offline financial RPG engineered to intercept impulse spending before it happens._

## 😤 You know this feeling.

It is 11pm. You are tired. You open your phone and suddenly you _need_ those sneakers. Or that food delivery. Or that thing you have been trying to stop buying.

Two minutes later, the money is gone. The dopamine fades in 20 seconds. And you are left refreshing your bank balance wondering where the month went.

> **SplurgeGuard was built for exactly that moment.** Not to judge you after the fact, but to intercept you _before_ you tap "confirm order."

## 📸 The Interface

_(Drag and drop your updated screenshots here!)_

| 🏠 The Dashboard | 🛍️ The Exchange | 👑 Ascension Protocol |
| --- | --- | --- |
|  |  |  |

## 🔧 Five systems. One mission: Stop you from wasting money.

### 📈 1. The Ascension Protocol (RPG Leveling)

#### _From NPC to Sovereign Sigma._

SplurgeGuard turns your financial discipline into a character progression tree. You earn `ascensionXP` for every act of restraint.

You begin at **Level 1 (The NPC)** — a mindless consumer controlled by algorithms. As you lock in your perimeter, you evolve through ranks like **The Doomer**, **Paper Hands**, **The Chad**, and **Diamond Hands**, culminating at **Level 10: Sovereign Sigma**.

_But there are real stakes:_ If you breach your daily limits, you lose XP. Breach too hard, and the app will aggressively demote your rank.

### 🛍️ 2. The Exchange (Reward Store)

#### _Convert discipline into real-world treats._

When you earn Discipline Points (DP), you spend them here. Select from pre-defined Archetypes (like a Late-Night Fast Food run, a Shopee Checkout, or a Da Nang Weekend Getaway) or create your own.

If you try to redeem a reward you can't afford, the **Integrity Modal** intercepts you, asking you to "Hold the line" and earn the points honestly instead of cheating your future self.

### 🔒 3. The Vault

#### _"Sleep on it" — but mandatory._

When the urge hits, you **lock the purchase in the Vault**. The app physically prevents you from buying it until the timer reaches zero. The longer you wait, the more DP you earn. If you still want it when the Vault opens, buy it guilt-free. If you forgot about it — that's the point.

### 📊 4. Smart Daily Limit

#### _A budget that thinks for itself._

You input your available budget and payday. Every day it calculates exactly how much you can safely spend _today_. Not a fixed number. A dynamic, intelligent one that loosens slightly as you prove your discipline closer to payday. Stay under it to earn points; break it, and watch your XP drop.

### 🎯 5. The Vice Engine

#### _Isolate and crush your worst habit._

Name your specific weakness (e.g., delivery apps, coffee, gacha games). The app applies a separate, brutal ruleset to that category:

- **Buy it directly?** Zero DP earned.
- **Run it through the Vault first?** Bonus points.
- **Stay under your weekly limit?** Massive +250 DP bonus.

## ⚡ Discipline Points Economy

The hardest part of financial discipline is that restraint is invisible. SplurgeGuard fixes this by gamifying your restraint:

| Action | Points / XP |
| --- | --- |
| ✅ Stay under your daily limit | **+50** |
| 📝 Log any expense (friction matters) | **+1 to +5** |
| 🔥 3/7/14-day streaks | **+100 to +750** |
| 🔒 Vault a vice purchase | **+15 per 24h** |
| 🗑️ Discard a Vault item | **+10** |
| 💪 Beat your weekly vice limit | **+250** |
| ❌ Exceed your daily limit | **−25 & Streak Reset** |
| 😴 Miss a day entirely | **−10 per day** |

_(Note: Spending DP in The Exchange reduces your spendable balance, but does NOT reduce your `ascensionXP`. Your rank is safe as long as you don't breach your limits!)_

## 🛡️ Zero-Knowledge Architecture

SplurgeGuard runs **100% inside your browser's local storage.** There is no backend. No cloud sync. The app cannot transmit your data because it has nowhere to send it.

Your financial habits, notes, and progress never leave your device. Export a full JSON backup at any time to sync manually between devices.

## 📱 Install it like a native app

**On Android (Chrome):** Open [splurgeguard.lovable.app](https://splurgeguard.lovable.app/) > Three-dot menu > **Add to Home Screen**.
**On iPhone (Safari):** Open [splurgeguard.lovable.app](https://splurgeguard.lovable.app/) > Share button > **Add to Home Screen**.

Works fully offline after the first load.

## 🛠️ For Developers

```bash
git clone https://github.com/Mahmoud-Ashraf98/splurgeguard.git
cd splurgeguard
npm install
npm run dev
```

**Stack:** React 18, Vite, Tailwind CSS, TanStack Router. Zero Backend.

**Architecture Notes Worth Reading:**

- **Decoupled XP Engine:** `totalDP` and `ascensionXP` are decoupled. Positive actions increment both. The Exchange only debits `totalDP`. Breaches penalize _both_. This allows users to spend points without terrifying them into hoarding to protect their RPG Rank.
- **"Gear-Shifting" Hooks:** The Exchange stepper uses a custom `useLongPress` hook with recursive `setTimeout` logic and a latest-callback-ref pattern. It shifts "gears" the longer you hold it (jumping by 50, then 500) to allow massive 60,000 DP selections without stale React closures or mobile OS magnifier interference.
- **SVG Avatars:** All "Master POV" rank avatars are purely programmatic inline SVGs to ensure instantaneous offline loading.
- **Stateless Amortization:** Bulk expenses are projected statelessly across future daily limits on every render, avoiding complex stored array state manipulation.

## 🤝 Contributing

Built for real personal use. If you find a bug or have an idea that fits the core philosophy:

> **Make friction. Reward restraint. Stay offline.**

Open an issue or a PR.
