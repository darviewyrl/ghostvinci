import React, { useState, useEffect } from 'react';
import { Settings, Skull, Sparkles, Flame, Eye, Layers, HelpCircle, ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react';

const EMBERS = Array.from({ length: 7 }, (_, i) => ({
  left: `${10 + i * 12}%`,
  top: `${8 + (i % 4) * 18}%`,
  size: 56 + (i % 3) * 26,
  delay: `${i * 0.5}s`,
  duration: `${6 + (i % 3)}s`,
}));

const RISING_SPARKS = Array.from({ length: 24 }, (_, i) => {
  const seed1 = Math.sin(i * 123.456);
  const seed2 = Math.cos(i * 456.789);
  const left = `${(Math.abs(seed1) * 100).toFixed(1)}%`;
  const size = (2.5 + Math.abs(seed2) * 4.5).toFixed(1); // 2.5px to 7px
  const duration = (9 + Math.abs(seed1) * 9).toFixed(1); // 9s to 18s
  const delay = (Math.abs(seed2) * 12).toFixed(1); // 0s to 12s
  const driftX = `${(seed1 * 100).toFixed(0)}px`;
  return { left, size, duration, delay, driftX };
});

// Detailed game manual modal is rendered dynamically below

export default function SetupScreen({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  isMuted,
  onToggleMute,
  playSFX,
  onOpenSettings,
  scores,
  onResetScores,
}) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('intro');

  useEffect(() => {
    if (!isTutorialOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTutorialOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialOpen]);

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-haunted font-thai select-none">
      {/* 1. Large ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {EMBERS.map((ember, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-[rgba(140,20,20,0.08)] animate-ghost-bob"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              left: ember.left,
              top: ember.top,
              filter: 'blur(40px)',
              animationDelay: ember.delay,
              animationDuration: ember.duration,
            }}
          />
        ))}
      </div>

      {/* 2. Dark ambient overlay gradients (radial & linear) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.24),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />

      {/* 4. Rising ritual embers/sparks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {RISING_SPARKS.map((spark, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-gradient-to-t from-[rgba(239,68,68,0.7)] to-[rgba(249,115,22,0.9)] animate-ember shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            style={{
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              left: spark.left,
              bottom: '-20px',
              animationDuration: `${spark.duration}s`,
              animationDelay: `${spark.delay}s`,
              '--drift-x': spark.driftX,
            }}
          />
        ))}
      </div>

      <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            if (playSFX) playSFX('flip');
            setIsTutorialOpen(true);
            setActiveTab('intro');
          }}
          title="วิธีการเล่น"
          className="group border-2 border-[rgba(127,29,29,0.32)] bg-[rgba(10,10,12,0.9)] p-4 text-bone shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-xl hover:scale-110 active:scale-95 hover:border-red-500 hover:text-red-405 hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all duration-300 ease-out cursor-pointer relative flex items-center justify-center"
        >
          <HelpCircle className="h-6 w-6 text-rose-500 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
        </button>

        <button
          onClick={() => {
            if (playSFX) playSFX('flip');
            onOpenSettings();
          }}
          title="ตั้งค่าเสียง"
          className="group border-2 border-[rgba(127,29,29,0.32)] bg-[rgba(10,10,12,0.9)] p-4 text-bone shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-xl hover:scale-110 active:scale-95 hover:border-red-500 hover:text-red-405 hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all duration-300 ease-out cursor-pointer relative"
        >
          <Settings className="h-6 w-6 text-rose-500 transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-180" strokeWidth={2} />
        </button>
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-center px-6 py-20 sm:px-10 lg:flex-row lg:items-center lg:gap-12 lg:px-10 lg:py-16 xl:gap-24 xl:px-16">
        <section className="w-full lg:max-w-2xl xl:max-w-4xl">
          <div 
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(230,80,80,0.24)] bg-black/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.32em] text-[rgba(230,80,80,0.9)] backdrop-blur-sm sm:text-xs animate-fade-slide-up"
            style={{ animationDelay: '50ms' }}
          >
            <span className="text-[rgba(230,60,60,0.95)]">✝</span>
            Ghostvinci
          </div>

          <h1 className="mt-5 max-w-none text-[3.5rem] font-black uppercase leading-[0.84] tracking-[0.07em] text-bone font-cinzel drop-shadow-2xl sm:text-[4.8rem] lg:text-[4.2rem] xl:text-[6.8rem] animate-title-cinematic">
            Ghostvinci
          </h1>

          <p 
            className="mt-4 text-base font-semibold uppercase tracking-[0.22em] text-[rgba(230,80,80,0.9)] sm:text-xl xl:text-2xl animate-fade-slide-up"
            style={{ animationDelay: '150ms' }}
          >
            ไพ่ลึกลับแห่งเงามืด
          </p>

          <p 
            className="mt-6 max-w-2xl text-lg leading-[1.75] text-bone/75 sm:text-xl xl:text-2xl animate-fade-slide-up"
            style={{ animationDelay: '250ms' }}
          >
            เปิดเกมให้ไว เลือกพิธีกรรมสั้น ๆ แล้วลงสนามทายไพ่ในโลกสยองขวัญของ Ghostvinci ได้ทันที
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div 
              className="rounded-[18px] border border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.5)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] animate-fade-slide-up feature-card-item"
              style={{ animationDelay: '350ms' }}
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[rgba(230,80,80,0.9)]">เร็ว</p>
              <p className="mt-2 text-base leading-[1.6] text-bone/70">เข้าเกมได้ทันที ไม่ต้องอ่านรายละเอียดเยอะ</p>
            </div>
            <div 
              className="rounded-[18px] border border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.5)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] animate-fade-slide-up feature-card-item"
              style={{ animationDelay: '450ms' }}
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[rgba(230,80,80,0.9)]">หลอน</p>
              <p className="mt-2 text-base leading-[1.6] text-bone/70">โทนพิธีกรรมสีเลือด เงามืด และจังหวะกดดัน</p>
            </div>
            <div 
              className="rounded-[18px] border border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.5)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] animate-fade-slide-up feature-card-item"
              style={{ animationDelay: '550ms' }}
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[rgba(230,80,80,0.9)]">พร้อมเล่น</p>
              <p className="mt-2 text-base leading-[1.6] text-bone/70">ตั้งค่า AI กับจำนวนไพ่ที่คัดออกแล้วเริ่มได้เลย</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 pb-2">
            <span 
              className="rounded-full border border-[rgba(127,29,29,0.18)] bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bone/58 animate-fade-slide-up hover:scale-105 hover:border-red-500/40 hover:text-bone/85 hover:bg-black/50 transition-all duration-300 ease-out cursor-default"
              style={{ animationDelay: '650ms' }}
            >
              Single Player
            </span>
            <span 
              className="rounded-full border border-[rgba(127,29,29,0.18)] bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bone/58 animate-fade-slide-up hover:scale-105 hover:border-red-500/40 hover:text-bone/85 hover:bg-black/50 transition-all duration-300 ease-out cursor-default"
              style={{ animationDelay: '700ms' }}
            >
              20 Sec Turns
            </span>
            <span 
              className="rounded-full border border-[rgba(127,29,29,0.18)] bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bone/58 animate-fade-slide-up hover:scale-105 hover:border-red-500/40 hover:text-bone/85 hover:bg-black/50 transition-all duration-300 ease-out cursor-default"
              style={{ animationDelay: '750ms' }}
            >
              Joker Chaos
            </span>
          </div>
        </section>

        <section 
          className="mt-10 w-full lg:mt-0 lg:max-w-[28rem] lg:flex-shrink-0 animate-fade-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="rounded-[28px] border border-red-900/55 bg-[rgba(10,10,14,0.92)] p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-xl sm:p-8 transition-[border-color,box-shadow] duration-500 hover:border-red-750/70 relative overflow-hidden">
            {/* Gothic Decorative Corners */}
            <span className="absolute top-2.5 left-3 text-[10px] font-mono text-red-600/30 select-none">†</span>
            <span className="absolute top-2.5 right-3 text-[10px] font-mono text-red-600/30 select-none">†</span>
            <span className="absolute bottom-2 left-3 text-[10px] font-mono text-red-600/30 select-none">†</span>
            <span className="absolute bottom-2 right-3 text-[10px] font-mono text-red-600/30 select-none">†</span>

            <div className="flex items-center justify-between border-b border-[rgba(127,29,29,0.16)] pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgba(230,80,80,0.9)]">ตั้งค่าพิธีกรรม</p>
                <h2 className="mt-1 text-xl font-black uppercase tracking-[0.12em] text-bone sm:text-2xl">
                  เริ่มเกมให้ไว
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-bold text-bone/45 uppercase tracking-widest">Ritual Active: Single Player</span>
                </div>
              </div>
              <Skull className="h-5 w-5 text-[rgba(230,60,60,0.72)]" strokeWidth={1.7} />
            </div>

            <div className="mt-6 space-y-6">
              {/* Spirit Ferocity Segment */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[rgba(230,60,60,0.78)]" strokeWidth={2} />
                  <label className="text-sm font-black uppercase tracking-[0.18em] text-[rgba(230,80,80,0.92)] sm:text-base">
                    ระดับความดุร้ายของวิญญาณ
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
                      className={`group py-3 flex flex-col items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider config-selector-btn sm:text-sm border-2 cursor-pointer ${
                        aiDifficulty === diff
                          ? 'border-red-500 bg-[#220707] text-[#ff3333] shadow-[0_0_15px_rgba(239,68,68,0.45)] scale-[1.03]'
                          : 'border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.82)] text-bone/50 hover:border-red-800/50 hover:text-bone/90 hover:scale-[1.01]'
                      }`}
                      style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                    >
                      {diff === 'easy' && <Flame className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${aiDifficulty === 'easy' ? 'text-[#ff3333]' : 'text-bone/45 group-hover:text-bone/85'}`} />}
                      {diff === 'medium' && <Eye className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${aiDifficulty === 'medium' ? 'text-[#ff3333]' : 'text-bone/45 group-hover:text-bone/85'}`} />}
                      {diff === 'hard' && <Skull className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${aiDifficulty === 'hard' ? 'text-[#ff3333]' : 'text-bone/45 group-hover:text-bone/85'}`} />}
                      <span>{diff === 'easy' ? 'ง่าย' : diff === 'medium' ? 'ปานกลาง' : 'อันตราย'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Exclusion Segment */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[rgba(230,60,60,0.78)]" strokeWidth={2} />
                  <label className="text-sm font-black uppercase tracking-[0.18em] text-[rgba(230,80,80,0.92)] sm:text-base">
                    คัดไพ่ออก
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 2, 4, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        if (playSFX) playSFX('flip');
                        onConfigChange({ aiDifficulty, cardRemovalCount: count });
                      }}
                      className={`group py-2.5 flex flex-col items-center justify-center gap-1.5 text-xs font-black config-selector-btn sm:text-sm border-2 cursor-pointer ${
                        cardRemovalCount === count
                          ? 'border-red-500 bg-[#220707] text-[#ff3333] shadow-[0_0_15px_rgba(239,68,68,0.45)] scale-[1.03]'
                          : 'border-[rgba(127,29,29,0.22)] bg-[rgba(8,8,10,0.82)] text-bone/50 hover:border-red-800/50 hover:text-bone/90 hover:scale-[1.01]'
                      }`}
                      style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                    >
                      <Layers className={`w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110 ${
                        cardRemovalCount === count ? 'text-[#ff3333]' : 'text-bone/45 group-hover:text-bone/85'
                      }`} />
                      <span>{count} ใบ</span>
                    </button>
                  ))}
                </div>
              </div>

              {scores && (scores.player > 0 || scores.ai > 0) && (
                <div className="rounded-[20px] border border-[rgba(127,29,29,0.18)] bg-black/35 p-4 animate-fade-slide-up animate-once" style={{ animationDelay: '200ms' }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-[rgba(230,80,80,0.9)]">คะแนนล่าสุด</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (playSFX) playSFX('toggle');
                        onResetScores();
                      }}
                      className="text-[11px] font-bold uppercase tracking-widest text-bone/40 underline transition-colors hover:text-rose-400 cursor-pointer"
                    >
                      ล้างคะแนน
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-5">
                    <div className="text-center">
                      <span className="block text-[11px] uppercase tracking-widest text-bone/50">คุณ</span>
                      <span className="text-3xl font-black text-emerald-400">{scores.player}</span>
                    </div>
                    <div className="text-2xl font-black text-bone/25">:</div>
                    <div className="text-center">
                      <span className="block text-[11px] uppercase tracking-widest text-bone/50">AI</span>
                      <span className="text-3xl font-black text-rose-500">{scores.ai}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onStartGame}
                className="flex w-full items-center justify-center gap-3 border-none bg-[#ef4444] animate-cta-breath cta-ritual-btn py-4 text-lg font-black uppercase tracking-[0.26em] text-neutral-950 cursor-pointer sm:py-5 sm:text-xl hover:bg-[#ff5555]"
                style={{ clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' }}
              >
                <Skull className="h-5 w-5 text-neutral-950 animate-pulse" />
                เข้าสู่พิธีกรรม
                <Skull className="h-5 w-5 text-neutral-950 animate-pulse" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── TUTORIAL MODAL ── */}
      <div 
        onClick={() => {
          if (playSFX) playSFX('toggle');
          setIsTutorialOpen(false);
        }}
        className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-[6px] p-4 cursor-pointer transition-all duration-300 ease-in-out ${
          isTutorialOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#0c0c10]/95 border border-[rgba(239,68,68,0.32)] max-w-2xl w-full max-h-[calc(100vh-4rem)] shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_20px_rgba(239,68,68,0.15)] rounded-2xl relative font-thai cursor-default flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isTutorialOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
          }`}
        >
          {/* Close button top right */}
          <button
            onClick={() => {
              if (playSFX) playSFX('toggle');
              setIsTutorialOpen(false);
            }}
            className="absolute top-4 right-4 p-2 text-bone/40 hover:text-rose-500 rounded-lg hover:bg-black/40 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Tab Selection */}
          <div className="flex border-b border-[rgba(239,68,68,0.15)] bg-black/40 overflow-x-auto select-none font-thai scrollbar-none shrink-0">
            {['intro', 'sorting', 'joker', 'turn'].map((tab) => {
              const label = tab === 'intro' ? 'กติกาเบื้องต้น' :
                            tab === 'sorting' ? 'การเรียงลำดับ' :
                            tab === 'joker' ? 'ไพ่พิเศษ Joker' : 'ขั้นตอนการเล่น';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (playSFX) playSFX('flip');
                    setActiveTab(tab);
                  }}
                  className={`flex-1 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-center transition-all duration-300 border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-rose-600 bg-rose-950/20 text-rose-400'
                      : 'border-transparent text-bone/45 hover:text-bone/80 hover:bg-black/20'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Grimoire Content Scroll Area */}
          <div className="curse-scrollbar p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto font-thai text-bone">
            {activeTab === 'intro' && (
              <div className="space-y-4 animate-fade-slide-up">
                <div className="border-l-4 border-rose-600 pl-3">
                  <h4 className="text-lg font-black text-rose-500 uppercase tracking-wide">วิถีแห่งการถอดรหัสลับ</h4>
                  <p className="text-xs font-bold text-bone/50 uppercase tracking-widest">เป้าหมายพื้นฐานของพิธีกรรม</p>
                </div>
                
                <p className="text-sm text-bone/80 leading-relaxed bg-black/20 border border-neutral-900/60 p-4 rounded-xl">
                  GHOSTVINCI คือพิธีกรรมการถอดรหัสลับของจารึกไพ่ ซึ่งอ้างอิงมาจากบอร์ดเกม Da Vinci Code (Coda) ยอดนิยม คุณและวิญญาณคู่ต่อสู้ (AI) จะเริ่มต้นด้วยไพ่คว่ำจำนวนหนึ่ง และผลัดกันคาดเดาหมายเลขไพ่ของอีกฝ่ายเพื่อบังคับให้หงายหน้าจนครบหมดทุกคน ฝ่ายใดที่ไพ่ถูกเปิดเผยจนหมดสิ้นก่อน จะพ่ายแพ้ทันที!
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl">
                    <span className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-1.5">1. กองไพ่ทั้งหมด (26 ใบ)</span>
                    <ul className="text-xs text-bone/70 space-y-1 list-disc pl-4">
                      <li>ไพ่หมายเลขปกติ (0 ถึง 11) สีดำ 12 ใบ</li>
                      <li>ไพ่หมายเลขปกติ (0 ถึง 11) สีขาว 12 ใบ</li>
                      <li>ไพ่พิเศษ Joker (ไม่มีหมายเลข) สีดำ 1 ใบ และ สีขาว 1 ใบ</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl">
                    <span className="block text-xs font-black text-rose-500 uppercase tracking-widest mb-1.5">2. การเตรียมการเริ่มเกม</span>
                    <ul className="text-xs text-bone/70 space-y-1 list-disc pl-4">
                      <li>แจกไพ่เริ่มต้นคนละ 4 ใบ (สุ่มจากสำรับ)</li>
                      <li>ไพ่ที่เหลือจะคว่ำหน้าเป็นสำรับกลาง</li>
                      <li>ไพ่บางส่วน (0, 2, 4 หรือ 6 ใบ) จะถูกคัดออกจากสำรับตามที่กำหนดเพื่อเพิ่มความท้าทาย</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sorting' && (
              <div className="space-y-4 animate-fade-slide-up">
                <div className="border-l-4 border-rose-600 pl-3">
                  <h4 className="text-lg font-black text-rose-500 uppercase tracking-wide">วิถีการจัดทัพแผ่นจารึก</h4>
                  <p className="text-xs font-bold text-bone/50 uppercase tracking-widest">กฎการจัดเรียงไพ่ในมือ</p>
                </div>

                <p className="text-sm text-bone/80 leading-relaxed bg-black/20 border border-neutral-900/60 p-4 rounded-xl">
                  ไพ่ในมือของทั้งผู้เล่นและ AI จะถูกจัดเรียงตามลำดับความปลอดภัยโดยอัตโนมัติจากซ้ายไปขวา (จากค่าน้อยที่สุดไปยังค่ามากที่สุด) กฎนี้ถือเป็นกุญแจสำคัญที่สุดในการคำนวณและคาดเดาตัวเลขในมือคู่ต่อสู้ของคุณ!
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl space-y-2">
                    <span className="block text-xs font-black text-rose-500 uppercase tracking-widest">กฎเหล็กการจัดเรียงการ์ด:</span>
                    <div className="flex flex-col gap-2 pl-4 text-xs text-bone/75">
                      <div className="flex items-start gap-1">
                        <span className="text-rose-500">1.</span>
                        <span>เรียงตัวเลขจากค่าน้อยที่สุดทางซ้ายสุด ไปยังค่ามากที่สุดทางขวาสุด</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-rose-500">2.</span>
                        <span className="font-bold text-rose-450">หากมีเลขเดียวกัน: ไพ่สีดำต้องอยู่ทางด้านซ้ายของไพ่สีขาวเสมอ</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl text-center space-y-3">
                    <span className="block text-xs font-black text-rose-500 uppercase tracking-widest">ตัวอย่างการเรียงตามลำดับ:</span>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-10 h-16 bg-neutral-900 border border-neutral-700/40 rounded-lg flex flex-col items-center justify-center shadow-lg">
                        <span className="text-lg font-black text-bone">1</span>
                        <span className="text-[6px] text-neutral-500 font-bold">BLACK</span>
                      </div>
                      <span className="text-bone/30 text-xs">&lt;</span>
                      <div className="w-10 h-16 bg-neutral-900 border border-neutral-700/40 rounded-lg flex flex-col items-center justify-center shadow-lg">
                        <span className="text-lg font-black text-bone">4</span>
                        <span className="text-[6px] text-neutral-500 font-bold">BLACK</span>
                      </div>
                      <span className="text-bone/30 text-xs">&lt;</span>
                      <div className="w-10 h-16 bg-white border border-neutral-300 rounded-lg flex flex-col items-center justify-center shadow-lg">
                        <span className="text-lg font-black text-neutral-950">4</span>
                        <span className="text-[6px] text-neutral-400 font-bold">WHITE</span>
                      </div>
                      <span className="text-bone/30 text-xs">&lt;</span>
                      <div className="w-10 h-16 bg-white border border-neutral-300 rounded-lg flex flex-col items-center justify-center shadow-lg">
                        <span className="text-lg font-black text-neutral-950">8</span>
                        <span className="text-[6px] text-neutral-400 font-bold">WHITE</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-bone/45 leading-relaxed">
                      *ข้อสังเกต: ดำ 4 จะอยู่ด้านซ้ายของขาว 4 เสมอ!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'joker' && (
              <div className="space-y-4 animate-fade-slide-up">
                <div className="border-l-4 border-rose-600 pl-3">
                  <h4 className="text-lg font-black text-rose-500 uppercase tracking-wide">กลลวงแห่งโจ๊กเกอร์ (Joker)</h4>
                  <p className="text-xs font-bold text-bone/50 uppercase tracking-widest">แผ่นจารึกปั่นป่วนกลยุทธ์</p>
                </div>

                <p className="text-sm text-bone/80 leading-relaxed bg-black/20 border border-neutral-900/60 p-4 rounded-xl">
                  ไพ่โจ๊กเกอร์เป็นไพ่พิเศษที่มีความลึกลับอย่างยิ่ง เนื่องจากมันไม่มีค่าหมายเลขใดๆ และไม่อยู่ภายใต้กฎการเรียงลำดับปกติ คุณสามารถแทรกมันไว้ที่ใดก็ได้ในมือของคุณเพื่อหลอกลวงการทายของคู่ต่อสู้
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl space-y-2">
                    <span className="block text-xs font-black text-rose-500 uppercase tracking-widest text-center">ไพ่โจ๊กเกอร์สีดำ (Black Joker)</span>
                    <div className="flex justify-center py-2">
                      {/* Black Joker Card Frame containing joker.png */}
                      <div className="w-20 h-32 bg-neutral-950 border-2 border-neutral-800 rounded-2xl flex flex-col items-center justify-between p-2 shadow-2xl relative">
                        <span className="text-xs font-black text-neutral-500 self-start font-cinzel leading-none">J</span>
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                          <img src="/joker.png" className="w-[85%] h-[85%] object-contain pointer-events-none rounded-md" alt="Joker" />
                        </div>
                        <span className="text-xs font-black text-neutral-500 self-end font-cinzel leading-none rotate-180">J</span>
                      </div>
                    </div>
                    <p className="text-xs text-bone/70 leading-relaxed text-center">
                      ไพ่โจ๊กเกอร์สีดำ ได้รับการแจกจ่ายและสามารถนำไปวางในตำแหน่งใดก็ได้ แทรกได้ทุกจุดในแผงไพ่ของคุณ
                    </p>
                  </div>

                  <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl space-y-2">
                    <span className="block text-xs font-black text-rose-500 uppercase tracking-widest text-center">ไพ่โจ๊กเกอร์สีขาว (White Joker)</span>
                    <div className="flex justify-center py-2">
                      {/* White Joker Card Frame containing joker.png */}
                      <div className="w-20 h-32 bg-white border-2 border-neutral-300 rounded-2xl flex flex-col items-center justify-between p-2 shadow-2xl relative">
                        <span className="text-xs font-black text-neutral-700 self-start font-cinzel leading-none">J</span>
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                          <img src="/joker.png" className="w-[85%] h-[85%] object-contain pointer-events-none rounded-md" alt="Joker" />
                        </div>
                        <span className="text-xs font-black text-neutral-700 self-end font-cinzel leading-none rotate-180">J</span>
                      </div>
                    </div>
                    <p className="text-xs text-bone/70 leading-relaxed text-center">
                      ไพ่โจ๊กเกอร์สีขาว มีพฤติกรรมและความอิสระเช่นเดียวกับแบบสีดำ สามารถนำไปจัดวางสอดแทรกได้ทุกจุดเพื่อปั่นประสาทคู่แข่ง
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-black/30 border border-red-950/30 rounded-xl space-y-2">
                  <span className="block text-xs font-black text-rose-500 uppercase tracking-widest">กฎของโจ๊กเกอร์:</span>
                  <ul className="text-xs text-bone/75 space-y-1 list-disc pl-4">
                    <li>โจ๊กเกอร์มี 2 สี คือ **สีดำ** และ **สีขาว** (สีละ 1 ใบในเกม)</li>
                    <li>เมื่อคุณได้รับโจ๊กเกอร์ตอนแจก หรือจั่วได้ คุณต้องเลือกลากและวางโจ๊กเกอร์เพื่อกำหนดจุดแทรกทันที</li>
                    <li>เวลาทายไพ่โจ๊กเกอร์ของคู่ต่อสู้ คุณไม่ต้องทายตัวเลข แต่ต้องกดเลือกตัวเลือกทายว่า "Joker" แทน</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'turn' && (
              <div className="space-y-4 animate-fade-slide-up">
                <div className="border-l-4 border-rose-600 pl-3">
                  <h4 className="text-lg font-black text-rose-500 uppercase tracking-wide">ขั้นตอนแต่ละเทิร์นของพิธีกรรม</h4>
                  <p className="text-xs font-bold text-bone/50 uppercase tracking-widest">การจั่ว ทาย และลื่นไหลในเกม</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-4 items-start bg-black/20 border border-neutral-900/40 p-4 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center font-black text-sm shrink-0">1</div>
                    <div className="space-y-1">
                      <span className="block text-sm font-black text-bone">จั่วไพ่เพิ่ม 1 ใบ</span>
                      <p className="text-xs text-bone/70 leading-relaxed">
                        เมื่อถึงตาคุณ คุณจะเริ่มโดยการจั่วไพ่ใหม่ 1 ใบจากกองกลาง ไพ่ใบนี้จะถูกวางพักไว้แยกต่างหากชั่วคราวเพื่อให้เห็นหมายเลข (หากเป็นโจ๊กเกอร์ คุณต้องระบุตำแหน่งแทรกในมือของคุณทันทีก่อนจะทายไพ่คู่ต่อสู้)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-black/20 border border-neutral-900/40 p-4 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center font-black text-sm shrink-0">2</div>
                    <div className="space-y-1">
                      <span className="block text-sm font-black text-bone">ทายไพ่คว่ำของคู่ต่อสู้</span>
                      <p className="text-xs text-bone/70 leading-relaxed">
                        เลือกไพ่ที่คว่ำอยู่ใบใดก็ได้ของคู่ต่อสู้ จากนั้นป้อนคำทำนายตัวเลข (หรือทายว่าเป็นโจ๊กเกอร์)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-black/20 border border-neutral-900/40 p-4 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center font-black text-sm shrink-0">3</div>
                    <div className="space-y-2 w-full">
                      <span className="block text-sm font-black text-bone">ผลลัพธ์ของคำทำนาย</span>
                      
                      <div className="grid gap-3 sm:grid-cols-2 mt-2">
                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1">
                          <span className="block text-xs font-black text-emerald-400">ทายถูกต้อง 🗸</span>
                          <p className="text-[10px] text-bone/70 leading-relaxed">
                            ไพ่ใบนั้นของ AI จะถูกเปิดเผยให้ทุกคนเห็น จากนั้นคุณสามารถเลือก:
                          </p>
                          <ul className="text-[9px] text-bone/60 list-disc pl-3">
                            <li>**ทายต่อ**: เลือกทายไพ่คว่ำใบอื่นของ AI (ไม่ต้องจั่วไพ่เพิ่ม)</li>
                            <li>**ผ่าน (Pass)**: นำไพ่ที่เพิ่งจั่วจัดเข้ามือคุณแบบคว่ำหน้า (ลึกลับ) และจบเทิร์น</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl space-y-1">
                          <span className="block text-xs font-black text-rose-400">ทายผิดพลาด ✗</span>
                          <p className="text-[10px] text-bone/70 leading-relaxed">
                            คุณต้องเปิดเผยและหงายไพ่ใบที่จั่วมาในรอบนั้นทันทีให้ AI เห็น จากนั้นจบเทิร์นของคุณทันที
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close button at bottom */}
          <div className="p-6 bg-black/45 border-t border-[rgba(239,68,68,0.15)] flex justify-end shrink-0">
            <button
              onClick={() => {
                if (playSFX) playSFX('flip');
                setIsTutorialOpen(false);
              }}
              className="px-6 py-3 bg-[#100606] hover:bg-[#1c0808] text-[#ef4444] font-black text-xs tracking-[0.2em] border border-red-900/40 hover:border-red-650 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 rounded-xl cursor-pointer uppercase active:scale-[0.97]"
            >
              ปิดคู่มือ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
