import { RANKS } from '@/lib/ranks';
import { useApp } from '@/context/AppContext';

export function LevelGuideModal({ onClose }: { onClose: () => void }) {
  const { data } = useApp();
  const us = data.userState!;
  const currentRank = RANKS.find((r) => r.level === us.currentLevel) ?? RANKS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 pb-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/5 bg-slate-900/95 backdrop-blur-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
            Ascension Ranks
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-xs text-slate-500 hover:text-white uppercase tracking-widest"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] px-4 py-4 space-y-3">
          {RANKS.map((rank) => {
            const isCurrentRank = rank.level === currentRank.level;
            const isLocked = us.ascensionXP < rank.threshold;
            return (
              <div
                key={rank.level}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                  isCurrentRank
                    ? 'border-white/20 bg-slate-800/60'
                    : isLocked
                    ? 'border-white/5 bg-slate-900/20 opacity-40'
                    : 'border-white/5 bg-slate-900/30'
                }`}
                style={isCurrentRank ? { boxShadow: `0 0 20px -5px ${rank.glowColor}` } : undefined}
              >
                <div
                  className="h-12 w-12 flex-shrink-0"
                  style={{
                    filter: isLocked ? 'grayscale(1) drop-shadow(none)' : `drop-shadow(0 0 8px ${rank.glowColor})`,
                  }}
                >
                  {rank.renderAvatar()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                      Lv.{rank.level}
                    </span>
                    {isCurrentRank && (
                      <span className="font-mono text-[8px] uppercase tracking-widest text-emerald-400 border border-emerald-400/30 rounded px-1">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`font-bold text-sm ${isLocked ? 'text-slate-600' : rank.color}`}>
                    {rank.title}
                  </p>
                  <p className="font-mono text-[9px] text-slate-500 italic truncate">{rank.quote}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-[9px] text-slate-600 uppercase">
                    {rank.threshold === 0 ? 'Start' : `${rank.threshold.toLocaleString()} XP`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
