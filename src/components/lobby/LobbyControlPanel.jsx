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
      className="lobby-panel relative p-6 sm:p-8"
    >
      <div className="rounded-sm border border-[rgba(127,29,29,0.28)] px-6 py-6 text-center shadow-[inset_0_0_0_1px_rgba(239,68,68,0.06)]">
        <p className="text-2xl font-semibold text-bone">เริ่มพิธีกรรม</p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[rgba(230,80,80,0.5)]">
          <span className="text-sm">✦</span>
          <span className="h-px w-10 bg-current" />
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgba(230,80,80,0.9)]">
            Ritual Lobby
          </p>
          <span className="h-px w-10 bg-current" />
          <span className="text-sm">✦</span>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <LobbySection title="โหมดการเล่น">
          <ModeStatusField />
        </LobbySection>

        <LobbySection title="ระดับความร้าย">
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
