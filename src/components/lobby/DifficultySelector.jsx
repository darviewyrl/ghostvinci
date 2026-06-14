import React from 'react';

const OPTIONS = [
  { id: 'easy', label: 'เธเนเธฒเธข' },
  { id: 'medium', label: 'เธเธฒเธเธเธฅเธฒเธ' },
  { id: 'hard', label: 'เธญเธฑเธเธ•เธฃเธฒเธข' },
];

export default function DifficultySelector({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  playSFX,
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={aiDifficulty === option.id}
          className={`lobby-tile ${aiDifficulty === option.id ? 'lobby-tile-active' : ''}`}
          onClick={() => {
            if (playSFX) playSFX('flip');
            onConfigChange({
              aiDifficulty: option.id,
              cardRemovalCount,
            });
          }}
        >
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
