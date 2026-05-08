<div align="center">
  <img src="public/logo-192.png" alt="SplurgeGuard Logo" width="120" />

  # SplurgeGuard
  
  **Personal finance, engineered for human psychology.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Zero Knowledge](https://img.shields.io/badge/Privacy-100%25_On--Device-00ff87?style=for-the-badge)](#-zero-knowledge-architecture)
</div>

---

## The Paradigm Shift

Most financial tools are built like rear-view mirrors. They passively log your transactions, generating charts of money you have already lost. They rely on guilt after the fact.

**SplurgeGuard is an active intercept system.** We didn't set out to build another expense tracker; we built a financial bodyguard. SplurgeGuard introduces a premium, gamified architecture designed to intervene at the exact moment of an impulse decision. It introduces calculated friction, aligns dopamine with discipline, and completely reimagines how you interact with your capital.

---

## Core Infrastructure

### 🎯 The Vice Engine (Dynamic Habit Targeting)
Not all spending is equal. The Vice Engine allows you to isolate and target your specific behavioral vulnerabilities—whether that's fast food delivery, in-app purchases, or daily coffee runs. By establishing a custom perimeter around a single habit, the system rewards you for targeted restraint.

### 🔒 The Vault (Asynchronous Gratification)
Impulse thrives on speed. The Vault neutralizes it with time. When the urge to make an unplanned purchase strikes, you lock the request inside the Vault. You define the cooling-off period (1 hour to 30 days). The system actively rewards you with Discipline Points (DP) while the timer counts down. If the item still holds value when the Vault opens, the purchase is cleared. 

### ⚡ Incentive Architecture (DP & Streaks)
Discipline should be immediately rewarding. SplurgeGuard runs on a strictly calibrated gamification engine:
- **Daily Adherence:** +50 DP for operating within your algorithmic daily limit.
- **Milestone Multipliers:** Exponential bonuses for maintaining 3, 7, and 14-day operational streaks.
- **Consequence Protocols:** Breaching the daily limit results in an immediate -25 DP penalty and a total streak reset.

### 📉 Stateless Amortization
A 12-month software subscription shouldn't destroy today's daily limit. Our Amortization Engine mathematically depreciates large, bulk expenses day-by-day. This stateless projection maintains the integrity of your daily gamification without complex accounting overhead.

---

## 🛡️ Zero-Knowledge Architecture

Your financial data is yours. Period.

SplurgeGuard is engineered as a 100% offline Progressive Web App (PWA). There are no backend databases, no telemetry, no cloud syncing, and no analytics harvesting. Every calculation, transaction, and state change occurs entirely within the sandboxed local storage of your device. We cannot see your data, and neither can anyone else.

---

## A Peek Inside

| Your Dashboard | Your Spending Habits | Settings & Setup |
| :---: | :---: | :---: |
| <img src="PASTE_LINK_1_HERE" width="250"/> | <img src="PASTE_LINK_2_HERE" width="250"/> | <img src="PASTE_LINK_3_HERE" width="250"/> |

---

## 🛠️ Tech Stack

Built on modern, performant web primitives to deliver a native-tier experience:
- **Core:** React 18
- **Build System:** Vite
- **Interface & Styling:** Tailwind CSS (Custom glassmorphism & deep radial gradients)
- **Iconography:** Lucide-React
- **State Management:** Custom React Hooks leveraging isolated `localStorage`
- **Deployment:** Full PWA spec with custom manifest for iOS/Android native installation

---

## 💻 Developer Initialization

To deploy SplurgeGuard locally or audit the gamification algorithms:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Mahmoud-Ashraf98/SplurgeGuard.git](https://github.com/Mahmoud-Ashraf98/SplurgeGuard.git)
