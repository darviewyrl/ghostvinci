import { LOBBY_INFO_PILLS } from './lobbySceneData';

export default function LobbyBrandBlock() {
  return (
    <div className="relative z-10 max-w-3xl">
      <p className="inline-flex items-center rounded-full border border-[rgba(230,80,80,0.24)] bg-black/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.32em] text-[rgba(230,80,80,0.9)]">
        Ghostvinci
      </p>
      <h1 className="mt-5 text-[3.5rem] font-black uppercase leading-[0.84] tracking-[0.07em] text-bone font-cinzel sm:text-[4.8rem] xl:text-[6.4rem]">
        Ghostvinci
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-bone/75">
        Open the ritual, choose the setup, and step directly into a playable supernatural guessing match.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {LOBBY_INFO_PILLS.map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-[rgba(127,29,29,0.18)] bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bone/58"
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}
