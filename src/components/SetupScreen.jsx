import React from 'react';
import { Volume2, VolumeX, HelpCircle, Trophy, Settings, Play } from 'lucide-react';

export default function SetupScreen({ 
  aiDifficulty, 
  cardRemovalCount, 
  onConfigChange, 
  onStartGame,
  isMuted,
  onToggleMute,
  scores,
  onResetScores
}) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-radial-table relative font-thai overflow-hidden">

      {/* Sound toggle — top right */}
      <div className="absolute top-5 right-5 z-10">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          className="p-3 bg-charcoal-dark/70 text-gold border border-gold/25 hover:border-gold/60 rounded-full transition-all duration-200 shadow-lg cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" strokeWidth={2} /> : <Volume2 className="w-4 h-4" strokeWidth={2} />}
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-charcoal/95 border border-gold/35 rounded-2xl p-8 shadow-2xl shadow-black/80 text-center relative overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-gold/60 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-gold/60 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-gold/60 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-gold/60 rounded-br-xl pointer-events-none" />

        {/* Sub-label */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px w-10 bg-gold/35" />
          <span className="text-[9px] font-bold text-gold/50 uppercase tracking-[0.25em]">Classic Board Game</span>
          <div className="h-px w-10 bg-gold/35" />
        </div>

        {/* Main Title */}
        <h1 className="text-5xl font-bold text-gold tracking-[0.12em] uppercase leading-none mb-1 drop-shadow-sm">
          DAVINCI CODE
        </h1>
        <p className="text-[10px] font-semibold text-ivory/35 tracking-[0.2em] uppercase mb-7 leading-none">
          รหัสลับดาวินชี — Solo vs AI
        </p>

        {/* Scoreboard */}
        <div className="wood-panel rounded-xl px-6 py-4 mb-7 flex items-center justify-around relative">
          <div className="text-center">
            <span className="text-[9px] font-semibold text-gold/50 block uppercase tracking-widest mb-1.5 leading-none">ผู้เล่น</span>
            <span className="text-4xl font-bold text-ivory leading-none tabular-nums">{scores.player}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Trophy className="w-4 h-4 text-gold" strokeWidth={2} />
            <span className="text-[8px] font-semibold text-gold/60 uppercase tracking-widest leading-none">คะแนนสะสม</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-semibold text-gold/50 block uppercase tracking-widest mb-1.5 leading-none">AI บอท</span>
            <span className="text-4xl font-bold text-ivory leading-none tabular-nums">{scores.ai}</span>
          </div>

          {(scores.player > 0 || scores.ai > 0) && (
            <button
              onClick={onResetScores}
              className="absolute -bottom-3 right-4 bg-charcoal text-[8px] font-bold text-red-400/70 hover:text-red-400 border border-red-900/30 hover:border-red-500/50 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer uppercase tracking-widest"
            >
              ล้างคะแนน
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-5 text-left bg-felt-dark/40 border border-gold/12 rounded-xl p-5 mb-7">
          {/* AI Difficulty */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-3.5 h-3.5 text-gold" strokeWidth={2} />
              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">ระดับความยากของ AI</label>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => onConfigChange({ aiDifficulty: diff, cardRemovalCount })}
                  className={`py-3 text-[10px] font-bold rounded-xl border transition-all duration-200 cursor-pointer uppercase tracking-wider ${
                    aiDifficulty === diff
                      ? 'bg-gold text-charcoal-dark border-gold-light shadow-md'
                      : 'bg-charcoal-dark/70 border-gold/15 text-ivory/45 hover:border-gold/35 hover:text-ivory/75'
                  }`}
                >
                  {diff === 'easy' ? 'ง่าย' : diff === 'medium' ? 'ปานกลาง' : 'ยาก'}
                </button>
              ))}
            </div>
          </div>

          {/* Card Removal */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-3.5 h-3.5 text-gold" strokeWidth={2} />
              <label className="text-[10px] font-bold text-gold uppercase tracking-widest">การ์ดสุ่มออกจากเกม</label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 2, 4, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onConfigChange({ aiDifficulty, cardRemovalCount: count })}
                  className={`py-3 text-[10px] font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                    cardRemovalCount === count
                      ? 'bg-gold text-charcoal-dark border-gold-light shadow-md'
                      : 'bg-charcoal-dark/70 border-gold/15 text-ivory/45 hover:border-gold/35 hover:text-ivory/75'
                  }`}
                >
                  {count} ใบ
                </button>
              ))}
            </div>
            <p className="text-[9px] font-medium text-ivory/35 mt-3 leading-relaxed">
              การ์ดที่ถูกดึงออกจะปิดหน้าและไม่มีใครรู้ว่าคืออะไร ทำให้เกมท้าทายขึ้น
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          className="w-full py-4 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm tracking-[0.15em] rounded-xl border border-gold-light/60 transition-all duration-250 shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md cursor-pointer flex items-center justify-center gap-2.5 uppercase mb-6"
        >
          <Play className="w-4 h-4 fill-current" strokeWidth={0} />
          เริ่มเกมการแข่งขัน
        </button>

        {/* Rules Summary */}
        <div className="pt-5 border-t border-gold/12 text-left space-y-2">
          <div className="flex items-center gap-2 text-gold/55 mb-2">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">กฎกติกาเบื้องต้น</span>
          </div>
          <p className="text-[10px] font-medium text-ivory/40 leading-relaxed">
            • ผู้เล่นแต่ละคนได้รับการ์ดตั้งต้น 4 ใบ เรียงจากน้อยไปมาก (ซ้ายไปขวา)
          </p>
          <p className="text-[10px] font-medium text-ivory/40 leading-relaxed">
            • ในแต่ละเทิร์น: จั่วการ์ด 1 ใบ แล้วเดาการ์ดของ AI — ทายถูกเลือกทายต่อหรือผ่าน, ทายผิดต้องเปิดการ์ดจั่วทันที
          </p>
        </div>
      </div>
    </div>
  );
}
