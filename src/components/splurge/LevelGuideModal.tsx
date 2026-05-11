import { RANKS } from '@/lib/ranks';
import { useApp } from '@/context/AppContext';
import { X, Hexagon } from 'lucide-react';

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
        <div className="flex-1 flex flex-col gap-4 w-full overflow-y-auto pb-4 px-4">
          {RANKS.map(rank => {
            const isCurrentRank = rank.level === currentRank.level;
            const isPast = rank.level < currentRank.level;
            const isLocked = rank.level > currentRank.level;
            const roman = ROMAN_NUMERALS[rank.level - 1] || String(rank.level);

            const cardClasses = isCurrentRank
              ? 'relative flex flex-col md:flex-row items-start gap-5 p-5 md:p-6 w-full bg-gradient-to-br from-cyan-900/40 to-blue-900/10 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20 rounded-2xl'
              : isLocked
                ? 'relative flex flex-col md:flex-row items-start gap-5 p-5 md:p-6 w-full bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 rounded-2xl'
                : 'relative flex flex-col md:flex-row items-start gap-5 p-5 md:p-6 w-full bg-white/[0.015] border border-white/[0.04] rounded-2xl opacity-70';

            const iconWrapClasses = isCurrentRank
              ? 'flex items-center justify-center shrink-0 w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] p-3 rounded-full overflow-hidden'
              : isLocked
                ? 'flex items-center justify-center shrink-0 w-16 h-16 bg-white/5 p-3 rounded-full border border-white/10 text-slate-400 overflow-hidden'
                : 'flex items-center justify-center shrink-0 w-16 h-16 bg-white/5 p-3 rounded-full border border-white/[0.06] text-slate-500 overflow-hidden';

            const titleClasses = isCurrentRank
              ? 'text-white font-bold text-xl leading-tight'
              : isLocked
                ? 'text-slate-200 font-semibold text-lg leading-tight'
                : 'text-slate-400 font-semibold text-lg leading-tight';

            const loreClasses = isCurrentRank
              ? 'text-slate-300 leading-relaxed italic text-sm mt-1'
              : isLocked
                ? 'text-slate-400 leading-relaxed italic text-sm mt-1'
                : 'text-slate-500 leading-relaxed italic text-sm mt-1';

            return (
              <div key={rank.level} className={cardClasses}>
                <div className={iconWrapClasses}>
                  <div className="w-full h-full flex items-center justify-center" style={{ filter: isLocked ? 'grayscale(0.6)' : `drop-shadow(0 0 12px ${rank.glowColor})` }}>
                    {rank.renderAvatar()}
                  </div>
                </div>

                <div className="flex flex-col flex-1 gap-1.5 min-w-0 w-full pr-20 md:pr-24">
                  <div className="flex flex-wrap items-center gap-2.5 w-full">
                    <span className="text-slate-500 font-black tracking-widest text-sm shrink-0">
                      {roman}
                    </span>
                    <p className={titleClasses}>{rank.title}</p>
                    {isCurrentRank && (
                      <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        • Current
                      </span>
                    )}
                  </div>
                  <p className={loreClasses}>
                    {rank.quote}
                  </p>
                </div>

                <div className="absolute top-5 right-5 md:top-6 md:right-6 flex flex-col items-end">
                  {isCurrentRank ? (
                    <span className="text-cyan-300 font-mono text-xs md:text-sm bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 shrink-0">
                      {rank.threshold === 0 ? 'Start' : `${rank.threshold.toLocaleString()} XP`}
                    </span>
                  ) : (
                    <span className="text-slate-300 font-mono text-xs md:text-sm bg-white/5 px-2.5 py-1 rounded-full border border-white/10 shrink-0">
                      {rank.threshold === 0 ? 'Start' : `${rank.threshold.toLocaleString()} XP`}
                    </span>
                  )}
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
