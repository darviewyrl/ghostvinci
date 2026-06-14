import React from 'react';
import { scenePlaceholder } from './lobbySceneData';

export default function LobbyScene() {
  return (
    <section data-testid="lobby-scene" className="relative min-h-[560px]">
      <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.24),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
      <div className="relative z-10 flex min-h-[560px] items-end rounded-[32px] border border-white/5 bg-black/20 p-6 lg:p-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[rgba(230,80,80,0.9)]">
            {scenePlaceholder.eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase tracking-[0.08em] text-bone font-cinzel xl:text-7xl">
            {scenePlaceholder.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-bone/70">
            {scenePlaceholder.description}
          </p>
        </div>
      </div>
    </section>
  );
}
