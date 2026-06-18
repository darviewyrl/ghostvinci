import React from 'react';
import logoRedImage from '../../../img/logo_red.png';
import LobbyControlPanel from './LobbyControlPanel';
import LobbyGuideSection from './LobbyGuideSection';
import LobbyScene from './LobbyScene';

export default function LobbyShell({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  playSFX,
  onOpenSettings,
  scores,
  onResetScores,
  dailyQuest,
  onClaimReward,
  onResetQuest,
}) {
  return (
    <div
      data-testid="lobby-shell"
      className="lobby-shell-bg relative min-h-screen overflow-x-hidden font-thai select-none"
    >
      <div aria-hidden="true" className="lobby-shell-hero-bg absolute inset-x-0 top-0 h-screen" />
      <div className="lobby-corner-logo pointer-events-none absolute z-10">
        <img
          src={logoRedImage}
          alt="Ghostvinci"
          className="block w-full select-none object-contain opacity-95 drop-shadow-[0_0_14px_rgba(239,68,68,0.42)]"
          draggable="false"
        />
      </div>
      <main id="ritual-lobby" className="relative z-10 grid min-h-screen w-full gap-6 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(292px,29vw)] lg:items-center lg:gap-8 lg:px-7 lg:py-9 lg:pr-12 xl:grid-cols-[minmax(0,1fr)_372px] xl:gap-8 xl:pl-10 xl:pr-18">
        <LobbyScene />
        <LobbyControlPanel
          aiDifficulty={aiDifficulty}
          cardRemovalCount={cardRemovalCount}
          onConfigChange={onConfigChange}
          onStartGame={onStartGame}
          playSFX={playSFX}
          scores={scores}
          onResetScores={onResetScores}
          dailyQuest={dailyQuest}
          onClaimReward={onClaimReward}
          onResetQuest={onResetQuest}
          onOpenSettings={onOpenSettings}
        />
      </main>
      <LobbyGuideSection />
    </div>
  );
}
