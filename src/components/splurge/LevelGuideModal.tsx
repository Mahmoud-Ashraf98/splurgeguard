import { RANKS } from '@/lib/ranks';
import { useApp } from '@/context/AppContext';
import { X, Sparkles, Hexagon } from 'lucide-react';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function LevelGuideModal({ onClose }: { onClose: () => void }) {
  const { data } = useApp();
  const us = data.userState!;
  const currentRank = RANKS.find(r => r.level === us.currentLevel) ?? RANKS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-2 pb-6 sm:p-6" onClick={onClose}>
      <div className="w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-950 via-[#0a0f1c] to-slate-950 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                <Hexagon size={22} fill="currentColor" />
              </div>
              <h2 className="text-white font-bold tracking-widest text-xl uppercase"> Ascension Ranks </h2>
            </div>
            <p className="text-cyan-400 tracking-[0.2em] text-xs font-semibold uppercase mt-1 ml-8"> Climb. Ascend. Transcend. </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
          {RANKS.map(rank => {
            const isCurrentRank = rank.level === currentRank.level;
            const isUnlocked = us.ascensionXP >= rank.threshold;
            const isLocked = !isUnlocked;
            const roman = ROMAN_NUMERALS[rank.level - 1] || String(rank.level);

            const cardClasses = isCurrentRank
              ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/10 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20 rounded-2xl'
              : 'bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 rounded-2xl';

            const iconWrapClasses = isCurrentRank
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] p-3 rounded-full flex items-center justify-center shrink-0'
              : 'bg-white/5 p-3 rounded-full border border-white/10 text-slate-400 flex items-center justify-center shrink-0';

            return (
              <div key={rank.level} className={`relative overflow-hidden flex items-center gap-4 p-4 ${cardClasses}`}>

                <div className={iconWrapClasses}>
                  <div className="relative z-10 h-14 w-14 flex-shrink-0" style={{ filter: isLocked ? 'grayscale(0.6)' : `drop-shadow(0 0 12px ${rank.glowColor})` }}>
                    {rank.renderAvatar()}
                  </div>
                </div>

                <div className="relative z-10 flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-500 font-black tracking-widest text-sm mb-1">
                      {roman}
                    </span>
                    {isCurrentRank && (
                      <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        • Current
                      </span>
                    )}
                  </div>
                  <p className={isCurrentRank ? 'text-white font-bold text-xl' : 'text-slate-200 font-semibold text-lg'}>
                    {rank.title}
                  </p>
                  <p className={`${isCurrentRank ? 'text-slate-300' : 'text-slate-400'} leading-relaxed italic text-[11px] whitespace-normal break-words mt-1 pr-2`}>
                    {rank.quote}
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[55px]">
                  <div style={{ color: isLocked ? '#475569' : rank.glowColor }}>
                    <Sparkles size={16} className={isCurrentRank ? 'animate-pulse' : ''} />
                  </div>
                  <span className="text-slate-300 font-mono text-xs bg-white/5 px-3 py-1 rounded-full mt-1 text-center">
                    {rank.threshold === 0 ? 'Start' : `${rank.threshold.toLocaleString()} XP`}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4 relative overflow-hidden">
            <div className="relative z-10 flex-1">
              <h3 className="font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-2"> Your Journey Awaits </h3>
              <p className="text-[10px] text-slate-300 leading-relaxed italic pr-4"> Every rank is a reflection of your choices. Keep ascending. The top is not a place, it's who you become. </p>
            </div>
            <div className="relative z-10 text-cyan-400 opacity-80" style={{ filter: 'drop-shadow(0 0 15px rgba(34,211,238,0.6))' }}>
              <Hexagon size={40} fill="currentColor" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
