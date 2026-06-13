import React from 'react';
import { Volume2, VolumeX, LogOut, RotateCcw, Clock, Shield } from 'lucide-react';

export default function GameHUD({
  activePlayer,
  gamePhase,
  timeLeft,
  scores,
  consecutiveGuesses,
  gameLogs,
  isMuted,
  onToggleMute,
  onQuitLobby,
  onRestartGame,
  aiDifficulty
}) {
  const isPlayerTurn = activePlayer === 'player';
  const diffName = aiDifficulty === 'easy' ? 'ง่าย' : aiDifficulty === 'medium' ? 'ปานกลาง' : 'ยาก';
  const timerPct = Math.max(0, Math.min(100, (timeLeft / 20) * 100));

  return (
    <div className="w-full flex flex-col gap-2 select-none font-thai">

      {/* ── Header Row: Title · Score · Controls ── */}
      <div className="wood-panel rounded-xl px-4 py-3 flex items-center justify-between gap-3">

        {/* Title block */}
        <div className="flex items-center gap-2 shrink-0">
          <Shield className="w-4 h-4 text-gold fill-current opacity-90" strokeWidth={1.5} />
          <div>
            <h2 className="text-sm font-bold text-gold tracking-widest uppercase leading-none">
              Davinci Code
            </h2>
            <span className="text-[9px] font-semibold text-gold/50 tracking-widest uppercase block mt-0.5">
              AI: {diffName}
            </span>
          </div>
        </div>

        {/* Score pills */}
        <div className="flex items-center gap-3 bg-charcoal-dark/60 rounded-lg px-4 py-2 border border-gold/15">
          <div className="text-center">
            <span className="text-[8px] font-semibold text-ivory/40 block uppercase tracking-widest leading-none mb-1">ผู้เล่น</span>
            <span className="text-xl font-bold text-ivory leading-none tabular-nums">{scores.player}</span>
          </div>
          <div className="w-px h-6 bg-gold/20" />
          <div className="text-center">
            <span className="text-[8px] font-semibold text-ivory/40 block uppercase tracking-widest leading-none mb-1">AI</span>
            <span className="text-xl font-bold text-ivory leading-none tabular-nums">{scores.ai}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            className="p-2.5 rounded-lg bg-charcoal-dark/50 border border-gold/20 text-gold hover:border-gold/60 hover:bg-charcoal-dark transition-all duration-200 cursor-pointer"
          >
            {isMuted
              ? <VolumeX  className="w-3.5 h-3.5" strokeWidth={2} />
              : <Volume2  className="w-3.5 h-3.5" strokeWidth={2} />
            }
          </button>
          <button
            onClick={onRestartGame}
            title="เริ่มกระดานใหม่"
            className="p-2.5 rounded-lg bg-charcoal-dark/50 border border-gold/20 text-gold hover:border-gold/60 hover:bg-charcoal-dark transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={onQuitLobby}
            title="ออกไปหน้าหลัก"
            className="p-2.5 rounded-lg bg-charcoal-dark/50 border border-red-900/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400 hover:bg-charcoal-dark transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Turn & Phase Status Bar ── */}
      <div className="flex items-center justify-between gap-3 bg-charcoal-dark/70 border border-gold/12 rounded-xl px-4 py-2.5">
        {/* Phase message */}
        <div className="flex-1 min-w-0">
          {gamePhase === 'GAME_OVER' && (
            <p className="text-xs font-semibold text-gold/80 uppercase tracking-widest leading-none">
              การแข่งขันสิ้นสุดลงแล้ว
            </p>
          )}
          {gamePhase === 'JOKER_SETUP' && (
            <p className="text-xs font-semibold text-gold leading-relaxed">
              จัดวาง Joker ของคุณในมือด้านล่าง
            </p>
          )}
          {gamePhase === 'DEAL' && (
            <p className="text-xs font-semibold text-gold/70 uppercase tracking-wider leading-none animate-pulse">
              กำลังแจกการ์ด...
            </p>
          )}
          {(gamePhase === 'GUESS' || gamePhase === 'DECIDE' || gamePhase === 'DRAW' || gamePhase === 'TURN_BANNER') && (
            <div>
              <span className={`text-sm font-bold tracking-wide leading-none ${isPlayerTurn ? 'text-gold' : 'text-ivory/50'}`}>
                {isPlayerTurn ? 'ตาของคุณ' : 'ตาของ AI...'}
              </span>
              {isPlayerTurn && gamePhase === 'GUESS' && (
                <p className="text-[10px] font-semibold text-ivory/50 mt-1 leading-snug">
                  เลือกการ์ด AI แล้วทายค่าตัวเลข
                </p>
              )}
              {isPlayerTurn && gamePhase === 'DECIDE' && (
                <p className="text-[10px] font-semibold text-emerald-400/90 mt-1 leading-snug">
                  ทายถูก! — ทายต่อหรือกดผ่านเพื่อเซฟการ์ด
                </p>
              )}
            </div>
          )}
          {gamePhase === 'PENALTY_REVEAL' && (
            <p className="text-xs font-semibold text-red-400 leading-snug">
              บทลงโทษ! เลือกการ์ด 1 ใบในมือของคุณเพื่อเปิดเผย
            </p>
          )}
          {gamePhase === 'JOKER_PLACEMENT' && (
            <p className="text-xs font-semibold text-gold leading-snug">
              จัดวาง Joker ที่จั่วได้ในมือด้านล่าง
            </p>
          )}
        </div>

        {/* Consecutive combo badge */}
        {consecutiveGuesses > 1 && (
          <div className="shrink-0 bg-emerald-950/60 border border-emerald-600/25 rounded-lg px-2.5 py-1.5 text-center animate-combo-badge">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block leading-none">COMBO</span>
            <span className="text-sm font-bold text-emerald-300 leading-none">×{consecutiveGuesses}</span>
          </div>
        )}
      </div>

      {/* ── Timer Bar (only during GUESS / DECIDE) ── */}
      {(gamePhase === 'GUESS' || gamePhase === 'DECIDE') && (
        <div className="relative h-4 bg-charcoal-dark/80 rounded-full overflow-hidden border border-gold/10 shadow-inner">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${
              timerPct > 55 ? 'bg-emerald-700/90'
              : timerPct > 30 ? 'bg-amber-600/90'
              : 'bg-red-700/90'
            }`}
            style={{ width: `${timerPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            <Clock className="w-2.5 h-2.5 text-ivory/60" strokeWidth={2} />
            <span className="text-[9px] font-bold text-ivory/75 tracking-widest uppercase tabular-nums">
              {timeLeft}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
