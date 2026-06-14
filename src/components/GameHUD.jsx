import React from 'react';
import { Settings, LogOut, RotateCcw, Clock } from 'lucide-react';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function GameHUD({
  activePlayer,
  gamePhase,
  timeLeft,
  consecutiveGuesses,
  isMuted,
  onToggleMute,
  onQuitLobby,
  onRestartGame,
  aiDifficulty,
  onOpenSettings,
  elapsedTime = 0,
  turnCount = 0,
  scores,
}) {
  const isPlayerTurn = activePlayer === 'player';
  const diffName = aiDifficulty === 'easy' ? 'ง่าย' : aiDifficulty === 'medium' ? 'ปานกลาง' : 'อันตราย';
  const timerPct = Math.max(0, Math.min(100, (timeLeft / 20) * 100));

  return (
    <div className="w-full flex flex-col gap-2 select-none font-thai">

      {/* ── Header Row: Title · Controls ── */}
      <div className="skull-panel px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        {/* Left: Title */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
          <span className="text-[rgba(127,29,29,0.7)] text-lg font-black leading-none select-none">☠</span>
          <div className="text-center sm:text-left">
            <h2 className="text-sm font-black text-bone tracking-[0.18em] font-cinzel uppercase leading-none text-flicker">
               Ghostvinci
             </h2>
            <span className="text-[12px] font-extrabold text-[rgba(230,80,80,0.85)] tracking-[0.15em] uppercase block mt-0.5">
              {diffName} — ทายรหัสหรือตาย
            </span>
          </div>
        </div>

        {/* Center: Elapsed Time & Turn Round & Scores */}
        <div className="flex items-center gap-4 sm:gap-6 text-center select-none py-1 sm:py-0">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-rose-500/60 tracking-[0.2em] uppercase font-cinzel leading-none mb-1">ELAPSED TIME</span>
            <span className="text-base font-bold text-bone tracking-widest tabular-nums font-cinzel leading-none">{formatTime(elapsedTime)}</span>
          </div>
          <div className="h-6 w-px bg-rose-950/45" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-rose-500/60 tracking-[0.2em] uppercase font-cinzel leading-none mb-1">ROUND</span>
            <span className="text-base font-bold text-bone tracking-widest tabular-nums font-cinzel leading-none">{turnCount}</span>
          </div>
          <div className="h-6 w-px bg-rose-950/45" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-rose-500/60 tracking-[0.2em] uppercase font-cinzel leading-none mb-1">SCORE</span>
            <span className="text-base font-bold text-bone tracking-widest tabular-nums font-cinzel leading-none">
              <span className="text-emerald-500">{scores?.player || 0}</span>
              <span className="text-bone/45 mx-1">:</span>
              <span className="text-rose-500">{scores?.ai || 0}</span>
            </span>
          </div>
        </div>

        {/* Control buttons — no score, just controls */}
        <div className="flex items-center gap-1.5 justify-center sm:justify-end w-full sm:w-auto border-t sm:border-t-0 border-rose-950/25 pt-2.5 sm:pt-0 shrink-0">
          <button
            onClick={onOpenSettings}
            title="การตั้งค่าเสียง"
            className="p-2 bg-[rgba(10,10,12,0.7)] border border-[rgba(127,29,29,0.2)] text-bone/40 hover:border-[rgba(127,29,29,0.55)] hover:text-bone/80 transition-all duration-300 cursor-pointer"
            style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
          >
            <Settings className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={onRestartGame}
            title="เริ่มกระดานใหม่"
            className="p-2 bg-[rgba(10,10,12,0.7)] border border-[rgba(127,29,29,0.2)] text-bone/40 hover:border-[rgba(127,29,29,0.55)] hover:text-bone/80 transition-all duration-300 cursor-pointer"
            style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={onQuitLobby}
            title="ออกไปหน้าหลัก"
            className="p-2 bg-[rgba(10,10,12,0.7)] border border-[rgba(100,0,0,0.35)] text-[rgba(153,27,27,0.6)] hover:border-[rgba(180,0,0,0.7)] hover:text-[rgba(220,50,50,0.9)] transition-all duration-300 cursor-pointer"
            style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 5px), 0% 4px)' }}
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

    </div>
  );
}
