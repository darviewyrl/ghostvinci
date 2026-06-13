import React from 'react';
import { Volume2, VolumeX, LogOut, RotateCcw, Clock, Scroll, Shield } from 'lucide-react';

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

  return (
    <div className="w-full flex flex-col gap-4 text-ivory select-none font-thai">
      {/* 1. Header Board Stats (Wood panel effect) */}
      <div className="flex flex-wrap items-center justify-between wood-panel rounded-xl p-4 md:p-5 gap-4">
        {/* Title */}
        <div className="text-left">
          <h2 className="text-base md:text-lg font-extrabold font-serif text-gold tracking-widest drop-shadow-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold fill-current" />
            <span>Davinci Code</span>
          </h2>
          <span className="text-[9px] font-bold text-gold-light/60 tracking-widest uppercase block mt-0.5">
            AI บอท: {diffName}
          </span>
        </div>

        {/* Scoreboard display */}
        <div className="flex items-center gap-6 bg-charcoal/70 border border-gold/20 rounded-lg px-5 py-2 shadow-inner">
          <div className="text-center">
            <span className="text-[9px] font-bold text-ivory/45 block uppercase tracking-widest">คุณ</span>
            <span className="text-lg font-extrabold text-gold leading-none block mt-0.5">{scores.player}</span>
          </div>
          <div className="h-6 w-px bg-gold/20" />
          <div className="text-center">
            <span className="text-[9px] font-bold text-ivory/45 block uppercase tracking-widest">AI</span>
            <span className="text-lg font-extrabold text-gold leading-none block mt-0.5">{scores.ai}</span>
          </div>
        </div>

        {/* Controller Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMute}
            className="p-3 bg-charcoal hover:bg-charcoal-dark text-gold border border-gold/30 hover:border-gold rounded-lg transition-all duration-300 shadow shadow-black/35 cursor-pointer hover:-translate-y-0.5"
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onRestartGame}
            className="p-3 bg-charcoal hover:bg-charcoal-dark text-gold border border-gold/30 hover:border-gold rounded-lg transition-all duration-300 shadow shadow-black/35 cursor-pointer hover:-translate-y-0.5"
            title="เริ่มกระดานใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onQuitLobby}
            className="p-3 bg-charcoal hover:bg-charcoal-dark text-red-400 border border-red-900/30 hover:border-red-400 rounded-lg transition-all duration-300 shadow shadow-black/35 cursor-pointer hover:-translate-y-0.5"
            title="ออกไปหน้าหลัก"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Turn Message Banner */}
      <div className="relative overflow-hidden h-16 flex items-center justify-center bg-charcoal/95 border border-gold/25 rounded-xl shadow-lg shadow-black/45 px-4">
        {gamePhase === 'GAME_OVER' ? (
          <div className="text-sm font-bold text-gold uppercase tracking-widest animate-pulse">
            การแข่งขันสิ้นสุดลงแล้ว
          </div>
        ) : gamePhase === 'JOKER_SETUP' ? (
          <div className="text-xs font-bold text-gold tracking-widest uppercase animate-pulse">
            กรุณาจัดวางการ์ด Joker ในมือของคุณ
          </div>
        ) : gamePhase === 'DEAL' ? (
          <div className="text-xs font-semibold text-gold-light/80 tracking-widest uppercase animate-pulse">
            กำลังสับไพ่และเริ่มแจกการ์ดทีละใบ...
          </div>
        ) : (
          <div className="text-center">
            <span className={`text-sm font-extrabold tracking-widest uppercase ${isPlayerTurn ? 'text-gold' : 'text-ivory/50'}`}>
              {isPlayerTurn ? 'ตาของคุณเล่น' : 'ตาของ AI กำลังวิเคราะห์...'}
            </span>
            {isPlayerTurn && gamePhase === 'GUESS' && (
              <p className="text-[10px] text-ivory/55 font-semibold mt-1 tracking-wide leading-relaxed">เลือกการ์ดของ AI ด้านบน แล้วทายค่าตัวเลขหรือทายว่าเป็น Joker</p>
            )}
            {isPlayerTurn && gamePhase === 'DECIDE' && (
              <p className="text-[10px] text-green-400 font-bold mt-1 tracking-wide leading-relaxed">ทายถูกต้อง! จะเสี่ยงทายใบต่อไป หรือกดผ่านเทิร์นเพื่อเซฟการ์ดที่จั่วได้?</p>
            )}
          </div>
        )}
      </div>

      {/* 3. Timer Indicator progress bar */}
      {(gamePhase === 'GUESS' || gamePhase === 'DECIDE') && (
        <div className="bg-charcoal-dark border border-gold/15 rounded-full h-5 overflow-hidden p-[2px] shadow-inner relative flex items-center">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              timeLeft > 10 
                ? 'bg-emerald-700' 
                : timeLeft > 5 
                ? 'bg-amber-600' 
                : 'bg-red-700'
            }`}
            style={{ width: `${(timeLeft / 20) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tracking-widest text-ivory uppercase gap-1">
            <Clock className="w-3 h-3 text-gold" />
            <span>เวลาเทิร์น: {timeLeft} วินาที</span>
          </div>
        </div>
      )}

      {/* Combo feedback banner */}
      {consecutiveGuesses > 1 && (
        <div className="bg-emerald-950/50 border border-emerald-500/20 rounded-lg py-2 px-3 text-center text-xs font-bold text-green-300 tracking-widest animate-pulse">
          ทายถูกต่อเนื่อง: x{consecutiveGuesses} คอมโบ! (โบนัสสะสม +{5 * (consecutiveGuesses - 1)} คะแนน)
        </div>
      )}
    </div>
  );
}
