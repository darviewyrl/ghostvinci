import React from 'react';
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
}) {
  return (
    <div
      data-testid="lobby-shell"
      className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-haunted font-thai select-none"
    >
      <LobbyTopBar playSFX={playSFX} onOpenSettings={onOpenSettings} />
      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center lg:gap-10 lg:px-10 xl:gap-14 xl:px-16">
        <LobbyScene />
        <LobbyControlPanel
          aiDifficulty={aiDifficulty}
          cardRemovalCount={cardRemovalCount}
          onConfigChange={onConfigChange}
          onStartGame={onStartGame}
          playSFX={playSFX}
          scores={scores}
          onResetScores={onResetScores}
        />
      </main>
    </div>
  );
}
