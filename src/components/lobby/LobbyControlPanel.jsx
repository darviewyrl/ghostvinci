import React from 'react';
import CardRemovalSelector from './CardRemovalSelector';
import DailyQuestWidget from './DailyQuestWidget';
import DifficultySelector from './DifficultySelector';
import LobbySection from './LobbySection';
import ModeStatusField from './ModeStatusField';
import PrimaryLobbyAction from './PrimaryLobbyAction';
import ScoreSummaryWidget from './ScoreSummaryWidget';

export default function LobbyControlPanel({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  playSFX,
  scores,
  onResetScores,
}) {
  return (
    <aside
      data-testid="lobby-control-panel"
      className="lobby-panel p-6 sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgba(230,80,80,0.9)]">
        Ritual Lobby
      </p>
      <p className="mt-2 text-bone/70">
        Skeleton control panel for the new lobby split. Later tasks can restore the full ritual layout.
      </p>

      <div className="mt-6 space-y-6">
        <LobbySection
          title="สถานะโหมด"
          helper="โหมดนี้ยังเป็น single player และจะรองรับการขยายในอนาคต"
        >
          <ModeStatusField />
        </LobbySection>

        <LobbySection title="ระดับความยากของวิญญาณ">
          <DifficultySelector
            aiDifficulty={aiDifficulty}
            cardRemovalCount={cardRemovalCount}
            onConfigChange={onConfigChange}
            playSFX={playSFX}
          />
        </LobbySection>

        <LobbySection title="คัดไพ่ออก">
          <CardRemovalSelector
            aiDifficulty={aiDifficulty}
            cardRemovalCount={cardRemovalCount}
            onConfigChange={onConfigChange}
            playSFX={playSFX}
          />
        </LobbySection>

        <ScoreSummaryWidget
          scores={scores}
          onResetScores={onResetScores}
          playSFX={playSFX}
        />

        <PrimaryLobbyAction onStartGame={onStartGame} />

        <DailyQuestWidget />
      </div>
    </aside>
  );
}
