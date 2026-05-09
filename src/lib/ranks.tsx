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
  { level: 1, threshold: 0, title: 'The NPC', color: 'text-slate-500', glowColor: 'rgba(100,116,139,0.7)', quote: '"Just one more tap. It\'s only money."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#64748b"><circle cx="50" cy="50" r="45"/><circle cx="35" cy="45" r="5" fill="#0f172a"/><circle cx="65" cy="45" r="5" fill="#0f172a"/><path d="M 40 70 Q 50 60 60 70" stroke="#0f172a" strokeWidth="3" fill="none"/></svg>) },
  { level: 2, threshold: 1000, title: 'The Doomer', color: 'text-slate-400', glowColor: 'rgba(148,163,184,0.7)', quote: '"Why is my balance always zero?"', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#94a3b8"><circle cx="50" cy="50" r="45"/><rect x="30" y="40" width="10" height="5" fill="#0f172a"/><rect x="60" y="40" width="10" height="5" fill="#0f172a"/><path d="M 35 70 L 65 70" stroke="#0f172a" strokeWidth="4" fill="none"/></svg>) },
  { level: 3, threshold: 3000, title: 'Paper Hands', color: 'text-orange-400', glowColor: 'rgba(251,146,60,0.7)', quote: '"I was doing so well until I saw a sale."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#fb923c"><circle cx="50" cy="50" r="45"/><circle cx="35" cy="40" r="6" fill="#0f172a"/><circle cx="65" cy="40" r="6" fill="#0f172a"/><path d="M 40 65 Q 50 75 60 65" stroke="#0f172a" strokeWidth="4" fill="none"/></svg>) },
  { level: 4, threshold: 7000, title: 'Locked In', color: 'text-blue-400', glowColor: 'rgba(96,165,250,0.7)', quote: '"The noise is fading. Discipline is forming."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#60a5fa"><circle cx="50" cy="50" r="45"/><path d="M 25 35 L 45 45 L 25 45 Z" fill="#0f172a"/><path d="M 75 35 L 55 45 L 75 45 Z" fill="#0f172a"/><path d="M 40 70 L 60 70" stroke="#0f172a" strokeWidth="4" fill="none"/></svg>) },
  { level: 5, threshold: 12000, title: 'Based Earner', color: 'text-indigo-400', glowColor: 'rgba(129,140,248,0.7)', quote: '"Respectable. You control your capital."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#818cf8"><circle cx="50" cy="50" r="45"/><circle cx="35" cy="45" r="4" fill="#0f172a"/><circle cx="65" cy="45" r="4" fill="#0f172a"/><path d="M 35 65 Q 50 75 65 65" stroke="#0f172a" strokeWidth="4" fill="none"/></svg>) },
  { level: 6, threshold: 20000, title: 'The Architect', color: 'text-purple-400', glowColor: 'rgba(192,132,252,0.7)', quote: '"Building the future. Designing the perimeter."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#c084fc"><circle cx="50" cy="50" r="45"/><rect x="30" y="40" width="12" height="6" fill="#0f172a"/><rect x="58" y="40" width="12" height="6" fill="#0f172a"/><path d="M 40 70 L 60 70" stroke="#0f172a" strokeWidth="3" fill="none"/></svg>) },
  { level: 7, threshold: 30000, title: 'The Chad', color: 'text-emerald-400', glowColor: 'rgba(52,211,153,0.7)', quote: '"Unfazed by marketing. Absolute unit."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#34d399"><path d="M 10 50 Q 10 10 50 10 Q 90 10 90 50 L 80 85 L 50 95 L 20 85 Z"/><rect x="30" y="35" width="15" height="5" fill="#0f172a"/><rect x="55" y="35" width="15" height="5" fill="#0f172a"/><path d="M 35 65 Q 50 75 65 65" stroke="#0f172a" strokeWidth="4" fill="none"/></svg>) },
  { level: 8, threshold: 45000, title: 'Diamond Hands', color: 'text-cyan-400', glowColor: 'rgba(34,211,238,0.7)', quote: '"Unbreakable resolve. You do not fold."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#22d3ee"><path d="M 20 40 L 50 10 L 80 40 L 50 90 Z"/><circle cx="40" cy="45" r="5" fill="#0f172a"/><circle cx="60" cy="45" r="5" fill="#0f172a"/><path d="M 45 65 L 55 65" stroke="#0f172a" strokeWidth="3" fill="none"/></svg>) },
  { level: 9, threshold: 65000, title: 'The Whale', color: 'text-amber-400', glowColor: 'rgba(251,191,36,0.7)', quote: '"Dominating the ecosystem. High net-worth psychology."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#fbbf24"><circle cx="50" cy="50" r="45"/><path d="M 20 40 Q 50 60 80 40" stroke="#0f172a" strokeWidth="6" fill="none" strokeLinecap="round"/><path d="M 35 70 Q 50 80 65 70" stroke="#0f172a" strokeWidth="4" fill="none"/></svg>) },
  { level: 10, threshold: 100000, title: 'Sovereign Sigma', color: 'text-teal-300', glowColor: 'rgba(94,234,212,0.9)', quote: '"Total financial enlightenment. Proper priorities."', renderAvatar: () => (<svg viewBox="0 0 100 100" className="w-full h-full" fill="#1e293b"><circle cx="50" cy="50" r="45"/><circle cx="35" cy="45" r="6" fill="#5eead4"/><circle cx="65" cy="45" r="6" fill="#5eead4"/><path d="M 40 70 L 60 70" stroke="#5eead4" strokeWidth="3" fill="none"/><path d="M 25 25 L 40 10 L 50 20 L 60 10 L 75 25 Z" fill="#fcd34d"/></svg>) },
];

export const getRankForXP = (xp: number): Rank => [...RANKS].reverse().find(r => xp >= r.threshold) ?? RANKS[0];
export const getNextRank = (level: number): Rank | null => RANKS.find(r => r.level === level + 1) ?? null;
