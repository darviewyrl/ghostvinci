import React from 'react';
import { FLOATING_CARDS } from './lobbySceneData';

export default function FloatingCardCluster() {
  return (
    <div data-testid="floating-card-cluster" className="pointer-events-none absolute inset-0 z-[2] hidden lg:block" aria-hidden="true">
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.id}
          className={`absolute h-[190px] w-[126px] rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(35,26,28,0.96),rgba(17,16,21,0.98))] shadow-[0_26px_64px_rgba(0,0,0,0.7)] ${card.className}`}
        >
          <img
            src={card.src}
            alt=""
            aria-hidden="true"
            className="h-full w-full rounded-[18px] object-cover opacity-92"
          />
        </div>
      ))}
    </div>
  );
}
