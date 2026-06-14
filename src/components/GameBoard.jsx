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
  playSFX,
}) {
  const isBlack = tile.color === 'black';
  const isJoker = tile.value === -1;
  const val = isJoker ? '★' : tile.value;
  const isCorrectlyGuessed = tile._justGuessedCorrectly;

  const sizes = {
    sm: { 
      card: 'w-[52px] h-[83px] xs:w-[60px] xs:h-[96px] sm:w-[72px] sm:h-[114px] md:w-[80px] md:h-[128px]',   
      center: 'text-base xs:text-lg sm:text-2xl md:text-3xl',   
      corner: 'text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px]' 
    },
    md: { 
      card: 'w-[64px] h-[102px] xs:w-[76px] xs:h-[120px] sm:w-[92px] sm:h-[146px] md:w-[108px] md:h-[172px]',  
      center: 'text-2xl xs:text-3xl sm:text-4xl md:text-5xl',  
      corner: 'text-[8px] xs:text-[9px] sm:text-xs'  
    },
    lg: { 
      card: 'w-[80px] h-[128px] xs:w-[96px] xs:h-[152px] sm:w-[112px] sm:h-[178px] md:w-[128px] md:h-[204px]',  
      center: 'text-3xl xs:text-4xl sm:text-5xl md:text-6xl',  
      corner: 'text-[10px] xs:text-xs sm:text-sm' 
    },
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
      onMouseEnter={() => {
        if ((isGuessable || isPenalty) && playSFX) {
          playSFX('hover');
        }
      }}
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
        /* Joker Front - reduced artwork size and "J" in both corners */
        <>
          <span className={`${sz.corner} font-bold leading-none self-start font-cinzel`}>J</span>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img src="/joker.png" className="w-[70%] h-[70%] object-contain pointer-events-none rounded-md" alt="Joker" />
          </div>
          <div className="flex justify-between items-end">
            <span className={`${sz.corner} font-bold leading-none rotate-180 inline-block font-cinzel`}>J</span>
            {tile.isRevealed && <span className="text-[8px] opacity-40">✕</span>}
          </div>
        </>
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
  const [screenEffect, setScreenEffect] = useState(null); // 'correct' | 'wrong' | null
  const boardRef = useRef(null);

  const isPlayerTurn = activePlayer === 'player';
  const isFeedbackPhase = gamePhase === 'FEEDBACK' && Boolean(lastGuess);
  const deckCount = deck.length;

  // Auto-close Guess Panel if timer ends or game phase transitions out of guess phases
  useEffect(() => {
    if (gamePhase !== 'GUESS' && gamePhase !== 'DECIDE') {
      setSelectedAICardIdx(null);
      setGuessColor(null);
      setGuessValue(null);
    }
    if (timeLeft === 0) {
      setSelectedAICardIdx(null);
      setGuessColor(null);
      setGuessValue(null);
    }
  }, [gamePhase, timeLeft]);

  // Trigger horror feedback on lastGuess change
  useEffect(() => {
    if (gamePhase === 'FEEDBACK' && lastGuess) {
      setScreenEffect(lastGuess.isCorrect ? null : 'wrong');
      if (playSFX) {
        if (lastGuess.isCorrect) {
          playSFX('correct'); // Play puzzle chime for correct guess!
        } else {
          playSFX('wrong');   // Play thud for incorrect guess
        }
      }
      const effectTimer   = setTimeout(() => setScreenEffect(null), 1400);
      return () => {
        clearTimeout(effectTimer);
        setScreenEffect(null);
      };
    }
  }, [gamePhase, lastGuess, playSFX]);

  const handleAICardClick = (idx) => {
    if (!isPlayerTurn || aiHand[idx].isRevealed) return;
    if (gamePhase !== 'GUESS' && gamePhase !== 'DECIDE') return;
    if (playSFX) playSFX('flip');
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
      className={`flex-1 flex flex-col justify-between relative w-full select-none font-thai overflow-x-hidden overflow-y-auto md:overflow-hidden ${
        screenEffect === 'wrong' ? 'animate-shake' : ''
      }`}
    >
      {/* ── RED VIGNETTE on WRONG ── */}
      {screenEffect === 'wrong' && (
        <div
          className="animate-vignette-wrong fixed inset-0 z-[100] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 30%, rgba(127,0,0,0.65) 100%)',
          }}
        />
      )}

      {/* ── CENTERED FEEDBACK POPUP ── */}
      {isFeedbackPhase && lastGuess && (
        <div className={`fixed inset-0 z-60 flex items-center justify-center pointer-events-none bg-black/30 transition-all duration-300 ${!lastGuess.isCorrect ? 'backdrop-blur-[1.5px]' : ''}`}>
          <div className={`animate-feedback-pop-center flex flex-col items-center justify-center p-8 border-2 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] max-w-sm w-full text-center ${
            lastGuess.isCorrect
              ? 'bg-[#0a1f11]/95 border-emerald-500/70 shadow-emerald-950/40 text-emerald-300'
              : 'bg-[#280a0a]/95 border-rose-500/70 shadow-rose-950/40 text-rose-300'
          }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
              lastGuess.isCorrect
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-400'
            }`}>
              <span className="text-3xl font-black">
                {lastGuess.isCorrect ? '✓' : '☠'}
              </span>
            </div>
            
            <h2 className="text-xl font-black uppercase tracking-widest mb-2 font-cinzel">
              {lastGuess.guesser === 'player'
                ? (lastGuess.isCorrect ? 'คุณทายถูกต้อง!' : 'คุณทายผิดพลาด!')
                : (lastGuess.isCorrect ? 'วิญญาณทายถูกต้อง!' : 'วิญญาณทายผิดพลาด!')
              }
            </h2>
            
            <div className="h-px w-24 bg-current/20 my-2" />
            
            <p className="text-xs font-bold text-bone/90 font-thai leading-relaxed mt-1">
              {lastGuess.guesser === 'player'
                ? (lastGuess.isCorrect ? 'เลือกเดินต่อ หรือหยุดเพื่อผ่านเทิร์น' : 'ต้องเปิดเผยการ์ดของคุณ 1 ใบ')
                : (lastGuess.isCorrect ? 'วิญญาณกำลังตัดสินใจสืบหาไพ่ใบอื่นเพิ่ม...' : 'วิญญาณเดาผิดและต้องหงายการ์ดจั่ว')
              }
            </p>
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
 
        <div
          className="relative flex items-end justify-center py-4 px-6 min-h-[110px] xs:min-h-[130px] md:min-h-[150px] w-full max-w-5xl"
          style={{ perspective: '900px' }}
        >
          <div className="flex items-end justify-center" style={{ gap: '8px' }}>
            {aiHand.map((tile, idx) => {
              const isSelected = selectedAICardIdx === idx;
              const isGuessable = isPlayerTurn && (gamePhase === 'GUESS' || gamePhase === 'DECIDE') && !tile.isRevealed;
              const N = aiHand.length;
              const rot = fanAngle(idx, N);
              const yOff = fanY(idx, N);
              const currentAICardSize = (handSize >= 10 && tile.isRevealed) ? 'sm' : 'md';

              return (
                <div
                  key={tile.id}
                  onClick={() => handleAICardClick(idx)}
                  className="hand-card-wrapper"
                  style={{
                    transform: `rotate(${rot}deg) translateY(${yOff}px)`,
                    zIndex: idx + 5,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <CursedTile
                    tile={tile}
                    size={currentAICardSize}
                    isSelected={isSelected}
                    isGuessable={isGuessable}
                    showBack={!tile.isRevealed}
                    playSFX={playSFX}
                    animate={tile._justGuessedCorrectly ? 'guessed-correctly' : tile._isNew ? 'deal' : tile._justInserted ? 'insert-ai' : tile._justSorted ? 'sort' : undefined}
                    style={tile._justSorted ? { animationDelay: `${idx * 80}ms` } : undefined}
                  />
                </div>
              );
            })}
   
            {/* AI drawn tile */}
            {drawnTile && activePlayer === 'ai' && (
              <>
                <div className="h-28 w-px border-l-2 border-dashed border-[rgba(127,29,29,0.35)] mx-3 self-center" />
                <div className="flex flex-col items-center gap-1.5 z-10 card-drawn-container">
                  <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest leading-none">จั่วได้</span>
                  <CursedTile tile={drawnTile} size="md" showBack={!drawnTile.isRevealed} playSFX={playSFX} animate="draw-ai" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
 
      {/* 2. MIDDLE — Centered Deck Altar & Turn Action Panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-1.5 py-1.5 min-h-[160px] md:min-h-[250px] w-full">
        
        <div className="relative z-10 px-6 w-full max-w-5xl min-h-[140px] md:min-h-[220px] flex flex-col md:block items-center justify-center gap-4 md:gap-6">
          
          {/* Left: Redesigned 3D Stacked Deck Altar */}
          <div className="md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 flex flex-col items-center gap-2 transition-transform hover:scale-105 shrink-0 select-none">
            <div className="relative w-[72px] h-[114px] md:w-[84px] md:h-[134px] flex items-center justify-center">
              {deckCount === 0 ? (
                <div className="w-[72px] h-[114px] md:w-[84px] md:h-[134px] rounded-lg border-2 border-dashed border-rose-950/40 bg-black/40 flex items-center justify-center">
                  <Skull className="w-5 h-5 text-rose-950/40" strokeWidth={1} />
                </div>
              ) : (
                /* Overlapping stack layers based on remaining deckCount */
                Array.from({ length: Math.min(Math.ceil(deckCount / 3), 6) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-lg border border-[rgba(220,50,50,0.3)] bg-gradient-to-br from-[#1b1b22] to-[#0d0d11] shadow-md shadow-black"
                    style={{
                      width: '100%',
                      height: '100%',
                      bottom: `${i * 3.5}px`,
                      right: `${i * 3}px`,
                      zIndex: i,
                    }}
                  >
                    {/* Render mystical pattern/skull on the top-most layer */}
                    {i === Math.min(Math.ceil(deckCount / 3), 6) - 1 && (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <div className="w-5/6 h-5/6 rounded border border-[rgba(153,27,27,0.35)] border-dashed flex items-center justify-center">
                          <Skull className="w-6 h-6 text-rose-600/70" strokeWidth={1.5} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Card count text moved outside the card deck */}
            <span className="text-[11px] font-black text-[rgba(230,80,80,0.95)] uppercase tracking-[0.15em] mt-3 bg-black/60 px-3 py-1 border border-rose-950/30 rounded-full">
              กองจั่ว ({deckCount} ใบ)
            </span>
          </div>

          {/* Center: Redesigned Guess Panel (Inline, glassmorphic obsidian) */}
          {selectedAICardIdx !== null && (
            <>
              {/* Click-blocking overlay to prevent ghost clicks on underlying cards/deck */}
              <div 
                onClick={() => {
                  if (playSFX) playSFX('toggle');
                  setSelectedAICardIdx(null);
                  setGuessColor(null);
                  setGuessValue(null);
                }}
                className="fixed inset-0 bg-black/45 backdrop-blur-[1px] z-30 cursor-pointer"
              />
              <div className="absolute left-1/2 top-1/2 w-[440px] max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 px-4 py-5 bg-[#0a0a0f]/95 border border-[rgba(239,68,68,0.25)] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-md z-40 select-none">
              <div className="text-center relative">
                <div className="text-[12px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1.5 leading-none font-cinzel flex items-center justify-center gap-1.5">
                  <span>✝ TABLET DECODING ✝</span>
                  {timeLeft !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${timeLeft <= 5 ? 'bg-red-950/80 text-red-500 border border-red-500/40 animate-pulse' : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'}`}>
                      {timeLeft}s
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-bone mb-5 leading-snug uppercase tracking-wide font-thai">
                  เดาคุณสมบัติแผ่นจารึกใบที่ {selectedAICardIdx + 1}
                </h3>

                {/* 1. SELECT COLOR */}
                <div className="mb-5 text-left">
                  <label className="text-[10px] font-black text-bone/60 uppercase tracking-widest block mb-2 text-center font-thai">
                    1. เลือกสีของการ์ด
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (playSFX) playSFX('flip');
                        setGuessColor('black');
                      }}
                      className={`py-3 text-xs font-black border transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                        guessColor === 'black'
                          ? 'bg-[#1e0505] border-[#ef4444] text-[#ef4444] shadow-lg shadow-red-950/40 font-bold scale-[1.03]'
                          : 'bg-black/90 border-neutral-800 text-bone/70 hover:border-neutral-700 hover:text-bone'
                      }`}
                      style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                    >
                      ⚫ สีดำ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (playSFX) playSFX('flip');
                        setGuessColor('white');
                      }}
                      className={`py-3 text-xs font-black border transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                        guessColor === 'white'
                          ? 'bg-bone text-black border-bone shadow-lg shadow-white/5 font-bold scale-[1.03]'
                          : 'bg-black/90 border-neutral-800 text-bone/70 hover:border-neutral-700 hover:text-bone'
                      }`}
                      style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                    >
                      ⚪ สีขาว
                    </button>
                  </div>
                </div>

                {/* 2. SELECT VALUE */}
                <div className="mb-6 text-left">
                  <label className="text-[10px] font-black text-bone/60 uppercase tracking-widest block mb-2.5 text-center font-thai">
                    2. เลือกค่าตัวเลข หรือตัวตลก
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {Array.from({ length: 12 }).map((_, val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          if (playSFX) playSFX('flip');
                          setGuessValue(val);
                        }}
                        className={`py-2 font-extrabold text-sm transition-all duration-200 cursor-pointer active:scale-90 tabular-nums ${
                          guessValue === val
                            ? 'bg-[#3c0808] border-[#f43f5e] text-[#f43f5e] font-black scale-[1.05]'
                            : 'bg-[#0b0b0f] border-[rgba(127,29,29,0.22)] text-bone/75 hover:border-[rgba(239,68,68,0.5)] hover:text-bone'
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
                    className={`w-full py-2.5 text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                      guessValue === 'Joker'
                        ? 'bg-[#3c0808] border-[#f43f5e] text-[#f43f5e] scale-[1.02]'
                        : 'bg-[#0b0b0f] border-[rgba(127,29,29,0.22)] text-bone/75 hover:border-[rgba(239,68,68,0.5)] hover:text-bone'
                    }`}
                    style={{ borderWidth: '1px', clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                  >
                    🃏 Joker
                  </button>
                </div>

                {/* 3. CONFIRM OR CANCEL */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGuessSubmit}
                    disabled={guessColor === null || guessValue === null}
                    className={`flex-1 py-3 font-bold text-xs tracking-wider uppercase transition-all duration-300 ${
                      guessColor !== null && guessValue !== null
                        ? 'bg-[#ef4444] text-bone border border-[#ff6666]/50 hover:bg-[#ff3333] hover:scale-[1.02] cursor-pointer'
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
                    className="py-3 px-5 bg-transparent text-bone/60 border border-[rgba(127,29,29,0.25)] hover:border-[rgba(239,68,68,0.5)] hover:text-bone font-bold text-xs transition-all duration-300 cursor-pointer"
                    style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
            </>
          )}

          {/* Turn status pane & timer bar (Pushed to the right when guessing, centered when not) */}
          <div className={`md:absolute md:top-1/2 md:-translate-y-1/2 flex flex-col justify-center items-center text-center p-5 min-w-[300px] max-w-sm z-20 select-none shrink-0 transition-all duration-300 ease-in-out ${
            selectedAICardIdx !== null
              ? 'hidden md:flex md:left-[calc(100%-20rem)] md:translate-x-0 md:scale-95 md:border-l md:border-rose-950/20 md:pl-6'
              : 'relative md:left-1/2 md:-translate-x-1/2 scale-100 flex'
          }`}>
            <div className="mb-2">
              <span className={`text-[16px] font-black tracking-widest leading-none uppercase font-cinzel text-flicker block mb-2 ${
                isPlayerTurn ? 'text-[#ff3333]' : 'text-bone/40'
              }`}>
                {isPlayerTurn ? '▶ ตาของคุณแล้ว' : '◌ วิญญาณเคลื่อนไหว...'}
              </span>
              <p className="text-[12px] font-extrabold text-bone/85 tracking-wide leading-relaxed font-elite max-w-[260px] mx-auto">
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
              <div className="flex flex-col items-center justify-center mt-3.5 mb-2">
                <span className="text-[9px] font-black text-rose-500/60 tracking-[0.2em] uppercase font-cinzel mb-1">COUNTDOWN</span>
                <span className={`text-4xl font-extrabold tracking-wider tabular-nums font-cinzel ${
                  timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-bone'
                }`}>
                  {timeLeft}
                </span>
                <span className="text-[9px] font-bold text-bone/45 uppercase tracking-widest mt-0.5">วินาที</span>
              </div>
            )}

            {/* Action items inside Turn Status Panel */}
            <div className="mt-4 flex flex-col items-center min-h-[48px] justify-center">
              {/* DECIDE: Only Pass (ข้ามเทิร์น) */}
              {isPlayerTurn && gamePhase === 'DECIDE' && (
                <button
                  onClick={() => {
                    if (playSFX) playSFX('flip');
                    onPass();
                  }}
                  className="py-2.5 px-6 bg-[rgba(153,27,27,0.15)] text-[#ff5555] border border-[rgba(239,68,68,0.5)] hover:bg-[rgba(153,27,27,0.35)] hover:text-rose-400 font-extrabold text-xs transition-all duration-300 uppercase tracking-widest cursor-pointer shadow-lg"
                  style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                >
                  <SkipForward className="w-3.5 h-3.5 inline mr-1.5 opacity-80" strokeWidth={2.5} />
                  ข้ามเทิร์น
                </button>
              )}

              {/* AI thinking status spinner */}
              {!isPlayerTurn && gamePhase !== 'GAME_OVER' && (
                <div className="flex flex-col items-center gap-1.5 bg-[rgba(10,10,12,0.9)] px-4 py-1.5 border border-rose-950/60 rounded-full shadow-lg">
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent spinner-blood animate-spin" />
                  <span className="text-[9px] font-bold text-bone/60 uppercase tracking-widest">วิญญาณกำลังประเมิน...</span>
                </div>
              )}
            </div>

            {/* Hints in Thai */}
            {isPlayerTurn && gamePhase === 'DECIDE' && (
              <p className="text-[10px] font-bold text-[rgba(100,220,120,0.95)] tracking-wide text-center leading-relaxed animate-pulse uppercase mt-3 select-none max-w-[260px] font-thai">
                ทายถูกต้อง! แตะแผ่นจารึกวิญญาณใบอื่นเพื่อทายต่อทันที หรือกดข้ามเทิร์นเพื่อหยุด
              </p>
            )}

            {isPlayerTurn && gamePhase === 'GUESS' && (
              <p className="text-[10px] font-bold text-[rgba(240,60,60,0.95)] tracking-wide text-center leading-relaxed animate-pulse uppercase mt-3 select-none max-w-[260px] font-thai">
                แตะแผ่นจารึกของวิญญาณเพื่อเริ่มทาย
              </p>
            )}
          </div>
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
          className="relative flex items-end justify-center py-4 px-6 min-h-[110px] xs:min-h-[130px] md:min-h-[150px] w-full max-w-5xl"
          style={{ perspective: '900px' }}
        >
          <div className={`flex items-end justify-center ${isInlineJokerPlacementActive ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2 md:gap-2.5'}`}>

            {/* Slot before index 0 */}
            {isInlineJokerPlacementActive && activeJokerTile && (
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  onJokerPlace(activeJokerTile.id, 0);
                }}
                className="joker-slot shrink-0"
                title="แทรกตรงนี้"
              >
                <span className="text-[rgba(127,29,29,0.7)] font-black text-xs sm:text-sm md:text-lg leading-none">+</span>
              </button>
            )}

            {cleanPlayerHand.map((tile, idx) => {
              const N = cleanPlayerHand.length;
              const rot = fanAngle(idx, N);
              const yOff = fanY(idx, N);
              const isPenaltyPhase = gamePhase === 'PENALTY_REVEAL';
              const canClick = isPenaltyPhase && !tile.isRevealed;

              // Only shrink revealed cards to 'sm' when hand has 10+ cards
              const currentCardSize = (handSize >= 10 && tile.isRevealed) ? 'sm' : 'md';

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
                      size={currentCardSize}
                      isPenalty={canClick}
                      playSFX={playSFX}
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
                      className="joker-slot shrink-0"
                      title={`แทรกตรงนี้ (ช่อง ${idx + 2})`}
                      style={{ zIndex: idx + 30 }}
                    >
                      <span className="text-[rgba(127,29,29,0.7)] font-black text-xs sm:text-sm md:text-lg leading-none">+</span>
                    </button>
                  )}
                </React.Fragment>
              );
            })}
            {/* Divider and Player drawn tile inside the same flow to prevent overlap */}
            {drawnTile && activePlayer === 'player' && !isInlineJokerPlacementActive && (
              <>
                <div className="h-28 w-px border-l-2 border-dashed border-[rgba(127,29,29,0.35)] mx-3 self-center" />
                <div className="flex flex-col items-center gap-1.5 z-10 card-drawn-container">
                  <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest leading-none">จั่วได้</span>
                  <CursedTile tile={drawnTile} size="md" showBack={false} playSFX={playSFX} isPlayerCard={true} animate="draw-player" />
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

