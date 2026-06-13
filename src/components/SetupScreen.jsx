import React from 'react';
import { Volume2, VolumeX, Settings, Skull, Sparkles } from 'lucide-react';

export default function SetupScreen({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  isMuted,
  onToggleMute,
  playSFX,
  onOpenSettings,
}) {
  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-haunted relative font-thai overflow-y-auto md:overflow-hidden select-none">

      {/* Atmospheric particles — pure CSS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[rgba(127,29,29,0.05)]"
            style={{
              width: `${Math.random() * 250 + 60}px`,
              height: `${Math.random() * 250 + 60}px`,
              left: `${Math.random() * 95}%`,
              top: `${Math.random() * 95}%`,
              filter: 'blur(50px)',
              animation: `eeriePulse ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Settings toggle floating */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={() => {
            if (playSFX) playSFX('flip');
            onOpenSettings();
          }}
          title="ตั้งค่าเสียง"
          className="p-3 bg-[rgba(10,10,12,0.8)] text-bone/50 border border-[rgba(127,29,29,0.25)] hover:border-[rgba(127,29,29,0.6)] hover:text-bone/90 transition-all duration-300 shadow-lg cursor-pointer animate-pulse"
          style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
        >
          <Settings className="w-4 h-4 text-rose-500" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── LEFT HALF: Brand, Theme & Lore ── */}
      <div className="flex-[0.8] flex flex-col justify-center px-8 md:pl-24 md:pr-8 py-12 md:py-0 relative z-10 text-left">
        <div className="max-w-xl">
          {/* Top category label */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[rgba(230,60,60,0.85)] text-lg">✝</span>
            <span className="text-xs md:text-sm font-extrabold text-[rgba(230,60,60,0.85)] uppercase tracking-[0.3em]">
              รหัสลับต้องห้ามแห่งความตาย
            </span>
          </div>

          {/* Title */}
          <h1 className="text-7xl md:text-8xl font-black text-bone tracking-[0.12em] font-cinzel uppercase leading-tight text-flicker drop-shadow-2xl mb-2">
            DAVINCI CODE
          </h1>
          <p className="text-base font-extrabold text-[rgba(230,60,60,0.9)] tracking-[0.25em] uppercase mb-8">
            ☠ &nbsp; ทายรหัสหรือทิ้งชีวิต &nbsp; ☠
          </p>

          {/* Lore quote */}
          <div className="bg-[rgba(127,29,29,0.04)] border-l-2 border-[rgba(153,27,27,0.7)] px-6 py-4 mb-8">
            <p className="text-base font-semibold text-bone/70 leading-relaxed italic">
              "วิญญาณสถิตอยู่ในแผ่นจารึก... ผู้ใดถอดรหัสลับของมันได้ครบจะได้รับอิสรภาพจากดินแดนนี้ แต่หากทำลายความลับนี้ไม่ได้ ชะตากรรมจะจบสิ้นใต้เงามืดกาลเวลา..."
            </p>
          </div>

          {/* Rules info boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[rgba(10,10,14,0.4)] border border-[rgba(127,29,29,0.12)] p-4 rounded-lg">
              <span className="text-sm font-black text-[rgba(230,80,80,0.85)] uppercase tracking-wider block mb-1">
                ✦ กติกาพื้นฐาน
              </span>
              <p className="text-xs md:text-sm text-bone/60 leading-relaxed">
                ได้รับแผ่นจารึก 4 ใบ เรียงจากน้อยไปมาก จั่วเพิ่มแล้วเลือกเดารหัสฝ่ายตรงข้าม ทายถูกเล่นต่อได้ ทายผิดต้องเปิดเผยแผ่นจารึกของตัวเอง
              </p>
            </div>
            <div className="bg-[rgba(10,10,14,0.4)] border border-[rgba(127,29,29,0.12)] p-4 rounded-lg">
              <span className="text-sm font-black text-[rgba(230,80,80,0.85)] uppercase tracking-wider block mb-1">
                ✦ แผ่นจารึกตัวตลก (Joker)
              </span>
              <p className="text-xs md:text-sm text-bone/60 leading-relaxed">
                การ์ดดาว ★ สามารถสอดไว้ตรงตำแหน่งใดก็ได้ในบอร์ดมือของคุณเพื่อหลอกล่อศัตรูไม่ให้ค้นพบรหัสที่แท้จริง
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT HALF: Settings & Start Action ── */}
      <div className="flex-[1.2] flex items-center justify-center md:justify-start md:pl-16 px-6 py-12 md:py-0 relative z-10">
        <div className="w-full max-w-xl bg-[#0c0c10]/85 border border-[rgba(127,29,29,0.32)] p-10 md:p-12 shadow-2xl shadow-black rounded-xl backdrop-blur-md">
          {/* Section title */}
          <div className="flex items-center justify-between border-b border-[rgba(127,29,29,0.15)] pb-3 mb-6">
            <span className="text-sm font-black text-bone tracking-widest uppercase">
              ตั้งค่ากระดานพิธีกรรม
            </span>
            <Skull className="w-4 h-4 text-[rgba(230,60,60,0.7)]" strokeWidth={1.5} />
          </div>

          <div className="space-y-6">
            {/* AI Difficulty */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-3.5 h-3.5 text-[rgba(230,60,60,0.75)]" strokeWidth={2} />
                <label className="text-xs md:text-sm font-black text-[rgba(230,80,80,0.9)] uppercase tracking-[0.18em]">
                  ระดับความดุร้ายของวิญญาณ (AI)
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      if (playSFX) playSFX('flip');
                      onConfigChange({ aiDifficulty: diff, cardRemovalCount });
                    }}
                    className={`py-4 text-xs md:text-sm font-black border transition-all duration-300 cursor-pointer uppercase tracking-wider ${
                      aiDifficulty === diff
                        ? 'bg-[#1a0808] text-[#ef4444] border-[rgba(153,27,27,0.7)] shadow-[0_0_16px_rgba(127,29,29,0.2)]'
                        : 'bg-[rgba(10,10,12,0.8)] border-[rgba(127,29,29,0.15)] text-bone/65 hover:border-[rgba(127,29,29,0.4)] hover:text-bone/95'
                    }`}
                    style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                  >
                    {diff === 'easy' ? 'ง่าย' : diff === 'medium' ? 'ปานกลาง' : 'อันตราย'}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Removal */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[rgba(230,60,60,0.75)] text-xs font-black">✝</span>
                <label className="text-xs md:text-sm font-black text-[rgba(230,80,80,0.9)] uppercase tracking-[0.18em]">
                  การ์ดที่คัดออกจากพิธี (คว่ำหน้าปริศนา)
                </label>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 2, 4, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      if (playSFX) playSFX('flip');
                      onConfigChange({ aiDifficulty, cardRemovalCount: count });
                    }}
                    className={`py-3.5 text-xs md:text-sm font-black border transition-all duration-300 cursor-pointer ${
                      cardRemovalCount === count
                        ? 'bg-[#1a0808] text-[#ef4444] border-[rgba(153,27,27,0.7)]'
                        : 'bg-[rgba(10,10,12,0.8)] border-[rgba(127,29,29,0.15)] text-bone/65 hover:border-[rgba(127,29,29,0.4)] hover:text-bone/95'
                    }`}
                    style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                  >
                    {count} ใบ
                  </button>
                ))}
              </div>
              <p className="text-[12px] md:text-xs font-semibold text-bone/50 mt-2.5 leading-relaxed">
                การ์ดที่ถูกสุ่มนำออกจะถูกปิดตายตลอดทั้งเกมโดยไม่มีใครทราบค่า
              </p>
            </div>

            {/* START button */}
            <button
              onClick={onStartGame}
              className="w-full py-5 mt-6 bg-[#0e0505] hover:bg-[#1a0808] text-[#ef4444] font-black text-lg tracking-[0.3em] border border-[rgba(153,27,27,0.5)] hover:border-[rgba(200,40,40,0.9)] transition-all duration-300 shadow-xl active-blood-pulse cursor-pointer flex items-center justify-center gap-3 uppercase"
              style={{ clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' }}
            >
              <Skull className="w-5 h-5 text-[#ef4444]" />
              เข้าสู่พิธีกรรม
              <Skull className="w-5 h-5 text-[#ef4444]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
