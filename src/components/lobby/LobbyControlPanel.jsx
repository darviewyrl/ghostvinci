import React from 'react';
import { Settings } from 'lucide-react';
import CardRemovalSelector from './CardRemovalSelector';
import DailyQuestWidget from './DailyQuestWidget';
import DifficultySelector from './DifficultySelector';
import LobbySection from './LobbySection';
import PrimaryLobbyAction from './PrimaryLobbyAction';
import ScoreSummaryWidget from './ScoreSummaryWidget';
import InfoTooltip from './InfoTooltip';

export default function LobbyControlPanel({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  playSFX,
  scores,
  onResetScores,
  dailyQuest,
  onClaimReward,
  onResetQuest,
  onOpenSettings,
}) {
  const handleOpenSettings = () => {
    if (playSFX) playSFX('flip');
    if (onOpenSettings) onOpenSettings();
  };

  return (
    <aside
      data-testid="lobby-control-panel"
      className="lobby-control-stack relative z-20 flex flex-col gap-2.5 lg:-translate-y-3"
    >
      <div className="flex justify-end pr-0.5">
        <button
          type="button"
          aria-label="ตั้งค่าเสียง"
          className="lobby-settings-button"
          onClick={handleOpenSettings}
        >
          <Settings className="h-4 w-4" strokeWidth={2.2} />
          <span>การตั้งค่า</span>
        </button>
      </div>

      <div className="lobby-panel relative p-4">
        <div className="border border-[rgba(127,29,29,0.22)] px-5 py-4 text-center shadow-[inset_0_0_0_1px_rgba(239,68,68,0.04)]">
          <p className="text-xl font-semibold text-bone">เริ่มพิธีกรรม</p>
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

        <div className="mt-4 space-y-4">
          <LobbySection title="ระดับความร้าย">
            <DifficultySelector
              aiDifficulty={aiDifficulty}
              cardRemovalCount={cardRemovalCount}
              onConfigChange={onConfigChange}
              playSFX={playSFX}
            />
          </LobbySection>

          <LobbySection
            title="คัดไพ่ออก"
            tooltip={
              <InfoTooltip
                content="คัดไพ่ออก คือการนำไพ่บางส่วนออกจากเกมก่อนเริ่มเล่น ทำให้จำนวนไพ่ในเกมลดลงและเพิ่มความท้าทายในการเดา"
              />
            }
          >
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
        </div>
      </div>

      <DailyQuestWidget
        dailyQuest={dailyQuest}
        onClaimReward={onClaimReward}
        onResetQuest={onResetQuest}
        playSFX={playSFX}
      />
    </aside>
  );
}
