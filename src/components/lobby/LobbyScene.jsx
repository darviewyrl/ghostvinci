import React from 'react';
import AmbientParticles from './AmbientParticles';
import FloatingCardCluster from './FloatingCardCluster';
import LobbyBrandBlock from './LobbyBrandBlock';
import { LOBBY_ASSETS } from './lobbySceneData';

export default function LobbyScene() {
  return (
    <section
      data-testid="lobby-scene"
      data-uses-layered-assets="true"
      className="relative min-h-[640px] overflow-hidden"
    >
      <img
        src={LOBBY_ASSETS.ritualPlate}
        alt=""
        aria-hidden="true"
        width="1792"
        height="1024"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.02)_44%,rgba(0,0,0,0.42)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black via-black/70 to-transparent" />
      <AmbientParticles />
      <FloatingCardCluster />
      <div className="absolute bottom-0 left-0 right-0 z-10 flex min-h-[640px] items-end p-6 lg:p-10">
        <LobbyBrandBlock />
      </div>
    </section>
  );
}
