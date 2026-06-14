import React from 'react';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'ง่าย' },
  { value: 'medium', label: 'ปานกลาง' },
  { value: 'hard', label: 'อันตราย' },
];

const CARD_REMOVAL_OPTIONS = [0, 2, 4, 6];

export default function LobbyControlPanel({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  playSFX,
  scores,
  onResetScores,
}) {
  const buildConfigPayload = (overrides) => ({
    aiDifficulty,
    cardRemovalCount,
    ...overrides,
  });

  return (
    <aside
      data-testid="lobby-control-panel"
      className="rounded-[28px] border border-red-900/55 bg-[rgba(10,10,14,0.92)] p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(239,68,68,0.15)] sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgba(230,80,80,0.9)]">
        Ritual Lobby
      </p>
      <p className="mt-2 text-bone/70">
        Skeleton control panel for the new lobby split. Later tasks can restore the full ritual layout.
      </p>

      <div className="mt-6">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[rgba(230,80,80,0.92)]">
          ระดับความดุร้ายของวิญญาณ
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={aiDifficulty === option.value}
              className="rounded-lg border border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.82)] px-3 py-3 text-sm font-black text-bone/80"
              onClick={() => {
                if (playSFX) playSFX('flip');
                onConfigChange(buildConfigPayload({ aiDifficulty: option.value }));
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[rgba(230,80,80,0.92)]">
          คัดไพ่ออก
        </p>
        <div className="grid grid-cols-4 gap-2">
          {CARD_REMOVAL_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={cardRemovalCount === count}
              className="rounded-lg border border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.82)] px-3 py-3 text-sm font-black text-bone/80"
              onClick={() => {
                if (playSFX) playSFX('flip');
                onConfigChange(buildConfigPayload({ cardRemovalCount: count }));
              }}
            >
              {count} ใบ
            </button>
          ))}
        </div>
      </div>

      {scores && (scores.player > 0 || scores.ai > 0) ? (
        <div className="mt-6 rounded-[20px] border border-[rgba(127,29,29,0.18)] bg-black/35 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[rgba(230,80,80,0.9)]">
              คะแนนล่าสุด
            </span>
            <button
              type="button"
              className="text-[11px] font-bold uppercase tracking-widest text-bone/50 underline"
              onClick={() => {
                if (playSFX) playSFX('toggle');
                onResetScores();
              }}
            >
              ล้างคะแนน
            </button>
          </div>
          <div className="flex items-center justify-center gap-5 text-center">
            <div>
              <span className="block text-[11px] uppercase tracking-widest text-bone/50">คุณ</span>
              <span className="text-3xl font-black text-emerald-400">{scores.player}</span>
            </div>
            <div className="text-2xl font-black text-bone/25">:</div>
            <div>
              <span className="block text-[11px] uppercase tracking-widest text-bone/50">AI</span>
              <span className="text-3xl font-black text-rose-500">{scores.ai}</span>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-[#ef4444] px-4 py-4 text-lg font-black uppercase tracking-[0.26em] text-neutral-950"
        onClick={onStartGame}
      >
        เข้าสู่พิธีกรรม
      </button>
    </aside>
  );
}
