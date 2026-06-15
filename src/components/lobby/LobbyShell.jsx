import React from 'react';
import logoRedImage from '../../../img/logo_red.png';
import LobbyControlPanel from './LobbyControlPanel';
import LobbyScene from './LobbyScene';
import LobbyTopBar from './LobbyTopBar';

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
      className="lobby-shell-bg relative h-screen min-h-screen overflow-x-hidden overflow-y-auto font-thai select-none"
    >
      <div className="pointer-events-none absolute left-5 top-5 z-10 w-[10.75rem] sm:left-6 sm:top-6 sm:w-[12.5rem] xl:w-[13.25rem]">
        <img
          src={logoRedImage}
          alt="Ghostvinci"
          className="block w-full select-none object-contain opacity-95 drop-shadow-[0_0_14px_rgba(239,68,68,0.42)]"
          draggable="false"
        />
      </div>
      <LobbyTopBar playSFX={playSFX} onOpenSettings={onOpenSettings} />
      <main className="relative z-10 grid min-h-[calc(100vh+4rem)] w-full gap-6 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(292px,29vw)] lg:items-center lg:gap-8 lg:px-7 lg:py-9 lg:pr-14 xl:grid-cols-[minmax(0,1fr)_372px] xl:gap-10 xl:pl-10 xl:pr-20">
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
        />
      </main>
    </div>
  );
}
