import React from 'react';
import AmbientParticles from './AmbientParticles';
import LobbyBrandBlock from './LobbyBrandBlock';

export default function LobbyScene() {
  return (
    <section
      data-testid="lobby-scene"
      data-uses-layered-assets="true"
      className="relative min-h-[calc(100vh-2.5rem)] overflow-hidden"
    >
      <AmbientParticles />
      <div data-testid="floating-card-cluster" aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[calc(100vh-2.5rem)] items-end px-2 pb-8 pt-16 sm:px-4 lg:px-8 lg:pb-6 xl:px-6 xl:pb-8">
        <LobbyBrandBlock />
      </div>
    </section>
  );
}
