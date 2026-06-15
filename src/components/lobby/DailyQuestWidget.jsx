import React from 'react';
import { ChevronRight, Award, RefreshCw } from 'lucide-react';

export default function DailyQuestWidget({ dailyQuest, onClaimReward, onResetQuest }) {
  const quest = dailyQuest || {
    title: 'ชนะเกม 3 ครั้ง',
    progress: 2,
    target: 3,
    claimed: false,
  };

  const isCompleted = quest.progress >= quest.target;
  const isClaimed = quest.claimed;
  const percent = Math.min((quest.progress / quest.target) * 100, 100);

  return (
    <div className={`lobby-panel lobby-daily-quest p-3.5 transition-all duration-300 ${isCompleted && !isClaimed ? 'border-red-600/40 bg-red-950/5' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[rgba(230,80,80,0.9)]">
            <p className="text-xs font-black uppercase tracking-[0.18em]">
              ภารกิจประจำวัน
            </p>
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </div>
          <p className="mt-2 text-sm font-semibold text-bone">{quest.title}</p>
          
          <div className="mt-2.5 h-2 rounded-full bg-white/8 overflow-hidden">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-rose-800 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-500 ease-out" 
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between min-h-[32px]">
            {!isCompleted ? (
              <p className="text-xs text-bone/60">{quest.progress} / {quest.target}</p>
            ) : !isClaimed ? (
              <button
                type="button"
                onClick={onClaimReward}
                className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-bone hover:text-white font-black text-[10px] tracking-wider border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 cursor-pointer animate-pulse uppercase rounded flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                <span>รับรางวัล</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-500 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]">สำเร็จแล้ว</span>
                <button
                  type="button"
                  onClick={onResetQuest}
                  className="p-1 hover:bg-white/5 text-bone/40 hover:text-bone/80 transition-colors cursor-pointer rounded"
                  title="เริ่มภารกิจใหม่"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-[74px] shrink-0 text-center">
          <div className={`daily-quest-reward ${isCompleted && !isClaimed ? 'daily-quest-reward--ready' : ''}`}>
            <div className="daily-chest" aria-hidden="true">
              <span className="daily-chest__lid" />
              <span className="daily-chest__body" />
              <span className="daily-chest__lock" />
            </div>
          </div>
          <p className="mt-1 text-center text-xs font-bold text-bone/70">x1</p>
        </div>
      </div>
    </div>
  );
}
