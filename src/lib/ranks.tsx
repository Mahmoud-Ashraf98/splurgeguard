import type { JSX } from 'react';

export interface Rank {
  level: number;
  threshold: number;
  title: string;
  quote: string;
  color: string;
  glowColor: string;
  renderAvatar: () => JSX.Element;
}

export const RANKS: Rank[] = [
  { level: 1, threshold: 0, title: 'The NPC', color: 'text-slate-500', glowColor: 'rgba(100,116,139,0.7)', quote: '"You are a passenger in your own life. The algorithm feeds you dopamine, and you hand over your paycheck. Wake up. The matrix is draining your wallet one late-night checkout at a time."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#64748b" opacity="0.4" />
      <circle cx="50" cy="50" r="40" fill="#64748b" opacity="0.9" />
      <circle cx="35" cy="45" r="4" fill="#0f172a" />
      <circle cx="65" cy="45" r="4" fill="#0f172a" />
      <path d="M 40 65 L 60 65" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ) },
  { level: 2, threshold: 1000, title: 'The Doomer', color: 'text-slate-400', glowColor: 'rgba(148,163,184,0.7)', quote: '"You\'ve realized the trap, but the urge to consume still controls you. You stare at your bank app wondering where it all went. The pain of discipline weighs ounces; the pain of being broke weighs tons."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 15 40 Q 15 10 50 10 Q 85 10 85 40 L 80 80 Q 50 95 20 80 Z" fill="#94a3b8" opacity="0.9" />
      <rect x="30" y="45" width="10" height="4" rx="1" fill="#0f172a" />
      <rect x="60" y="45" width="10" height="4" rx="1" fill="#0f172a" />
      <path d="M 30 52 Q 35 55 40 52 M 60 52 Q 65 55 70 52" stroke="#0f172a" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M 35 75 Q 50 70 65 75" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ) },
  { level: 3, threshold: 3000, title: 'Paper Hands', color: 'text-orange-400', glowColor: 'rgba(251,146,60,0.7)', quote: '"You want to save, but your resolve crumbles at the slightest temptation. Another milk tea, a late-night food delivery, a quick microtransaction, or just one more hobby pack. You tell yourself \'it is just a little treat,\' but these tiny leaks are sinking your ship. Stop negotiating with momentary cravings. If you can master the small urges today, you are laying the bricks for a life of absolute financial freedom tomorrow. Hold the line."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#fb923c" opacity="0.9" />
      <path d="M 50 5 L 45 20 L 55 30 L 48 45" stroke="#0f172a" strokeWidth="2" fill="none" />
      <circle cx="35" cy="45" r="6" fill="#0f172a" />
      <circle cx="65" cy="45" r="6" fill="#0f172a" />
      <circle cx="35" cy="45" r="2" fill="#fff" />
      <circle cx="65" cy="45" r="2" fill="#fff" />
      <path d="M 25 35 L 40 30 M 75 35 L 60 30" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <path d="M 40 70 Q 45 65 50 70 T 60 70" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 80 25 Q 85 35 80 40 Q 75 35 80 25 Z" fill="#60a5fa" opacity="0.8" />
    </svg>
  ) },
  { level: 4, threshold: 7000, title: 'Locked In', color: 'text-blue-400', glowColor: 'rgba(96,165,250,0.7)', quote: '"The noise of consumerism is finally starting to fade. You are ignoring the sales, the flashy ads, and the peer pressure. The foundation of real wealth is being poured. Stay focused."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 15 20 L 85 20 L 85 50 L 50 95 L 15 50 Z" fill="#60a5fa" opacity="0.9" />
      <path d="M 25 35 L 45 45 M 75 35 L 55 45" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      <path d="M 30 45 L 45 50 L 30 52 Z M 70 45 L 55 50 L 70 52 Z" fill="#0f172a" />
      <path d="M 40 75 L 60 75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ) },
  { level: 5, threshold: 12000, title: 'Based Earner', color: 'text-indigo-400', glowColor: 'rgba(129,140,248,0.7)', quote: '"You no longer work just to give your money back to mega-corporations. You control your capital. Friends wonder why you aren\'t splurging; you smile, knowing your net worth is quietly compounding."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="15" y="10" width="70" height="80" rx="20" fill="#818cf8" opacity="0.9" />
      <path d="M 10 40 L 90 40 L 85 55 Q 65 60 50 45 Q 35 60 15 55 Z" fill="#0f172a" />
      <path d="M 40 75 Q 55 80 65 70" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ) },
  { level: 6, threshold: 20000, title: 'The Architect', color: 'text-purple-400', glowColor: 'rgba(192,132,252,0.7)', quote: '"You are actively designing your financial perimeter. Impulse buys bounce off your armor. Every Discipline Point earned is a brick in the fortress of your future freedom. The blueprint is working."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 20 25 L 50 5 L 80 25 L 80 75 L 50 95 L 20 75 Z" fill="#c084fc" opacity="0.9" />
      <path d="M 20 50 L 80 50 M 50 5 L 50 95" stroke="#0f172a" strokeWidth="1" opacity="0.2" />
      <circle cx="35" cy="45" r="4" fill="#0f172a" />
      <circle cx="65" cy="45" r="8" fill="none" stroke="#0f172a" strokeWidth="2" />
      <circle cx="65" cy="45" r="3" fill="#38bdf8" />
      <path d="M 45 75 L 55 75" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ) },
  { level: 7, threshold: 30000, title: 'The Chad', color: 'text-emerald-400', glowColor: 'rgba(52,211,153,0.7)', quote: '"An absolute unit of financial stoicism. Marketers spend millions trying to hack your dopamine, and you don\'t even blink. You buy what you need, when you need it, on your own terms."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M 20 10 L 80 10 L 90 40 L 70 95 L 30 95 L 10 40 Z" fill="#34d399" opacity="0.9" />
      <path d="M 30 95 L 70 95 L 90 40 L 80 10 L 20 10 L 10 40 Z" fill="#fff" opacity="0.15" />
      <path d="M 30 40 Q 40 35 45 42 M 70 40 Q 60 35 55 42" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 15 55 L 35 70 M 85 55 L 65 70" stroke="#0f172a" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      <path d="M 35 75 Q 50 85 65 75" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  ) },
  { level: 8, threshold: 45000, title: 'Diamond Hands', color: 'text-cyan-400', glowColor: 'rgba(34,211,238,0.7)', quote: '"Unbreakable resolve. You have forged diamond hands through months of resisting the urge to splurge. While others complain about inflation, you are methodically stacking capital. You are the 1% of discipline."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,5 90,35 50,95 10,35" fill="#22d3ee" opacity="0.9" />
      <polygon points="50,5 75,35 50,95 25,35" fill="#fff" opacity="0.2" />
      <polygon points="50,5 60,35 50,95 40,35" fill="#fff" opacity="0.4" />
      <polygon points="35,45 45,45 40,55" fill="#0f172a" />
      <polygon points="65,45 55,45 60,55" fill="#0f172a" />
      <polygon points="25,80 35,70 45,80 35,90" fill="#f8fafc" opacity="0.7" />
      <polygon points="75,80 65,70 55,80 65,90" fill="#f8fafc" opacity="0.7" />
    </svg>
  ) },
  { level: 9, threshold: 65000, title: 'The Whale', color: 'text-amber-400', glowColor: 'rgba(251,191,36,0.7)', quote: '"You operate with high net-worth psychology. You no longer see money as a tool to buy fleeting thrills; you see it as ammunition to buy your freedom. The ecosystem bends to your patience."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="#fbbf24" opacity="0.3" />
      <path d="M 10 40 Q 50 15 90 40 L 95 70 Q 50 100 5 70 Z" fill="#fbbf24" opacity="0.9" />
      <path d="M 15 40 L 25 15 L 35 30 L 50 5 L 65 30 L 75 15 L 85 40 Z" fill="#fef08a" />
      <rect x="35" y="55" width="6" height="3" fill="#0f172a" />
      <rect x="59" y="55" width="6" height="3" fill="#0f172a" />
      <path d="M 20 65 L 30 75 M 80 65 L 70 80" stroke="#0f172a" strokeWidth="2" opacity="0.4" />
      <path d="M 30 80 Q 50 90 70 80" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  ) },
  { level: 10, threshold: 100000, title: 'Sovereign Sigma', color: 'text-teal-300', glowColor: 'rgba(94,234,212,0.9)', quote: '"Total financial enlightenment. A gentleman of proper priorities. You have conquered your impulses, mastered the game, and transcended the consumer matrix. Your future self is forever grateful."', renderAvatar: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="48" fill="none" stroke="#5eead4" strokeWidth="2" opacity="0.5" />
      <polygon points="50,0 55,10 45,10" fill="#5eead4" />
      <polygon points="100,50 90,45 90,55" fill="#5eead4" />
      <polygon points="50,100 45,90 55,90" fill="#5eead4" />
      <polygon points="0,50 10,45 10,55" fill="#5eead4" />
      <polygon points="50,15 85,35 85,75 50,90 15,75 15,35" fill="#1e293b" opacity="0.9" />
      <polygon points="50,30 70,45 70,65 50,75 30,65 30,45" fill="#0f172a" />
      <circle cx="50" cy="40" r="4" fill="#5eead4" />
      <path d="M 35 55 L 45 60 L 35 62 Z" fill="#5eead4" />
      <path d="M 65 55 L 55 60 L 65 62 Z" fill="#5eead4" />
      <path d="M 50 15 L 50 90" stroke="#5eead4" strokeWidth="1" opacity="0.5" />
    </svg>
  ) },
];

export const getRankForXP = (xp: number): Rank => [...RANKS].reverse().find(r => xp >= r.threshold) ?? RANKS[0];
export const getNextRank = (level: number): Rank | null => RANKS.find(r => r.level === level + 1) ?? null;
