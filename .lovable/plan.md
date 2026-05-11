## Goal

Replace the existing `README.md` with a brand-new, marketing-grade README that accurately documents every system currently shipping in SplurgeGuard, including features added since the last README (Daily Protocol contracts, Freedom Engine milestones, Tactical Burn Rate, Vice Firewall Matrix, Payload Decay, Tactical Audit Trail, foreground notifications, React 19 / TanStack Start stack).

## Structure of the new README

1. **Hero block**
   - Title + tagline: "Your money has a bodyguard now."
   - One-paragraph pitch: dark-styled, gamified, 100% offline Financial RPG that intercepts impulse spending in real time.
   - Live link: https://splurgeguard.lovable.app

2. **The "11 PM Problem"** — short emotional hook (kept from old README, tightened).

3. **Screenshots grid** — placeholder table for Dashboard, Vault, Stats, Exchange, Ascension. Mention drag-drop instructions.

4. **Core Systems (the meat — fully refreshed)**
   - **The Ascension Protocol** — 10 Ranks (Initiate → Sovereign), `ascensionXP` drives promotions and demotions, danger-zone warnings when within 100 XP of demotion threshold, cinematic level-up sequence.
   - **The Daily Protocol (NEW)** — 4 fresh micro-contracts issued every midnight (Grab Boycott, Caffeine Fast, Shopee Shield, Hawker Reserve, Boba Defiance); Secure (+reward DP) or Yield (−penalty DP); auto-refreshes via `lastContractRefreshDate`.
   - **The Vault** — cooling → ready → approved/discarded lifecycle; global 60s tick + visibility-change check; "Claim Item" / "Discard Impulse" actions on ready items; toast when an item unlocks.
   - **Smart Daily Limit** — dynamic per-day budget computed from balance, days-to-payday, proximity weighting, and unamortized bulk expenses (`calcSmartDailyLimit`).
   - **Payload Decay (Amortization)** — bulk costs (e.g., annual subs) get spread across N days with an animated decay bar in Stats.
   - **The Vice Engine** — single-target habit with weekly limit; zero DP for direct buys, bonus DP through Vault, +250 DP for staying under weekly cap.
   - **The Exchange (Reward Store)** — Archetype-based reward catalog; Integrity Modal blocks unaffordable redemptions; spending DP debits `totalDP` only — `ascensionXP` is protected.

5. **Tactical Stats Suite (NEW section)**
   - **Freedom Engine** — capital preserved from discarded vault items, current secured milestone, progress to next from the 50-tier `MILESTONES` ladder (50K VND → "Sovereign Sigma" at 3B VND).
   - **Tactical Burn Rate Gauge** — cycle-time vs budget-spent dual bars with breach warning.
   - **Vice Firewall Matrix** — 14-day grid: emerald (perfect), cyan (controlled), rose pulse (breach) per day vs smart limit.
   - **Tactical Audit Trail** — 3-line terminal-log transactions, color-coded (emerald=essential / rose=discretionary), `[REVERT]` command instead of trash icon.

6. **Discipline Points Economy table** — refreshed numbers:
   | Action | DP / XP |
   |---|---|
   | Stay under daily limit | +50 |
   | Log expense (sub-50K → 200K → larger) | +5 / +3 / +1 |
   | 3 / 7 / 14-day streak bonus | +100 / +300 / +750 |
   | Secure a Daily Protocol contract | +10 to +20 |
   | Discard a Vault impulse | (preserved capital, no DP loss) |
   | Beat weekly vice limit (Mondays) | +250 |
   | Exceed daily limit | −25 + streak reset |
   | Miss a day | −10/day (capped at 50) |
   | Yield a contract | −10 to −20 |

7. **Notifications & PWA** — foreground notification engine (welcome-back after 1 hour away, vice check every 4 hours, end-of-day at 20:00); installable via Add to Home Screen on Android/iOS; works fully offline after first load.

8. **Zero-Knowledge Architecture** — 100% local storage, no backend, JSON export/import in Settings, multi-currency (VND ↔ USD).

9. **Install / Dev section**
   ```bash
   git clone …
   bun install
   bun run dev
   ```
   Stack: **React 19, TanStack Start, TanStack Router, Vite 7, Tailwind CSS v4, Radix UI, Sonner, Lucide React, Zod**. Zero backend.

10. **Architecture Notes Worth Reading**
    - Decoupled XP engine (`totalDP` vs `ascensionXP`) — Exchange spends don't risk demotion.
    - Stateless amortization in `calcSmartDailyLimit`.
    - Global 60s vault tick + `visibilitychange` rehydration for battery-friendly cooling.
    - Programmatic SVG rank avatars for instant offline render.
    - Migration guard: legacy data without `ascensionXP` / `dailyContracts` is auto-seeded on load.

11. **Philosophy / Contributing** — "Make friction. Reward restraint. Stay offline."

## Files touched

- `README.md` — full rewrite (single file).

No code, dependencies, or app behavior change.
