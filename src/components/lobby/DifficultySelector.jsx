import React from 'react';
import DifficultyIcon from './DifficultyIcon';

const OPTIONS = [
  { id: 'easy', label: 'ง่าย' },
  { id: 'medium', label: 'ปานกลาง' },
  { id: 'hard', label: 'อันตราย' },
];

export default function DifficultySelector({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  playSFX,
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((option) => {
        const active = aiDifficulty === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            className={`lobby-tile ${active ? 'lobby-tile-active' : ''}`}
            onClick={() => {
              if (playSFX) playSFX('flip');
              onConfigChange({
                aiDifficulty: option.id,
                cardRemovalCount,
              });
            }}
          >
            <span className="flex flex-col items-center gap-3">
              <DifficultyIcon variant={option.id} active={active} />
              <span>{option.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
