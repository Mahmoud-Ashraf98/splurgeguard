<div align="center">

<img src="public/logo-192.png" alt="SplurgeGuard" width="100" />

# SplurgeGuard

### Your money. Your rules. Zero excuses.

**The app that fights back when your impulses try to win.**

[![Live App](https://img.shields.io/badge/Try%20It%20Live-splurgeguard.lovable.app-00ff87?style=for-the-badge)](https://splurgeguard.lovable.app)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-0a0e1a?style=for-the-badge)](#your-data-never-leaves-your-phone)
[![PWA](https://img.shields.io/badge/Install%20as%20App-iOS%20%26%20Android-00d4ff?style=for-the-badge)](#install-it-like-a-native-app)

</div>

---

## You know the feeling.

It's 11pm. You're tired. You open your phone and suddenly you *need* those sneakers. Or that food delivery. Or that thing you've been trying to stop buying.

Two minutes later, the money is gone. The dopamine fades in 20 seconds. And you're left refreshing your bank balance wondering where the month went.

**SplurgeGuard was built for exactly that moment.**

---

## What it actually does

<div align="center">

| Your Dashboard | Spending Breakdown | Settings |
|:---:|:---:|:---:|
| <img src="https://raw.githubusercontent.com/Mahmoud-Ashraf98/splurgeguard/refs/heads/main/Screenshot_20260508_143007_Chrome.jpg" width="220"/> | <img src="https://raw.githubusercontent.com/Mahmoud-Ashraf98/splurgeguard/refs/heads/main/Screenshot_20260508_143018_Chrome.jpg" width="220"/> | <img src="https://raw.githubusercontent.com/Mahmoud-Ashraf98/splurgeguard/refs/heads/main/Screenshot_20260508_143048_Chrome.jpg" width="220"/> |

</div>

Instead of letting you spend freely and showing you the damage later, SplurgeGuard intervenes *before* the transaction. Every feature is designed around one uncomfortable truth: **your future self and your present self want completely different things.**

---

## The four weapons

### The Vault - "Sleep on it" made mandatory

When you feel an impulse purchase coming, you lock it in the Vault instead of buying it immediately. You pick a cooling-off timer: 1 hour, 48 hours, a week - you decide. The app *physically prevents you from buying it* until the timer ends.

Here's the clever part: **the longer you wait, the more Discipline Points you earn.** The app pays you to resist. If the item still feels worth it when the Vault opens, you buy it guilt-free. If you forget about it entirely, that's the whole point.

> *Most Vault items never get purchased. And most of the time, you don't even miss them.*

---

### Smart Daily Limit - Your personal spending budget, calculated fresh every day

Tell the app your available budget and your next payday. Every morning, it calculates exactly how much you can safely spend *today* on non-essentials - accounting for how many days are left in your cycle.

The limit is not fixed. It's intelligent:

- **Approaching payday?** Your limit loosens slightly (you've proven you can hold it together).
- **Just got paid?** Your limit is conservative (don't blow it all on day one).
- A big status ring on your home screen fills up as you spend. Green to Yellow to Red. Simple. Visceral.

---

### The Vice Engine - Target the one thing you actually overspend on

Most budgeting apps treat all spending the same. They don't. *You* don't.

You pick your specific weakness - delivery apps, clothes, supplements, whatever it is - and name it. The app then tracks that category separately with its own weekly limit, its own penalties for direct-buying, and bonus points if you run it through the Vault first.

It's not about judging your choices. It's about making your specific pattern of overspending genuinely harder to repeat.

---

### Discipline Points - Making restraint actually feel good

The hardest part of financial discipline is that saying "no" feels like nothing. No reward, no feedback, no dopamine. Just a quiet absence of spending.

SplurgeGuard fixes this with a points economy:

| Action | Points |
|---|---|
| Stay under your daily limit | **+50 DP** |
| Log any expense (friction matters) | **+1 to +5 DP** |
| 3-day streak without breaking | **+100 DP bonus** |
| 7-day streak | **+300 DP bonus** |
| 14-day streak | **+750 DP bonus** |
| Vault a purchase instead of buying direct | **Bonus DP while it cools** |
| Discard a Vault item (chose not to buy) | **+10 DP** |
| Break your daily limit | **-25 DP + streak reset** |
| Miss a day entirely | **-10 DP per missed day** |

Spend your accumulated DP on real-life rewards you define for yourself. The points are yours to cash in however you want.

---

## Bonus: Amortization - for the big, smart purchases

Bought a year of a software subscription? Stocked up on three months of something in bulk? Those shouldn't crater your daily limit for one day and then disappear.

Toggle **"Spread Cost Over Time"** when logging an expense. Set the number of days. The cost is mathematically distributed across that window, so your daily limit takes a small, manageable hit each day instead of a single brutal deduction.

---

## Your data never leaves your phone

This is not a cloud app with a privacy policy you'll never read.

SplurgeGuard runs **100% inside your browser's local storage**. There is no server. There is no database. There is no account to create. No email address required. The app cannot phone home because it has no home to phone.

Your financial habits, your justification notes, your vice category - none of it is ever transmitted anywhere. Not to us. Not to anyone.

You can export your data as a JSON backup file at any time and restore it on any device. That's your escape hatch and your only sync mechanism, by design.

---

## Install it like a native app

SplurgeGuard is a Progressive Web App (PWA). No app store required.

**On Android (Chrome):**
1. Open [splurgeguard.lovable.app](https://splurgeguard.lovable.app) in Chrome
2. Tap the three-dot menu in the top right
3. Tap **"Add to Home Screen"**
4. Done. It lives on your home screen like any other app.

**On iPhone (Safari):**
1. Open [splurgeguard.lovable.app](https://splurgeguard.lovable.app) in Safari
2. Tap the **Share** button at the bottom
3. Tap **"Add to Home Screen"**
4. Done.

Works offline. Loads instantly. No updates to approve.

---

## For developers

Want to run it locally, audit the gamification logic, or fork it for your own use?

```bash
git clone https://github.com/Mahmoud-Ashraf98/splurgeguard.git
cd splurgeguard
npm install
npm run dev
```

**Stack:**
- React 18 + Vite
- Tailwind CSS (custom glassmorphism, deep radial gradients)
- TanStack Router (file-based routing)
- Sonner (toast notifications)
- Lucide React (iconography)
- Zero external dependencies at runtime - no APIs, no analytics, no tracking

**Storage:** One `localStorage` key (`splurgeGuardData_v1`), fully typed, JSON-serialized on every write.

**Architecture highlights:**
- Smart Daily Limit uses proximity-weighted formula: `(balance / daysLeft) * proximityWeight` where weight scales 1.0 to 1.2 across the pay cycle
- Vault timers use absolute `Date.now()` comparisons (not tick counting) - survives app backgrounding and sleep mode
- Expense amortization runs as a stateless projection on every render - no stored daily state
- Full gamification engine in `AppContext.tsx` covers 9 business rules across logging, streaks, vault behaviour, and missed-day penalties

---

## Contributing

This is a personal finance tool built for real use. If you find a bug or have a feature idea that fits the philosophy - **make friction, reward restraint, stay offline** - open an issue or a PR.

---

<div align="center">

**Built with React. Powered by stubbornness.**

[Try it now](https://splurgeguard.lovable.app)

</div>
