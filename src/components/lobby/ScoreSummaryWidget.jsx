import React from 'react';

export default function ScoreSummaryWidget({ scores, onResetScores, playSFX }) {
  if (!scores || (scores.player === 0 && scores.ai === 0)) return null;

  return (
    <div className="lobby-scoreboard rounded-sm border border-white/8 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[rgba(230,80,80,0.9)]">
          คะแนนล่าสุด
        </span>
        <button
          type="button"
          className="text-[11px] font-bold uppercase tracking-widest text-bone/40 underline"
          onClick={() => {
            if (playSFX) playSFX('toggle');
            onResetScores();
          }}
        >
          ล้างคะแนน
        </button>
      </div>
      <div className="lobby-scoreboard__scores flex items-center justify-center gap-5 text-center">
        <div>
          <span className="block text-[11px] uppercase tracking-widest text-bone/50">You</span>
          <span className="text-3xl font-black text-emerald-400">{scores.player}</span>
        </div>
        <div className="text-2xl font-black text-bone/25">:</div>
        <div>
          <span className="block text-[11px] uppercase tracking-widest text-bone/50">AI</span>
          <span className="text-3xl font-black text-rose-500">{scores.ai}</span>
        </div>
      </div>
    </div>
  );
}
