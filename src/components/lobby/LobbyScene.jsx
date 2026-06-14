import AmbientParticles from './AmbientParticles';
import FloatingCardCluster from './FloatingCardCluster';
import LobbyBrandBlock from './LobbyBrandBlock';
import { LOBBY_ASSETS } from './lobbySceneData';

export default function LobbyScene() {
  return (
    <section
      data-testid="lobby-scene"
      data-uses-layered-assets="true"
      className="relative min-h-[560px] overflow-hidden rounded-[32px]"
    >
      <img
        src={LOBBY_ASSETS.backgroundBase}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <img
        src={LOBBY_ASSETS.backgroundVignette}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <AmbientParticles />
      <img
        src={LOBBY_ASSETS.sigil}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[8%] w-[min(70%,640px)] -translate-x-1/2 opacity-20"
      />
      <img
        src={LOBBY_ASSETS.characterGlow}
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-[44%] w-[min(55%,520px)] -translate-x-1/2 opacity-45"
      />
      <img
        src={LOBBY_ASSETS.character}
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-[44%] z-[1] w-[min(54%,500px)] -translate-x-1/2 opacity-90"
      />
      <FloatingCardCluster />
      <div className="relative z-10 flex min-h-[560px] items-end p-6 lg:p-10">
        <LobbyBrandBlock />
      </div>
    </section>
  );
}
