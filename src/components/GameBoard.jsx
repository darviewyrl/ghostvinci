import React, { useState, useEffect, useRef } from 'react';
import { Skull, SkipForward } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Cursed Tile Component
   ───────────────────────────────────────────────────────────── */
function CursedTile({
  tile,
  size = 'md',
  style,
  className = '',
  onClick,
  isSelected,
  isGuessable,
  isPenalty,
  showBack = false,
  animate,
}) {
  const isBlack = tile.color === 'black';
  const isJoker = tile.value === -1;
  const val = isJoker ? '★' : tile.value;
  const isCorrectlyGuessed = tile._justGuessedCorrectly;

  const sizes = {
    sm: { card: 'w-[80px] h-[128px]',   center: 'text-3xl',   corner: 'text-[11px]' },
    md: { card: 'w-[108px] h-[172px]',  center: 'text-5xl',  corner: 'text-xs'  },
    lg: { card: 'w-[128px] h-[204px]',  center: 'text-6xl',  corner: 'text-sm' },
  };
  const sz = sizes[size] || sizes.md;

  const colorClass   = showBack ? 'card-back-mystery' : isBlack ? 'card-black' : 'card-white';
  const revealedClass = tile.isRevealed && !showBack && !isCorrectlyGuessed && !tile._justInserted ? 'card-revealed' : '';
  const selectedClass = isSelected ? 'card-selected' : '';
  const guessClass    = isGuessable && !tile.isRevealed ? 'card-guessable' : '';
  const penaltyClass  = isPenalty && !tile.isRevealed ? 'card-penalty' : '';
  const animClass     = animate === 'eerie' ? 'animate-eerie-pulse' :
                        animate === 'deal' ? 'animate-deal-in' :
                        animate === 'draw-player' ? 'animate-draw-player' :
                        animate === 'draw-ai' ? 'animate-draw-ai' :
                        animate === 'insert-player' ? 'animate-insert-player' :
                        animate === 'insert-ai' ? 'animate-insert-ai' :
                        animate === 'guessed-correctly' ? 'animate-correctly-guessed' :
                        animate === 'sort' ? 'animate-sort' : '';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`card-base ${colorClass} ${revealedClass} ${selectedClass} ${guessClass} ${penaltyClass} ${animClass} ${sz.card} ${className}`}
    >
      {showBack ? (
        /* Hidden back — identical mystery pattern with NO colour leak */
        <div className="card-back-inner card-back-inner-black">
          <div className="w-5/6 h-5/6 flex items-center justify-center border border-[rgba(153,27,27,0.3)] border-dashed">
            {/* Mysterious back mark — Iconic spooky question mark */}
            <span className="text-4xl font-extrabold text-rose-600/70 font-cinzel select-none">?</span>
          </div>
        </div>
      ) : isJoker ? (
        /* Joker Front - Edge-to-edge image, no corner texts */
        <div className="absolute inset-0.5 z-10 overflow-hidden rounded-md flex items-center justify-center">
          <img src="/joker.png" className="w-full h-full object-cover pointer-events-none" alt="Joker" />
        </div>
      ) : tile.isRevealed ? (
        /* Revealed — cold and lifeless */
        <>
          <span className={`${sz.corner} font-bold leading-none self-start font-cinzel`}>{val}</span>
          <div className="flex-1 flex items-center justify-center font-black leading-none">
            <span className={sz.center}>{val}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className={`${sz.corner} font-bold leading-none rotate-180 inline-block font-cinzel`}>{val}</span>
            <span className="text-[8px] opacity-40">✕</span>
          </div>
        </>
      ) : (
        /* Own face-down cards */
        <>
          <span className={`${sz.corner} font-bold leading-none self-start font-cinzel`}>{val}</span>
          <div className="flex-1 flex items-center justify-center font-black leading-none">
            <span className={sz.center}>{val}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className={`${sz.corner} font-bold leading-none rotate-180 inline-block font-cinzel`}>{val}</span>
          </div>
        </>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blood border-2 border-void flex items-center justify-center z-20">
          <span className="text-[9px] font-black text-bone leading-none font-cinzel">?</span>
        </div>
      )}

      {/* Red cross removed */}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main GameBoard — Horror Overhaul
   ───────────────────────────────────────────────────────────── */
export default function GameBoard({
  playerHand,
  aiHand,
  deck,
  drawnTile,
  activePlayer,
  gamePhase,
  lastGuess,
  timeLeft,
  onGuess,
  onContinue,
  onPass,
  onPenaltySelect,
  onJokerPlace,
  playSFX,
}) {
  const [selectedAICardIdx, setSelectedAICardIdx] = useState(null);
  const [guessColor, setGuessColor] = useState(null); // 'black' | 'white' | null
  const [guessValue, setGuessValue] = useState(null); // number | 'Joker' | null
  const [showFeedback, setShowFeedback] = useState(false);
  const [screenEffect, setScreenEffect] = useState(null); // 'correct' | 'wrong' | null
  const boardRef = useRef(null);

  const isPlayerTurn = activePlayer === 'player';
  const deckCount = deck.length;

  // Trigger horror feedback on lastGuess change
  useEffect(() => {
    if (lastGuess) {
      const startTimer = setTimeout(() => {
        setShowFeedback(true);
        setScreenEffect(lastGuess.isCorrect ? null : 'wrong');
      }, 0);
      if (playSFX) {
        if (!lastGuess.isCorrect) playSFX('wrong');
      }
      const feedbackTimer = setTimeout(() => setShowFeedback(false), 1600);
      const effectTimer   = setTimeout(() => setScreenEffect(null), 1400);
      return () => { clearTimeout(startTimer); clearTimeout(feedbackTimer); clearTimeout(effectTimer); };
    }
  }, [lastGuess, playSFX]);

  const handleAICardClick = (idx) => {
    if (!isPlayerTurn || aiHand[idx].isRevealed) return;
    if (gamePhase !== 'GUESS' && gamePhase !== 'DECIDE') return;
    if (playSFX) playSFX('flip');
    if (gamePhase === 'DECIDE') {
      onContinue();
    }
    setSelectedAICardIdx(idx);
    setGuessColor(null);
    setGuessValue(null);
  };

  const handleGuessSubmit = () => {
    if (selectedAICardIdx === null || guessColor === null || guessValue === null) return;
    if (playSFX) playSFX('flip');
    onGuess(selectedAICardIdx, guessValue, guessColor);
    setSelectedAICardIdx(null);
    setGuessColor(null);
    setGuessValue(null);
  };

  // Inline Joker placement
  const jokerToPlace = playerHand.find(t => t.value === -1 && t.assignedValue === -1);
  const isInlineJokerPlacementActive =
    (gamePhase === 'JOKER_SETUP' && jokerToPlace) ||
    (gamePhase === 'JOKER_PLACEMENT' && isPlayerTurn && drawnTile && drawnTile.value === -1);
  const activeJokerTile = jokerToPlace || (isInlineJokerPlacementActive ? drawnTile : null);
  const cleanPlayerHand = activeJokerTile
    ? playerHand.filter(t => t.id !== activeJokerTile.id)
    : playerHand;

  // Dynamic card sizing
  const handSize = playerHand.length;
  const cardSize = handSize >= 10 ? 'sm' : 'md';

  // Fan angles — clean, no rotation chaos
  const fanAngle = (idx, total) => total > 1 ? (idx - (total - 1) / 2) * (10 / Math.max(total, 6)) : 0;
  const fanY     = (idx, total) => total > 1 ? Math.abs(idx - (total - 1) / 2) * 2.5 : 0;

  return (
    <div
      ref={boardRef}
      className={`flex-1 flex flex-col justify-between relative w-full select-none font-thai overflow-hidden ${
        screenEffect === 'wrong' ? 'animate-shake' : ''
      }`}
    >
      {/* ── RED VIGNETTE on WRONG ── */}
      {screenEffect === 'wrong' && (
        <div
          className="animate-vignette-wrong fixed inset-0 z-[100]"
          style={{
            background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 30%, rgba(127,0,0,0.65) 100%)',
          }}
        />
      )}

      {/* ── FEEDBACK BANNER ── */}
      {showFeedback && lastGuess && (
        <div className="absolute inset-x-0 top-2 z-50 flex justify-center pointer-events-none">
          <div className={`animate-feedback-pop flex items-center gap-3 px-6 py-2 border rounded-full shadow-xl ${
            lastGuess.isCorrect
              ? 'bg-[#081f10] border-green-500/50 text-green-300'
              : 'bg-[#240808] border-rose-500/50 text-rose-300'
          }`}
          >
            <span className="text-lg leading-none">
              {lastGuess.isCorrect ? '◈' : '☠'}
            </span>
            <div className="text-left leading-none flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                {lastGuess.isCorrect ? 'ทายถูกต้อง!' : 'ทายผิดพลาด!'}
              </span>
              <span className="h-3 w-px bg-bone/25" />
              <span className="text-[11px] font-semibold text-bone/90">
                {lastGuess.isCorrect ? 'เลือกเดินต่อหรือหยุดผ่านเทิร์น' : 'ต้องเปิดเผยแผ่นจารึกของตัวเอง 1 ใบ'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          1. AI HAND — The Spirit's Sealed Tablets
          ══════════════════════════════════════════════════════ */}
      {/* 1. AI HAND — The Spirit's Sealed Tablets */}
      <div className="flex flex-col items-center justify-center pt-1 pb-2">
        <span className="text-sm font-extrabold text-[rgba(230,80,80,0.85)] uppercase tracking-[0.18em] mb-1.5 flex items-center gap-1.5">
          <span className="w-4 h-px bg-[rgba(127,29,29,0.4)]" />
          แผ่นจารึกของวิญญาณ ({aiHand.filter(tile => !tile.isRevealed).length})
          <span className="w-4 h-px bg-[rgba(127,29,29,0.4)]" />
        </span>
 
        <div className="flex items-end justify-center gap-2 px-4 py-1 min-h-[110px] flex-wrap">
          {aiHand.map((tile, idx) => {
            const isSelected = selectedAICardIdx === idx;
            const isGuessable = isPlayerTurn && (gamePhase === 'GUESS' || gamePhase === 'DECIDE') && !tile.isRevealed;
            return (
              <div
                key={tile.id}
                onClick={() => handleAICardClick(idx)}
                className="hand-card-wrapper"
                style={{ zIndex: idx }}
              >
                <CursedTile
                  tile={tile}
                  size="md"
                  isSelected={isSelected}
                  isGuessable={isGuessable}
                  showBack={!tile.isRevealed}
                  animate={tile._justGuessedCorrectly ? 'guessed-correctly' : tile._isNew ? 'deal' : tile._justInserted ? 'insert-ai' : tile._justSorted ? 'sort' : undefined}
                  style={tile._justSorted ? { animationDelay: `${idx * 80}ms` } : undefined}
                />
              </div>
            );
          })}
 
          {/* AI drawn tile */}
          {drawnTile && activePlayer === 'ai' && (
            <div className="ml-4 pl-3 border-l border-[rgba(127,29,29,0.15)] flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-[rgba(230,80,80,0.8)] uppercase tracking-widest">จั่วได้</span>
              <CursedTile tile={drawnTile} size="md" showBack={!drawnTile.isRevealed} animate="draw-ai" />
            </div>
          )}
        </div>
      </div>
 
      {/* 2. MIDDLE — Centered Deck Altar & Turn Action Panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-2 py-2 min-h-[250px] shrink-0 w-full">
        
        <div className="relative z-10 px-6 w-full max-w-5xl min-h-[220px]">
          {/* Left: Deck Altar */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-transform hover:scale-105 shrink-0">
            <div className="w-[84px] h-[134px] bg-[#111116] border-2 border-[rgba(220,50,50,0.4)] border-b-[5px] border-r-[3px] flex items-center justify-center shadow-2xl shadow-black rounded-lg active:scale-95 transition-transform cursor-pointer">
              <div className="text-center">
                <Skull className="w-5 h-5 text-[rgba(220,50,50,0.7)] mx-auto mb-1.5" strokeWidth={1.5} />
                <span className="text-xl font-black text-rose-500 leading-none tabular-nums">{deckCount}</span>
              </div>
            </div>
            <span className="text-[11px] font-black text-[rgba(230,80,80,0.9)] uppercase tracking-[0.2em]">กองจั่ว</span>
          </div>

          {/* Center: Guess Panel (Inline, no fullscreen modal) */}
          {selectedAICardIdx !== null && (
            <div className="absolute left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-2">
              <div className="p-4 w-full text-center relative">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1 leading-none font-cinzel">
                  ✝ TABLET DECODING ✝
                </p>
                <h3 className="text-xs font-black text-bone mb-3.5 leading-snug uppercase tracking-wide">
                  เดาคุณสมบัติแผ่นจารึกใบที่ {selectedAICardIdx + 1}
                </h3>

                {/* 1. SELECT COLOR */}
                <div className="mb-3.5 text-left">
                  <label className="text-[9px] font-black text-bone/60 uppercase tracking-widest block mb-1.5 text-center">
                    1. เลือกสีของการ์ด
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (playSFX) playSFX('flip');
                        setGuessColor('black');
                      }}
                      className={`py-2 text-[11px] font-black border transition-all duration-200 cursor-pointer ${
                        guessColor === 'black'
                          ? 'bg-[#1a0808] border-red-500 text-red-500 shadow-md shadow-red-950/50'
                          : 'bg-black/80 border-neutral-800 text-bone/70 hover:border-neutral-700'
                      }`}
                      style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                    >
                      ⚫ สีดำ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (playSFX) playSFX('flip');
                        setGuessColor('white');
                      }}
                      className={`py-2 text-[11px] font-black border transition-all duration-200 cursor-pointer ${
                        guessColor === 'white'
                          ? 'bg-bone text-black border-bone font-black shadow-md shadow-white/10'
                          : 'bg-black/80 border-neutral-800 text-bone/70 hover:border-neutral-700'
                      }`}
                      style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                    >
                      ⚪ สีขาว
                    </button>
                  </div>
                </div>

                {/* 2. SELECT VALUE */}
                <div className="mb-4 text-left">
                  <label className="text-[9px] font-black text-bone/60 uppercase tracking-widest block mb-1.5 text-center">
                    2. เลือกค่าตัวเลข หรือตัวตลก
                  </label>
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {Array.from({ length: 12 }).map((_, val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          if (playSFX) playSFX('flip');
                          setGuessValue(val);
                        }}
                        className={`py-1.5 font-black text-xs transition-all duration-200 cursor-pointer active:scale-90 tabular-nums ${
                          guessValue === val
                            ? 'bg-[#2a0e0e] border-rose-500 text-rose-400'
                            : 'bg-[#0a0a0d] border-[rgba(127,29,29,0.15)] text-bone/75 hover:border-[rgba(153,27,27,0.5)]'
                        }`}
                        style={{ border: '1px solid', clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (playSFX) playSFX('flip');
                      setGuessValue('Joker');
                    }}
                    className={`w-full py-1.5 text-xs font-black transition-all duration-200 cursor-pointer ${
                      guessValue === 'Joker'
                        ? 'bg-[#2a0e0e] border-rose-500 text-rose-400'
                        : 'bg-[#0a0a0d] border-[rgba(127,29,29,0.15)] text-bone/75 hover:border-[rgba(153,27,27,0.5)]'
                    }`}
                    style={{ borderWidth: '1px', clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                  >
                    🃏 Alice Joker
                  </button>
                </div>

                {/* 3. CONFIRM OR CANCEL */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGuessSubmit}
                    disabled={guessColor === null || guessValue === null}
                    className={`flex-1 py-2.5 font-black text-xs tracking-wider uppercase transition-all duration-200 ${
                      guessColor !== null && guessValue !== null
                        ? 'bg-[#1a0808] text-[#ef4444] border border-[rgba(153,27,27,0.8)] hover:bg-[#250a0a] cursor-pointer'
                        : 'bg-neutral-900 text-neutral-600 border border-neutral-950 cursor-not-allowed'
                    }`}
                    style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                  >
                    ยืนยัน
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (playSFX) playSFX('flip');
                      setSelectedAICardIdx(null);
                      setGuessColor(null);
                      setGuessValue(null);
                    }}
                    className="py-2.5 px-4 bg-transparent text-bone/60 border border-[rgba(127,29,29,0.18)] hover:border-[rgba(127,29,29,0.45)] hover:text-bone font-black text-xs transition-all duration-200 cursor-pointer"
                    style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Turn status pane & timer bar (Pushed to the right when guessing, centered when not) */}
          <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col justify-center text-center p-4 min-w-[280px] max-w-sm z-10 select-none shrink-0 ${
            selectedAICardIdx !== null ? 'right-6' : 'left-1/2 -translate-x-1/2'
          }`}>
            <div className="mb-1">
              <span className={`text-[16px] font-black tracking-widest leading-none uppercase font-cinzel text-flicker ${
                isPlayerTurn ? 'text-[#ff3333]' : 'text-bone/40'
              }`}>
                {isPlayerTurn ? '▶ ตาของคุณแล้ว' : '◌ วิญญาณเคลื่อนไหว...'}
              </span>
              <p className="text-[12px] font-extrabold text-bone/85 tracking-wide mt-2 leading-relaxed font-elite">
                {gamePhase === 'JOKER_SETUP' && 'วาง Joker ในมือด้านล่าง'}
                {gamePhase === 'DEAL' && 'กำลังแจกแผ่นจารึก...'}
                {gamePhase === 'GUESS' && (isPlayerTurn ? 'แตะการ์ดคว่ำของวิญญาณเพื่อระบุค่าและสีที่ต้องการทาย' : 'วิญญาณกำลังเล็งทายคุณ')}
                {gamePhase === 'DECIDE' && (isPlayerTurn ? 'ทายถูกต้อง! เลือกการ์ดวิญญาณใบถัดไปเพื่อทายต่อ หรือหยุด...' : 'วิญญาณกำลังตัดสินใจต่อ')}
                {gamePhase === 'PENALTY_REVEAL' && 'บทลงโทษ! เลือกการ์ดคว่ำของคุณ 1 ใบเพื่อหงาย'}
                {gamePhase === 'JOKER_PLACEMENT' && 'จัดวาง Joker ที่จั่วได้ลงบอร์ด'}
                {gamePhase === 'GAME_OVER' && 'จบการทดสอบพิธีกรรม'}
              </p>
            </div>

            {/* Turn countdown display (Large numbers, no progress bar) */}
            {(gamePhase === 'GUESS' || gamePhase === 'DECIDE') && timeLeft !== undefined && (
              <div className="flex flex-col items-center justify-center mt-3">
                <span className="text-[10px] font-black text-rose-500/60 tracking-[0.2em] uppercase font-cinzel mb-1">COUNTDOWN</span>
                <span className={`text-4xl font-extrabold tracking-wider tabular-nums font-cinzel ${
                  timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-bone'
                }`}>
                  {timeLeft}
                </span>
                <span className="text-[9px] font-bold text-bone/45 uppercase tracking-widest mt-0.5">วินาที</span>
              </div>
            )}
          </div>
        </div>
 
        {/* Action Panel Sitting Directly Underneath the Deck */}
        <div className="absolute bottom-0 left-6 z-20 flex flex-col items-center min-w-[200px] max-w-[260px]">
          {/* DECIDE: Only Pass (ข้ามเทิร์น) */}
          {isPlayerTurn && gamePhase === 'DECIDE' && (
            <div className="flex bg-[rgba(13,13,18,0.95)] border border-[rgba(220,50,50,0.3)] px-5 py-2 shadow-2xl rounded-lg">
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  onPass();
                }}
                className="py-2 px-5 bg-[rgba(153,27,27,0.15)] text-[#ff5555] border border-[rgba(239,68,68,0.5)] hover:bg-[rgba(153,27,27,0.35)] hover:text-rose-400 font-extrabold text-xs transition-all duration-300 uppercase tracking-widest cursor-pointer"
                style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
              >
                <SkipForward className="w-3.5 h-3.5 inline mr-1.5 opacity-80" strokeWidth={2.5} />
                ข้ามเทิร์น
              </button>
            </div>
          )}
 
          {/* DECIDE hint */}
          {isPlayerTurn && gamePhase === 'DECIDE' && (
            <p className="text-[11px] font-black text-[rgba(100,220,120,0.95)] tracking-wider text-center leading-relaxed animate-pulse uppercase bg-[rgba(10,10,12,0.9)] px-4 py-1.5 border border-rose-950/60 rounded-full shadow-lg">
              ทายถูกต้อง! แตะแผ่นจารึกวิญญาณใบอื่นเพื่อทายต่อทันที หรือกดปุ่มข้ามเทิร์นเพื่อหยุด
            </p>
          )}

          {/* GUESS hint */}
          {isPlayerTurn && gamePhase === 'GUESS' && (
            <p className="text-[11px] font-black text-[rgba(240,60,60,0.95)] tracking-wider text-center leading-relaxed animate-pulse uppercase bg-[rgba(10,10,12,0.9)] px-4 py-1.5 border border-rose-950/60 rounded-full shadow-lg">
              แตะแผ่นจารึกของวิญญาณเพื่อเริ่มทาย
            </p>
          )}
 
          {/* AI thinking */}
          {!isPlayerTurn && (
            <div className="flex flex-col items-center gap-1.5 bg-[rgba(10,10,12,0.9)] px-4 py-1.5 border border-rose-950/60 rounded-full shadow-lg">
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent spinner-blood animate-spin" />
              <span className="text-[10px] font-bold text-bone/60 uppercase tracking-widest">วิญญาณกำลังประเมิน...</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal overlay removed in favor of inline decoding panel */}
      {/* ══════════════════════════════════════════════════════════
          3. PLAYER HAND — The Ritual Tablets in Hand
          ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center">

        {/* Joker insertion banner */}
        {isInlineJokerPlacementActive && activeJokerTile && (
          <div className="mb-2 flex items-center gap-2 bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.28)] px-4 py-2 text-[12px] font-extrabold text-[rgba(230,80,80,0.95)] tracking-wide uppercase"
            style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
          >
            <span className="text-[rgba(127,29,29,0.8)]">✝</span>
            <span>แตะ <strong className="text-[#ef4444]">+</strong> เพื่อแทรก Joker</span>
            <div className={`w-5 h-8 ml-1 flex items-center justify-center border shrink-0 ${
              activeJokerTile.color === 'black'
                ? 'bg-[#0c0c10] border-[rgba(127,29,29,0.4)] text-[rgba(127,29,29,0.8)]'
                : 'bg-bone/80 border-[rgba(40,20,20,0.3)] text-[#2a1a1a]'
            }`}>
              <img src="/joker.png" className="w-full h-full object-contain pointer-events-none" alt="Joker" />
            </div>
          </div>
        )}

        {/* Hand fan row */}
        <div
          className="relative flex items-end justify-center py-4 px-6 min-h-[150px] w-full max-w-5xl"
          style={{ perspective: '900px' }}
        >
          <div className="flex items-end justify-center" style={{ gap: isInlineJokerPlacementActive ? '3px' : '8px' }}>

            {/* Slot before index 0 */}
            {isInlineJokerPlacementActive && activeJokerTile && (
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  onJokerPlace(activeJokerTile.id, 0);
                }}
                className="joker-slot w-7 h-[76px] shrink-0"
                title="แทรกตรงนี้"
              >
                <span className="text-[rgba(127,29,29,0.7)] font-black text-lg leading-none">+</span>
              </button>
            )}

            {cleanPlayerHand.map((tile, idx) => {
              const N = cleanPlayerHand.length;
              const rot = fanAngle(idx, N);
              const yOff = fanY(idx, N);
              const isPenaltyPhase = gamePhase === 'PENALTY_REVEAL';
              const canClick = isPenaltyPhase && !tile.isRevealed;

              return (
                <React.Fragment key={tile.id}>
                  <div
                    onClick={() => {
                      if (canClick) {
                        if (playSFX) playSFX('flip');
                        onPenaltySelect(idx);
                      }
                    }}
                    className="hand-card-wrapper"
                    style={{
                      transform: `rotate(${rot}deg) translateY(${yOff}px)`,
                      zIndex: idx + 5,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    <CursedTile
                      tile={tile}
                      size={cardSize}
                      isPenalty={canClick}
                      animate={tile._justGuessedCorrectly ? 'guessed-correctly' : tile._isNew ? 'deal' : tile._justInserted ? 'insert-player' : tile._justSorted ? 'sort' : undefined}
                      style={tile._justSorted ? { animationDelay: `${idx * 80}ms` } : undefined}
                      isPlayerCard={true}
                    />
                  </div>

                  {/* Slot after each card */}
                  {isInlineJokerPlacementActive && activeJokerTile && (
                    <button
                      onClick={() => {
                        if (playSFX) playSFX('flip');
                        onJokerPlace(activeJokerTile.id, idx + 1);
                      }}
                      className="joker-slot w-7 h-[76px] shrink-0"
                      title={`แทรกตรงนี้ (ช่อง ${idx + 2})`}
                      style={{ zIndex: idx + 30 }}
                    >
                      <span className="text-[rgba(127,29,29,0.7)] font-black text-lg leading-none">+</span>
                    </button>
                  )}
                </React.Fragment>
              );
            })}
            {/* Divider and Player drawn tile inside the same flow to prevent overlap */}
            {drawnTile && activePlayer === 'player' && !isInlineJokerPlacementActive && (
              <>
                <div className="h-28 w-px border-l-2 border-dashed border-[rgba(127,29,29,0.35)] mx-3 self-center" />
                <div className="flex flex-col items-center gap-1.5 z-40 card-drawn-container">
                  <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest leading-none">จั่วได้</span>
                  <CursedTile tile={drawnTile} size="md" showBack={false} isPlayerCard={true} animate="draw-player" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Player label */}
        <span className={`text-sm font-bold uppercase tracking-[0.2em] mt-1 ${
          gamePhase === 'PENALTY_REVEAL' ? 'text-[#ff5555]' : 'text-[rgba(200,80,80,0.75)]'
        }`}>
          {gamePhase === 'PENALTY_REVEAL' ? '☠ เลือก 1 ใบเพื่อเปิดเผย ☠' : `แผ่นจารึกของคุณ (${playerHand.filter(tile => !tile.isRevealed).length} ใบ)`}
        </span>
      </div>
    </div>
  );
}
