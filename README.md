<div align="center">
  <img src="public/logo-192.png" alt="SplurgeGuard Logo" width="120" />

  # 🛡️ SplurgeGuard
  
  **Your Gamified, 100% Offline Financial Bodyguard.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Offline First](https://img.shields.io/badge/100%25-Offline-00ff87?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
</div>

---

## 🛑 The Problem
Traditional budgeting apps are passive. They just show you pie charts of money you've already lost. They do nothing to stop you in the heat of the moment when you're about to make an impulse purchase.

## 🟢 The Solution
**SplurgeGuard** is an active defense system against your own psychology. Built as a PWA with a premium "Cyberpunk Terminal" aesthetic, it acts as a strict financial bodyguard. It forces you to pause, rewards you for discipline, and safely amortizes large purchases so your daily budget doesn't spontaneously combust.

---

## ✨ Core Mechanics

### 🎯 Dynamic Habit Tracking (The "Vice" Engine)
Choose one specific habit you want to control (e.g., Vaping, In-App Purchases, Fast Food). SplurgeGuard tracks this specific category independently and rewards you with massive Discipline Point (DP) bonuses if you stay under your customized weekly limit.

### 🔒 The Vault (Delayed Gratification)
Got an urge to buy something you don't strictly need? Lock it in the Vault. You choose a cooling-off period (1 hour to 30 days). You earn DP just for waiting. If you still want it when the timer hits zero, you can buy it guilt-free. 

### 🔥 Discipline Points (DP) & Streaks
Gamification is baked into the math. 
- Stay under your Smart Daily Limit? **+50 DP**. 
- Hit a 3, 7, or 14-day streak? **Massive multiplier bonuses**.
- Blow past your daily limit? **-25 DP and a streak reset**. 

### 📉 The Amortization Engine
Bought a 1-year software subscription or a 3-month gym membership? SplurgeGuard won't punish you by draining your daily limit all at once. The Amortization Engine smoothly depreciates bulk expenses day-by-day statelessly, keeping your gamification fair and accurate.

---

## 🛡️ 100% Offline & Private
Your financial data, your justifications, and your habits are no one's business. 
SplurgeGuard operates completely offline using local device storage. **No databases, no cloud syncing, no tracking.** Your data never leaves your phone. You can export and import your state manually via the Settings control panel if you need to switch devices.

---

## 📸 Interface Sneak Peek

*(Replace these placeholder links with actual screenshots of your app once uploaded to your repo)*

| The Dashboard | The Stats Telemetry | The Control Panel |
| :---: | :---: | :---: |
| `<img src="path/to/home-screenshot.png" width="250"/>` | `<img src="path/to/stats-screenshot.png" width="250"/>` | `<img src="path/to/settings-screenshot.png" width="250"/>` |

---

## 🚀 Tech Stack & Architecture

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Heavy use of Glassmorphism & Custom Radial Gradients)
- **Icons:** Lucide-React
- **State Management:** Custom React Hooks tied to `localStorage`
- **PWA Ready:** Configured with `manifest.json` for native-like installation on iOS and Android.

---

## 💻 Local Development Setup

Want to run SplurgeGuard locally or tweak the gamification math?

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/SplurgeGuard.git](https://github.com/yourusername/SplurgeGuard.git)
