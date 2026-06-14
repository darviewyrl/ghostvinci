import React from 'react';
const OPTIONS = [0, 2, 4, 6];

export default function CardRemovalSelector({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  playSFX,
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {OPTIONS.map((count) => (
        <button
          key={count}
          type="button"
          aria-pressed={cardRemovalCount === count}
          className={`lobby-tile ${cardRemovalCount === count ? 'lobby-tile-active' : ''}`}
          onClick={() => {
            if (playSFX) playSFX('flip');
            onConfigChange({
              aiDifficulty,
              cardRemovalCount: count,
            });
          }}
        >
          <span>{count} ใบ</span>
        </button>
      ))}
    </div>
  );
}
