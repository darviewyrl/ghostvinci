import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, CornerDownRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Reusable Card component
   ───────────────────────────────────────────────────────────── */
function Card({
  tile,
  size = 'md',  // 'sm' | 'md' | 'lg'
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
  const val = tile.value === -1 ? '★' : tile.value;

  // Size tokens
  const sizes = {
    sm: { card: 'w-10 h-16',    center: 'text-xl',    corner: 'text-[8px]' },
    md: { card: 'w-14 h-22',    center: 'text-3xl',   corner: 'text-[10px]' },
    lg: { card: 'w-16 h-26',    center: 'text-4xl',   corner: 'text-[11px]' },
  };
  const sz = sizes[size] || sizes.md;

  const colorClass   = isBlack ? 'card-black' : 'card-white';
  const revealedClass = tile.isRevealed && !showBack ? 'card-revealed' : '';
  const selectedClass = isSelected ? 'card-selected' : '';
  const guessClass    = isGuessable && !tile.isRevealed ? 'card-guessable' : '';
  const penaltyClass  = isPenalty && !tile.isRevealed ? 'card-penalty' : '';
  const animClass     = animate === 'glow' ? 'animate-ambient-glow' : animate === 'deal' ? 'animate-deal-in' : '';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`card-base ${colorClass} ${revealedClass} ${selectedClass} ${guessClass} ${penaltyClass} ${animClass} ${sz.card} ${className}`}
    >
      {/* Card back pattern */}
      {(showBack || (!tile.isRevealed && !showBack && tile.assignedValue === undefined && tile.value === undefined)) ? (
        /* shouldn't hit this branch – handled below */
        null
      ) : null}

      {/* Revealed face or back */}
      {showBack ? (
        /* Back of card (hidden) */
        <div className={`card-back-inner ${isBlack ? 'card-back-inner-black' : 'card-back-inner-white'}`}>
          <div className={`w-5/6 h-5/6 rounded flex items-center justify-center border ${isBlack ? 'border-gold/25 border-dashed' : 'border-charcoal/20 border-dashed'}`}>
            <span className="text-[8px] font-bold tracking-widest opacity-70">DC</span>
          </div>
        </div>
      ) : tile.isRevealed ? (
        /* Revealed — dimmed, no overlay text */
        <>
          <span className={`${sz.corner} font-bold leading-none self-start`}>{val}</span>
          <div className={`flex-1 flex items-center justify-center font-extrabold leading-none ${sz.center}`}>
            {val}
          </div>
          <div className="flex justify-between items-end">
            <span className={`${sz.corner} font-bold leading-none rotate-180 inline-block`}>{val}</span>
            <Eye className="w-3 h-3 opacity-50" strokeWidth={2} />
          </div>
        </>
      ) : (
        /* Hidden (face-down pattern) */
        <div className={`card-back-inner ${isBlack ? 'card-back-inner-black' : 'card-back-inner-white'}`}>
          <div className={`w-5/6 h-5/6 rounded flex items-center justify-center border ${isBlack ? 'border-gold/25 border-dashed' : 'border-charcoal/20 border-dashed'}`}>
            <span className="text-[8px] font-bold tracking-widest opacity-70">DC</span>
          </div>
        </div>
      )}

      {/* Selected indicator pip */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold border-2 border-charcoal flex items-center justify-center z-20">
          <span className="text-[9px] font-black text-charcoal leading-none">?</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main GameBoard
   ───────────────────────────────────────────────────────────── */
export default function GameBoard({
  playerHand,
  aiHand,
  deck,
  drawnTile,
  activePlayer,
  gamePhase,
  lastGuess,
  onGuess,
  onContinue,
  onPass,
  onPenaltySelect,
  onJokerPlace
}) {
  const [selectedAICardIdx, setSelectedAICardIdx] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const isPlayerTurn = activePlayer === 'player';
  const deckCount = deck.length;

  // Trigger snappy feedback banner on lastGuess change
  useEffect(() => {
    if (lastGuess) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [lastGuess]);

  const handleAICardClick = (idx) => {
    if (!isPlayerTurn || gamePhase !== 'GUESS' || aiHand[idx].isRevealed) return;
    setSelectedAICardIdx(idx);
  };

  const handleGuessSubmit = (value) => {
    if (selectedAICardIdx === null) return;
    onGuess(selectedAICardIdx, value);
    setSelectedAICardIdx(null);
  };

  // Inline Joker placement state
  const jokerToPlace = playerHand.find(t => t.value === -1 && t.assignedValue === -1);
  const isInlineJokerPlacementActive =
    (gamePhase === 'JOKER_SETUP' && jokerToPlace) ||
    (gamePhase === 'JOKER_PLACEMENT' && isPlayerTurn && drawnTile && drawnTile.value === -1);
  const activeJokerTile = jokerToPlace || (isInlineJokerPlacementActive ? drawnTile : null);
  const cleanPlayerHand = activeJokerTile
    ? playerHand.filter(t => t.id !== activeJokerTile.id)
    : playerHand;

  // Dynamic card sizing based on hand size
  const handSize = playerHand.length;
  const cardSize = handSize > 8 ? 'sm' : handSize > 6 ? 'sm' : 'md';

  // Fan formula — clean, subtle arc
  const fanAngle = (idx, total) => total > 1 ? (idx - (total - 1) / 2) * (14 / Math.max(total, 5)) : 0;
  const fanY     = (idx, total) => total > 1 ? Math.abs(idx - (total - 1) / 2) * 3 : 0;

  return (
    <div className="flex-1 flex flex-col justify-between relative w-full select-none font-thai overflow-hidden">

      {/* ══════════════════════════════════════════════════════════
          FEEDBACK BANNER (floats above everything)
          ══════════════════════════════════════════════════════ */}
      {showFeedback && lastGuess && (
        <div className="absolute inset-x-0 top-1/4 z-50 flex justify-center pointer-events-none">
          <div className={`animate-feedback-pop flex items-center gap-3 px-7 py-4 rounded-2xl shadow-2xl border-2 ${
            lastGuess.isCorrect
              ? 'bg-[#0d2b1a] border-emerald-600/60'
              : 'bg-[#2b0d0d] border-red-600/60'
          }`}>
            {lastGuess.isCorrect
              ? <CheckCircle className="w-7 h-7 text-emerald-400" strokeWidth={2} />
              : <XCircle     className="w-7 h-7 text-red-400"     strokeWidth={2} />
            }
            <div className="text-left">
              <span className={`text-base font-bold block tracking-wide ${lastGuess.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                {lastGuess.isCorrect ? 'ทายถูกต้อง!' : 'ทายผิดพลาด!'}
              </span>
              <span className="text-[10px] font-semibold text-ivory/50 block mt-0.5">
                {lastGuess.isCorrect ? 'ระบุการ์ดคู่แข่งสำเร็จ' : 'เปิดเผยการ์ดในมือของคุณ 1 ใบ'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          1. AI HAND — 3-D perspective wall
          ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center justify-center flex-1">
        <span className="text-[9px] font-semibold text-gold/45 uppercase tracking-widest mb-2">
          การ์ดของ AI ({aiHand.length} ใบ)
        </span>

        <div className="flex items-end justify-center gap-3 px-4 py-2 min-h-[130px] flex-wrap">
          {aiHand.map((tile, idx) => {
            const isSelected = selectedAICardIdx === idx;
            const isGuessable = isPlayerTurn && gamePhase === 'GUESS' && !tile.isRevealed;
            return (
              <div
                key={tile.id}
                onClick={() => handleAICardClick(idx)}
                style={{
                  transform: `perspective(900px) rotateY(-14deg) rotateX(12deg)`,
                  zIndex: idx,
                }}
              >
                <Card
                  tile={tile}
                  size="md"
                  isSelected={isSelected}
                  isGuessable={isGuessable}
                  showBack={!tile.isRevealed}
                />
              </div>
            );
          })}

          {/* AI drawn tile slot */}
          {drawnTile && activePlayer === 'ai' && (
            <div className="ml-4 pl-4 border-l border-gold/15 flex flex-col items-center gap-1.5">
              <span className="text-[8px] font-semibold text-gold/50 uppercase tracking-widest">จั่วได้</span>
              <div style={{ transform: `perspective(900px) rotateY(-14deg) rotateX(12deg)` }}>
                <Card tile={drawnTile} size="md" showBack={!drawnTile.isRevealed} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. MIDDLE CONTROLS — Deck + Action buttons
          ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-4 my-3">
        {selectedAICardIdx === null ? (
          <div className="flex items-center gap-5 bg-charcoal-dark/80 border border-gold/18 rounded-2xl px-5 py-3.5 shadow-xl shadow-black/50">

            {/* Deck Pile */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-17 rounded-xl bg-felt-dark border border-felt-light/40 border-b-[3px] border-r-[2px] flex items-center justify-center shadow-md">
                <div className="text-center">
                  <span className="text-[8px] font-bold text-gold/60 uppercase tracking-tight block">DECK</span>
                  <span className="text-sm font-bold text-gold leading-none">{deckCount}</span>
                </div>
              </div>
              <span className="text-[7px] font-semibold text-gold/35 uppercase tracking-widest">กอง</span>
            </div>

            {/* Turn actions */}
            <div className="flex flex-col items-center gap-2 min-w-[180px]">
              {isPlayerTurn && gamePhase === 'DECIDE' && (
                <div className="flex gap-2">
                  <button
                    onClick={onContinue}
                    className="py-2.5 px-5 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-[10px] rounded-xl border border-gold-light/60 transition-all duration-200 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-widest"
                  >
                    ทายต่อ
                  </button>
                  <button
                    onClick={onPass}
                    className="py-2.5 px-5 bg-charcoal text-gold border border-gold/25 hover:border-gold font-semibold text-[10px] rounded-xl transition-all duration-200 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-widest"
                  >
                    ผ่านเทิร์น
                  </button>
                </div>
              )}

              {isPlayerTurn && gamePhase === 'GUESS' && (
                <p className="text-[10px] font-semibold text-gold/80 tracking-wide text-center leading-snug animate-pulse">
                  แตะการ์ด AI ด้านบนเพื่อเลือก
                </p>
              )}

              {!isPlayerTurn && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent spinner-gold animate-spin" />
                  <span className="text-[9px] font-semibold text-ivory/40 uppercase tracking-widest">AI กำลังวิเคราะห์...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Guess Input Panel ── */
          <div className="bg-charcoal border-2 border-gold/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-black/90 text-center">
            <p className="text-[10px] font-semibold text-gold/60 uppercase tracking-widest mb-1 leading-none">
              ทายการ์ดใบที่ {selectedAICardIdx + 1}
            </p>
            <h3 className="text-sm font-bold text-ivory mb-4 leading-snug">
              เลือกค่าตัวเลขที่คาดว่าจะถูกต้อง
            </h3>

            {/* Number grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 12 }).map((_, val) => (
                <button
                  key={val}
                  onClick={() => handleGuessSubmit(val)}
                  className="py-2.5 font-bold text-sm text-gold bg-charcoal-dark hover:bg-gold hover:text-charcoal-dark border border-gold/20 hover:border-gold rounded-xl transition-all duration-150 cursor-pointer active:scale-95 tabular-nums"
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleGuessSubmit('Joker')}
                className="flex-1 py-2.5 bg-gold text-charcoal-dark font-bold text-xs rounded-xl border border-gold-light/60 hover:bg-gold-dark transition-all duration-200 cursor-pointer uppercase tracking-widest"
              >
                Joker ★
              </button>
              <button
                onClick={() => setSelectedAICardIdx(null)}
                className="py-2.5 px-4 bg-transparent text-ivory/50 border border-gold/20 hover:border-gold/50 hover:text-ivory font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. PLAYER HAND — fanned arc with inline Joker slots
          ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center">

        {/* Joker placement hint banner */}
        {isInlineJokerPlacementActive && activeJokerTile && (
          <div className="mb-2.5 flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-xl px-4 py-2 text-xs font-semibold text-gold/90 tracking-wide">
            <CornerDownRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>แตะ <strong>+</strong> ในมือด้านล่างเพื่อแทรก Joker</span>
            {/* Mini Joker preview */}
            <div className={`w-5 h-8 rounded border ml-1 flex items-center justify-center text-[10px] font-bold shrink-0 ${
              activeJokerTile.color === 'black' ? 'bg-charcoal border-gold/40 text-gold' : 'bg-ivory border-charcoal/25 text-charcoal-dark'
            }`}>★</div>
          </div>
        )}

        {/* Hand fan row */}
        <div
          className="relative flex items-end justify-center py-4 px-6 min-h-[150px] w-full max-w-5xl"
          style={{ perspective: '900px' }}
        >
          <div className="flex items-end justify-center" style={{ gap: isInlineJokerPlacementActive ? '4px' : '10px' }}>

            {/* Slot before index 0 */}
            {isInlineJokerPlacementActive && activeJokerTile && (
              <button
                onClick={() => onJokerPlace(activeJokerTile.id, 0)}
                className="joker-slot w-8 h-[88px] shrink-0"
                title="แทรกตรงนี้"
              >
                <span className="text-gold font-bold text-lg leading-none">+</span>
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
                    onClick={() => canClick && onPenaltySelect(idx)}
                    style={{
                      transform: `rotate(${rot}deg) translateY(${yOff}px)`,
                      zIndex: idx + 5,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    <Card
                      tile={tile}
                      size={cardSize}
                      isPenalty={canClick}
                      animate={tile._isNew ? 'deal' : undefined}
                    />
                  </div>

                  {/* Slot after each card (joker placement) */}
                  {isInlineJokerPlacementActive && activeJokerTile && (
                    <button
                      onClick={() => onJokerPlace(activeJokerTile.id, idx + 1)}
                      className="joker-slot w-8 h-[88px] shrink-0"
                      title={`แทรกตรงนี้ (ช่อง ${idx + 2})`}
                      style={{ zIndex: idx + 30 }}
                    >
                      <span className="text-gold font-bold text-lg leading-none">+</span>
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Player drawn card — ambient glow, no bounce */}
          {drawnTile && activePlayer === 'player' && !isInlineJokerPlacementActive && (
            <div className="absolute right-3 bottom-3 flex flex-col items-center gap-1.5 z-40">
              <span className="text-[8px] font-semibold text-gold/60 uppercase tracking-widest">จั่วได้</span>
              <div className="animate-ambient-glow rounded-[10px]">
                <Card
                  tile={drawnTile}
                  size="md"
                  showBack={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Player label */}
        <span className={`text-[9px] font-semibold uppercase tracking-widest mt-1 ${
          gamePhase === 'PENALTY_REVEAL' ? 'text-red-400' : 'text-gold/40'
        }`}>
          {gamePhase === 'PENALTY_REVEAL' ? 'เลือก 1 ใบเพื่อเปิดเผย' : `มือของคุณ (${playerHand.length} ใบ)`}
        </span>
      </div>
    </div>
  );
}
