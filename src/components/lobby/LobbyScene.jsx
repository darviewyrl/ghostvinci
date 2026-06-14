import React from 'react';
import AmbientParticles from './AmbientParticles';
import FloatingCardCluster from './FloatingCardCluster';
import LobbyBrandBlock from './LobbyBrandBlock';
import RitualSilhouette from './RitualSilhouette';
import RitualSmoke from './RitualSmoke';

export default function LobbyScene() {
  return (
    <section
      data-testid="lobby-scene"
      data-uses-layered-assets="true"
      className="relative min-h-[560px] overflow-hidden rounded-[32px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(117,24,24,0.28),transparent_34%),radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.16),transparent_55%),linear-gradient(180deg,#08080a_0%,#110809_55%,#050506_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.28)_25%,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0.28)_75%,rgba(0,0,0,0.56)_100%)]" />
      <div className="absolute inset-0 rounded-[32px] border border-white/5" />
      <div className="absolute left-1/2 top-[8%] h-[74%] w-[74%] -translate-x-1/2 rounded-full border border-[rgba(147,51,51,0.16)] shadow-[0_0_0_1px_rgba(147,51,51,0.08),0_0_100px_rgba(239,68,68,0.08)]" />
      <div className="absolute left-1/2 top-[10%] h-[62%] w-[62%] -translate-x-1/2 rounded-full border border-[rgba(147,51,51,0.18)] opacity-70" />
      <div className="absolute left-1/2 top-[18%] h-[46%] w-[46%] -translate-x-1/2 rounded-full border border-[rgba(239,68,68,0.08)] opacity-65" />
      <RitualSmoke />
      <AmbientParticles />
      <div className="pointer-events-none absolute left-1/2 top-[10%] h-[58%] w-[58%] -translate-x-1/2 rounded-full border border-[rgba(239,68,68,0.14)] opacity-80">
        <div className="absolute inset-[10%] rounded-full border border-[rgba(239,68,68,0.08)]" />
        <div className="absolute inset-[22%] rounded-full border border-[rgba(239,68,68,0.1)]" />
      </div>
      <RitualSilhouette />
      <FloatingCardCluster />
      <div className="relative z-10 flex min-h-[560px] items-end p-6 lg:p-10">
        <LobbyBrandBlock />
      </div>
    </section>
  );
}
