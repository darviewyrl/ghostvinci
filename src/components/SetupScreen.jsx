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
    <div className="min-h-screen flex flex-col items-center justify-center bg-radial-table p-6 relative font-thai">
      {/* Sound Toggle (Top-Right) */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className="p-3 bg-charcoal text-gold border border-gold/40 hover:border-gold rounded-full transition-all duration-300 shadow-lg shadow-black/45 hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-xl bg-charcoal/95 border-2 border-gold rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/85 text-center relative overflow-hidden">
        {/* Golden Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-xl pointer-events-none" />

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-[1px] w-12 bg-gold/50" />
          <span className="text-[10px] font-bold text-gold tracking-widest uppercase">Classic Board Game</span>
          <div className="h-[1px] w-12 bg-gold/50" />
        </div>

        {/* Vintage Title */}
        <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-widest text-gold mb-2 drop-shadow-lg leading-normal">
          DAVINCI CODE
        </h1>
        <p className="text-xs font-bold text-ivory/50 tracking-widest uppercase mb-8 leading-relaxed">
          รหัสลับดาวินชี — Solo vs AI
        </p>

        {/* Persistent Scoreboard Card */}
        <div className="wood-panel rounded-xl p-5 mb-8 flex items-center justify-around relative shadow-lg shadow-black/35">
          <div className="text-center">
            <span className="text-[10px] font-bold text-gold-light/60 block mb-1.5 uppercase tracking-widest">ผู้เล่น</span>
            <span className="text-4xl font-extrabold text-ivory drop-shadow-md leading-none">{scores.player}</span>
          </div>
          
          <div className="flex flex-col items-center px-4">
            <Trophy className="w-5 h-5 text-gold mb-1" />
            <span className="text-[9px] font-bold text-gold/80 uppercase tracking-widest leading-none">คะแนนสะสม</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold text-gold-light/60 block mb-1.5 uppercase tracking-widest">AI บอท</span>
            <span className="text-4xl font-extrabold text-ivory drop-shadow-md leading-none">{scores.ai}</span>
          </div>

          { (scores.player > 0 || scores.ai > 0) && (
            <button 
              onClick={onResetScores}
              className="absolute -bottom-3.5 right-6 bg-charcoal border border-red-950/60 hover:border-red-500 text-[9px] font-bold text-red-400 hover:text-red-300 px-3 py-1 rounded transition-all duration-300 cursor-pointer shadow-md shadow-black/25 uppercase tracking-widest"
            >
              ล้างคะแนน
            </button>
          )}
        </div>

        {/* Settings Area */}
        <div className="space-y-6 text-left bg-felt-dark/45 border border-gold/15 rounded-xl p-6 mb-8 shadow-inner">
          {/* AI Difficulty Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-gold" />
              <label className="text-xs font-bold text-gold uppercase tracking-widest">
                ระดับความยากของ AI
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => onConfigChange({ aiDifficulty: diff, cardRemovalCount })}
                  className={`py-3.5 px-2 text-xs font-bold rounded-lg border transition-all duration-300 cursor-pointer uppercase tracking-widest ${
                    aiDifficulty === diff
                      ? 'bg-gold text-charcoal-dark border-gold font-extrabold shadow-md shadow-black/35 scale-[1.02]'
                      : 'bg-charcoal-dark/80 border-gold/25 text-ivory/50 hover:border-gold/50 hover:text-ivory'
                  }`}
                >
                  {diff === 'easy' ? 'ง่าย' : diff === 'medium' ? 'ปานกลาง' : 'ยาก'}
                </button>
              ))}
            </div>
          </div>

          {/* Card Removal Count Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-gold" />
              <label className="text-xs font-bold text-gold uppercase tracking-widest">
                การสุ่มนำการ์ดออกจากเกม
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[0, 2, 4, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onConfigChange({ aiDifficulty, cardRemovalCount: count })}
                  className={`py-3.5 px-1 text-xs font-bold rounded-lg border transition-all duration-300 cursor-pointer ${
                    cardRemovalCount === count
                      ? 'bg-gold text-charcoal-dark border-gold font-extrabold shadow-md shadow-black/35 scale-[1.02]'
                      : 'bg-charcoal-dark/80 border-gold/25 text-ivory/50 hover:border-gold/50 hover:text-ivory'
                  }`}
                >
                  {count} ใบ
                </button>
              ))}
            </div>
            <p className="text-[10px] font-medium text-ivory/45 mt-3 leading-relaxed">
              *การ์ดที่ถูกสุ่มดึงออกจะคว่ำหน้าและนำออกจากเกมถาวร โดยไม่มีใครรู้ (รวมถึง AI) ทำให้การประเมินสถานการณ์ยากขึ้นและท้าทายมากขึ้น
            </p>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full py-4 bg-gold hover:bg-gold-dark text-charcoal-dark font-extrabold text-base tracking-widest rounded-xl border border-gold-light transition-all duration-300 shadow-lg shadow-black/60 hover:-translate-y-1 hover:shadow-black/75 active:translate-y-0 active:shadow-md cursor-pointer flex items-center justify-center gap-2 uppercase"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>เริ่มเกมการแข่งขัน</span>
        </button>

        {/* Rules Summary Section */}
        <div className="mt-8 pt-6 border-t border-gold/20 text-left space-y-2.5">
          <div className="flex gap-2 items-center text-gold/80 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">กฎกติกาการเล่นเบื้องต้น:</span>
          </div>
          <p className="text-[11px] font-medium text-ivory/50 leading-relaxed pl-1">
            • ผู้เล่นแต่ละคนจะได้รับการ์ดตั้งต้น 4 ใบ (เรียงจากค่าน้อยไปมาก ซ้ายไปขวา โดยการ์ดสีดำอยู่ซ้ายสุดหากค่าเท่ากัน)
          </p>
          <p className="text-[11px] font-medium text-ivory/50 leading-relaxed pl-1">
            • ในแต่ละเทิร์น: จั่วการ์ด 1 ใบเข้ามา พยายามเลือกการ์ดของคู่แข่งแล้วทายตัวเลข (หากทายถูก สามารถเลือกเสี่ยงทายใบต่อไป หรือกดผ่านเพื่อซ่อนการ์ดจั่วไว้เป็นความลับ แต่หากทายผิดจะต้องเปิดเผยการ์ดจั่วใบนั้นให้เห็นทันที)
          </p>
        </div>
      </div>
    </div>
  );
}
