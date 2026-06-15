import React from 'react';
import StackIcon from './StackIcon';

const OPTIONS = [0, 2, 4, 6];

export default function CardRemovalSelector({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  playSFX,
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {OPTIONS.map((count) => {
        const active = cardRemovalCount === count;

        return (
          <button
            key={count}
            type="button"
            aria-pressed={active}
            className={`lobby-tile min-h-[104px] ${active ? 'lobby-tile-active' : ''}`}
            onClick={() => {
              if (playSFX) playSFX('flip');
              onConfigChange({
                aiDifficulty,
                cardRemovalCount: count,
              });
            }}
          >
            <span className="flex flex-col items-center gap-2">
              <StackIcon active={active} />
              <span>{count} ใบ</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
