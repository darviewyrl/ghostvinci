import React from 'react';
import { FLOATING_CARDS } from './lobbySceneData';

export default function FloatingCardCluster() {
  return (
    <div data-testid="floating-card-cluster" className="pointer-events-none absolute inset-0 hidden lg:block">
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.id}
          className={`absolute h-[180px] w-[120px] rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(35,26,28,0.96),rgba(17,16,21,0.98))] shadow-[0_20px_60px_rgba(0,0,0,0.55)] ${card.className}`}
        >
          <div className="flex h-full items-center justify-center text-4xl font-black text-bone/70 font-cinzel">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
