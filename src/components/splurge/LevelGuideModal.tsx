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
      <div className="w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-[2rem] border border-white/10 bg-[#070b14] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 relative z-10 bg-[#070b14]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">
                <Hexagon size={22} fill="currentColor" />
              </div>
              <h2 className="font-mono text-lg font-black uppercase tracking-widest text-white"> Ascension Ranks </h2>
            </div>
            <p className="text-slate-400 font-mono text-[9px] uppercase tracking-[0.2em] mt-1 ml-8"> Climb. Ascend. Transcend. </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {RANKS.map(rank => {
            const isCurrentRank = rank.level === currentRank.level;
            const isUnlocked = us.ascensionXP >= rank.threshold;
            const isLocked = !isUnlocked;
            const roman = ROMAN_NUMERALS[rank.level - 1] || String(rank.level);

            return (
              <div key={rank.level} className={`relative overflow-hidden flex items-center gap-4 rounded-3xl border p-4 transition-all ${isLocked ? 'opacity-50 border-white/5 bg-slate-900/20' : 'bg-slate-900/40'}`} style={!isLocked ? { borderColor: rank.glowColor, boxShadow: isCurrentRank ? `0 0 20px -5px ${rank.glowColor}, inset 0 0 10px -5px ${rank.glowColor}` : `inset 0 0 15px -10px ${rank.glowColor}` } : {}}>

                {!isLocked && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `linear-gradient(90deg, ${rank.glowColor}, transparent)` }} />
                )}

                <div className="relative z-10 h-14 w-14 flex-shrink-0" style={{ filter: isLocked ? 'grayscale(1)' : `drop-shadow(0 0 12px ${rank.glowColor})` }}>
                  {rank.renderAvatar()}
                </div>

                <div className="relative z-10 flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-black tracking-widest" style={{ color: isLocked ? '#64748b' : rank.glowColor }}>
                      {roman}
                    </span>
                    {isCurrentRank && (
                      <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-1.5 py-0.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" /> Current
                      </span>
                    )}
                  </div>
                  <p className={`font-bold text-base ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                    {rank.title}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400 italic leading-relaxed whitespace-normal break-words mt-1 pr-2">
                    {rank.quote}
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-1 flex-shrink-0 min-w-[55px]">
                  <div style={{ color: isLocked ? '#475569' : rank.glowColor }}>
                    <Sparkles size={16} className={isCurrentRank ? 'animate-pulse' : ''} />
                  </div>
                  <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest text-center mt-1">
                    {rank.threshold === 0 ? 'Start' : `${rank.threshold.toLocaleString()} XP`}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="mt-8 p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-950 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex-1">
              <h3 className="font-mono text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2"> Your Journey Awaits </h3>
              <p className="text-[9px] text-indigo-200/60 leading-relaxed font-mono pr-4"> Every rank is a reflection of your choices. Keep ascending. The top is not a place, it's who you become. </p>
            </div>
            <div className="relative z-10 text-indigo-400 opacity-80" style={{ filter: 'drop-shadow(0 0 15px rgba(99,102,241,0.6))' }}>
              <Hexagon size={40} fill="currentColor" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
