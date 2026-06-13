import React, { useState, useEffect } from 'react';
import { Eye, HelpCircle, CheckCircle, XCircle, ChevronRight, CornerDownRight } from 'lucide-react';

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
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 1400); // show for 1.4 seconds
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

  // Determine if inline Joker placement is active for Player
  // This occurs during initial JOKER_SETUP, or JOKER_PLACEMENT phase for a drawn Joker
  const jokerToPlace = playerHand.find(tile => tile.value === -1 && tile.assignedValue === -1);
  const isInlineJokerPlacementActive = (gamePhase === 'JOKER_SETUP' && jokerToPlace) ||
    (gamePhase === 'JOKER_PLACEMENT' && isPlayerTurn && drawnTile && drawnTile.value === -1);

  const activeJokerTile = jokerToPlace || (isInlineJokerPlacementActive ? drawnTile : null);

  // Clean hand excluding the Joker currently being placed
  const cleanPlayerHand = activeJokerTile 
    ? playerHand.filter(t => t.id !== activeJokerTile.id)
    : playerHand;

  // Scale cards down dynamically if player has a large hand
  const handSize = playerHand.length;
  let cardSizeClass = 'w-14 h-22 md:w-20 md:h-30 text-base';
  if (handSize > 8) {
    cardSizeClass = 'w-9 h-14 md:w-12 md:h-18 text-xs';
  } else if (handSize > 6) {
    cardSizeClass = 'w-11 h-17 md:w-15 md:h-22 text-sm';
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-4 relative w-full select-none font-thai overflow-hidden">
      
      {/* Dynamic Exaggerated Snap Feedback Banners */}
      {showFeedback && lastGuess && (
        <div className="absolute inset-x-0 top-1/3 z-40 flex justify-center items-center pointer-events-none animate-pulse">
          {lastGuess.isCorrect ? (
            <div className="bg-emerald-950/95 border-2 border-emerald-500 rounded-xl px-8 py-4 shadow-2xl flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div className="text-left">
                <span className="text-lg font-bold text-green-400 block tracking-widest uppercase">ทายถูกต้อง!</span>
                <span className="text-[10px] font-bold text-ivory/60">ระบุการ์ดคู่แข่งสำเร็จ</span>
              </div>
            </div>
          ) : (
            <div className="bg-red-950/95 border-2 border-red-500 rounded-xl px-8 py-4 shadow-2xl flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div className="text-left">
                <span className="text-lg font-bold text-red-400 block tracking-widest uppercase">ทายผิดพลาด!</span>
                <span className="text-[10px] font-bold text-ivory/60">คุณโดนลงโทษเปิดการ์ด</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. AI Opponent Hand Section (Slanted 3D Wall) */}
      <div className="flex flex-col items-center flex-1 justify-center">
        <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest mb-1">
          กองกำลังการ์ดของ AI (AI's Tiles)
        </span>
        <div className="perspective-1000 preserve-3d flex items-center justify-center gap-3 md:gap-4.5 py-4 px-6 min-h-[120px] max-w-full overflow-x-auto custom-scrollbar">
          {aiHand.map((tile, idx) => {
            const isSelected = selectedAICardIdx === idx;
            const isBlack = tile.color === 'black';
            
            return (
              <div
                key={tile.id}
                onClick={() => handleAICardClick(idx)}
                className={`w-12 h-20 md:w-16 md:h-26 rounded-lg flex flex-col justify-between p-2.5 transition-all duration-300 ease-out relative cursor-pointer preserve-3d shadow-lg ${
                  tile.isRevealed
                    ? isBlack
                      ? 'bg-charcoal/40 border border-gold/15 text-gold/40 shadow-none opacity-60'
                      : 'bg-ivory-dark/30 border border-charcoal/10 text-charcoal-dark/35 shadow-none opacity-60'
                    : isSelected
                    ? 'scale-105 active-border-pulse'
                    : isPlayerTurn && gamePhase === 'GUESS'
                    ? isBlack
                      ? 'bg-charcoal border-t border-l border-gold/20 border-b-4 border-r-2 border-charcoal-dark hover:-translate-y-2 hover:shadow-gold/20'
                      : 'bg-ivory border-t border-l border-white border-b-4 border-r-2 border-ivory-dark hover:-translate-y-2 hover:shadow-gold/20'
                    : isBlack
                    ? 'bg-charcoal border-t border-l border-gold/15 border-b-4 border-r-2 border-charcoal-dark'
                    : 'bg-ivory border-t border-l border-white border-b-4 border-r-2 border-ivory-dark'
                }`}
                style={{
                  transform: `perspective(800px) rotateY(-18deg) rotateX(15deg) translateZ(0)`,
                }}
              >
                {tile.isRevealed ? (
                  <>
                    <span className="text-[9px] font-bold self-start leading-none">{tile.value === -1 ? '★' : tile.value}</span>
                    <div className="flex-1 flex items-center justify-center font-extrabold text-2xl md:text-3xl leading-none">
                      {tile.value === -1 ? '★' : tile.value}
                    </div>
                    <div className="flex justify-between items-center w-full leading-none">
                      <span className="text-[9px] font-bold rotate-180">{tile.value === -1 ? '★' : tile.value}</span>
                      <Eye className="w-3.5 h-3.5 opacity-60 text-gold-light" />
                    </div>
                  </>
                ) : (
                  // Distinct card back geometric patterns for Black vs White cards
                  <div className="absolute inset-0 rounded-lg flex items-center justify-center p-1.5">
                    <div 
                      className={`w-full h-full rounded flex items-center justify-center border ${
                        isBlack
                          ? 'border-gold/20 bg-charcoal-dark/50 text-gold/40'
                          : 'border-charcoal/20 bg-ivory-dark/40 text-charcoal/50'
                      }`}
                    >
                      <div className="w-5/6 h-5/6 border border-current border-dashed opacity-55 rounded flex items-center justify-center">
                        <span className="text-[9px] font-serif font-extrabold tracking-tighter">DC</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected target indicator */}
                {isSelected && (
                  <div className="absolute -top-3.5 -right-2 bg-gold text-charcoal-dark w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border border-gold-light shadow">
                    ?
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Drawn Slot (Face down back style) */}
          {drawnTile && activePlayer === 'ai' && (
            <div className="ml-5 pl-5 border-l border-gold/20 flex flex-col items-center">
              <span className="text-[8px] font-bold text-gold/60 mb-1.5 uppercase tracking-wider">ใบที่จั่วได้</span>
              <div
                className={`w-12 h-20 md:w-16 md:h-26 rounded-lg border-t border-l border-b-4 border-r-2 flex items-center justify-center shadow-xl transition-transform duration-300 relative ${
                  drawnTile.isRevealed
                    ? drawnTile.color === 'black'
                      ? 'bg-charcoal border-gold/30 border-charcoal-dark text-gold'
                      : 'bg-ivory border-white border-ivory-dark text-charcoal-dark'
                    : drawnTile.color === 'black'
                    ? 'bg-charcoal border-gold/15 border-charcoal-dark text-gold/35'
                    : 'bg-ivory border-white border-ivory-dark text-charcoal-dark/35'
                }`}
                style={{
                  transform: `perspective(800px) rotateY(-18deg) rotateX(15deg) translateZ(0)`,
                }}
              >
                {drawnTile.isRevealed ? (
                  <span className="text-xl md:text-2xl font-extrabold">{drawnTile.value === -1 ? '★' : drawnTile.value}</span>
                ) : (
                  <div className="absolute inset-0 rounded-lg flex items-center justify-center p-1.5">
                    <div 
                      className={`w-full h-full rounded flex items-center justify-center border ${
                        drawnTile.color === 'black'
                          ? 'border-gold/20 bg-charcoal-dark/50 text-gold/40'
                          : 'border-charcoal/20 bg-ivory-dark/40 text-charcoal/50'
                      }`}
                    >
                      <div className="w-5/6 h-5/6 border border-current border-dashed opacity-55 rounded flex items-center justify-center">
                        <span className="text-[9px] font-serif font-extrabold tracking-tighter">DC</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Arena Controls (Deck pile status & Guess inputs) */}
      <div className="my-3 flex flex-col items-center justify-center gap-3">
        {selectedAICardIdx === null ? (
          <div className="flex items-center gap-6 bg-charcoal/95 border border-gold/25 rounded-2xl p-4 md:p-5 shadow-xl shadow-black/40">
            {/* Draw pile button (Static visual representation only) */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-12 h-18 md:w-14 md:h-20 border-t border-l border-b-4 border-r-2 rounded-xl flex items-center justify-center relative shadow-md bg-felt-light border-felt-dark opacity-85`}
              >
                <div className="w-5/6 h-5/6 border border-dashed border-gold/30 rounded-lg flex flex-col items-center justify-center p-1 text-gold/80">
                  <span className="text-[8px] font-bold font-mono tracking-tighter">DECK</span>
                  <span className="text-xs font-extrabold mt-0.5">{deckCount}</span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-gold/45 uppercase tracking-widest">กองการ์ด</span>
            </div>

            {/* Turn status/instructions */}
            <div className="flex flex-col justify-center min-w-[170px] text-center px-2">
              {isPlayerTurn && gamePhase === 'DECIDE' && (
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
                  <button
                    onClick={onContinue}
                    className="py-2.5 px-4 bg-gold hover:bg-gold-dark text-charcoal-dark font-extrabold text-[10px] rounded-lg border border-gold-light transition-all duration-300 shadow-md cursor-pointer uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0"
                  >
                    ทายต่อ (Continue)
                  </button>
                  <button
                    onClick={onPass}
                    className="py-2.5 px-4 bg-charcoal hover:bg-charcoal-dark text-gold border border-gold/30 hover:border-gold font-bold text-[10px] rounded-lg transition-all duration-300 shadow-md cursor-pointer uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0"
                  >
                    ผ่าน (Pass Turn)
                  </button>
                </div>
              )}

              {isPlayerTurn && gamePhase === 'GUESS' && (
                <p className="text-xs text-gold font-bold animate-pulse tracking-wide leading-relaxed">
                  เลือกการ์ด AI ด้านบนที่ต้องการเดารหัส
                </p>
              )}

              {!isPlayerTurn && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                  <span className="text-[9px] font-bold text-gold-light/50 uppercase tracking-widest">ตาของ AI กำลังวิเคราะห์...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* High-Contrast Numeric Guess Modal */
          <div className="bg-charcoal border-2 border-gold rounded-xl p-5 max-w-sm w-full mx-4 shadow-2xl shadow-black/95 text-center z-15">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-3">
              ทายรหัสการ์ดใบที่ {selectedAICardIdx + 1} ของ AI
            </h3>
            
            <div className="grid grid-cols-4 gap-2 mb-3.5">
              {Array.from({ length: 12 }).map((_, val) => (
                <button
                  key={val}
                  onClick={() => handleGuessSubmit(val)}
                  className="py-2 bg-charcoal-dark hover:bg-gold hover:text-charcoal-dark hover:border-gold font-extrabold text-xs text-gold border border-gold/25 rounded-lg transition-all duration-150 cursor-pointer uppercase tracking-wider"
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleGuessSubmit('Joker')}
                className="flex-1 py-2.5 bg-gold text-charcoal-dark font-extrabold text-xs rounded-lg border border-gold-light hover:bg-gold-dark transition-all duration-200 cursor-pointer uppercase tracking-widest"
              >
                ทายว่าเป็น Joker (★)
              </button>
              <button
                onClick={() => setSelectedAICardIdx(null)}
                className="py-2.5 px-4 bg-charcoal text-ivory/60 border border-gold/30 hover:border-gold font-bold text-xs rounded-lg transition-all duration-200 cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Player Hand Section (Curve Fan layout / Inline Joker Placement) */}
      <div className="flex flex-col items-center justify-end mt-4">
        {/* Inline Joker placement indicator */}
        {isInlineJokerPlacementActive && activeJokerTile && (
          <div className="mb-3 flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-xl px-4 py-2 text-xs font-bold text-gold tracking-wide animate-pulse">
            <CornerDownRight className="w-4 h-4 text-gold" />
            <span>จัดทัพ Joker: โปรดเลือกแตะปุ่ม "+" ในมือด้านล่างเพื่อแทรกการ์ดใบนี้</span>
            
            {/* Miniature of placing card */}
            <div className={`w-6 h-9 rounded ml-2 border flex items-center justify-center text-[10px] ${
              activeJokerTile.color === 'black'
                ? 'bg-charcoal border-gold/50 text-gold'
                : 'bg-ivory border-charcoal/30 text-charcoal-dark'
            }`}>
              ★
            </div>
          </div>
        )}

        <div className="relative flex items-center justify-center py-4 px-6 min-h-[140px] w-full max-w-4xl">
          {/* Fanned Hand Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 py-3 px-2">
            
            {/* If Joker placement is active, we render a slot selector before index 0 */}
            {isInlineJokerPlacementActive && activeJokerTile && (
              <button
                onClick={() => onJokerPlace(activeJokerTile.id, 0)}
                className="w-10 h-16 md:w-12 md:h-22 border-2 border-dashed border-gold hover:border-gold-light hover:bg-gold/15 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 z-30"
                title="แทรกตรงนี้ (ช่องที่ 1)"
              >
                <span className="text-gold font-extrabold text-base">+</span>
              </button>
            )}

            {cleanPlayerHand.map((tile, idx) => {
              const N = cleanPlayerHand.length;
              // Subtle elegant fanning curve formula (does not mess up numbers)
              const rot = N > 1 ? (idx - (N - 1) / 2) * (18 / N) : 0;
              const yTrans = N > 1 ? Math.abs(idx - (N - 1) / 2) * 3.5 : 0;
              const isBlack = tile.color === 'black';

              const isPenaltyPhase = gamePhase === 'PENALTY_REVEAL';
              const canClickForPenalty = isPenaltyPhase && !tile.isRevealed;

              return (
                <React.Fragment key={tile.id}>
                  <div
                    onClick={() => canClickForPenalty && onPenaltySelect(idx)}
                    className={`${cardSizeClass} rounded-xl flex flex-col justify-between border-t border-l border-b-4 border-r-2 transition-all duration-300 ease-out relative shadow-md ${
                      tile.isRevealed
                        ? isBlack
                          ? 'bg-charcoal/40 border border-gold/15 text-gold/40 shadow-none opacity-60'
                          : 'bg-ivory-dark/30 border border-charcoal/10 text-charcoal-dark/35 shadow-none opacity-60'
                        : isBlack
                        ? 'bg-charcoal border-gold/30 border-charcoal-dark text-gold shadow-black/85'
                        : 'bg-ivory border-white border-ivory-dark text-charcoal-dark shadow-black/40'
                    } ${
                      canClickForPenalty 
                        ? 'border-red-500 cursor-pointer hover:-translate-y-3 hover:scale-105 active-border-pulse shadow-red-500/35' 
                        : 'hover:-translate-y-2 hover:shadow-lg hover:shadow-black/50'
                    }`}
                    style={{
                      transform: `rotate(${rot}deg) translateY(${yTrans}px)`,
                      zIndex: idx + 10,
                    }}
                  >
                    <span className="text-[10px] font-bold self-start leading-none">{tile.value === -1 ? '★' : tile.value}</span>
                    <div className="flex-1 flex items-center justify-center font-extrabold text-2xl md:text-3xl leading-none">
                      {tile.value === -1 ? '★' : tile.value}
                    </div>
                    
                    <div className="flex justify-between items-center w-full leading-none">
                      <span className="text-[10px] font-bold rotate-180">{tile.value === -1 ? '★' : tile.value}</span>
                      {tile.isRevealed && (
                        <Eye className="w-3.5 h-3.5 text-red-500 opacity-80 animate-pulse" title="AI เห็นการ์ดใบนี้แล้ว" />
                      )}
                    </div>
                  </div>

                  {/* Render inline placement slots between cards */}
                  {isInlineJokerPlacementActive && activeJokerTile && (
                    <button
                      onClick={() => onJokerPlace(activeJokerTile.id, idx + 1)}
                      className="w-10 h-16 md:w-12 md:h-22 border-2 border-dashed border-gold hover:border-gold-light hover:bg-gold/15 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 z-30"
                      title={`แทรกตรงนี้ (ช่องที่ ${idx + 2})`}
                    >
                      <span className="text-gold font-extrabold text-base">+</span>
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Player Drawn card slot (Pulsing shadow, no bounce) */}
          {drawnTile && activePlayer === 'player' && !isInlineJokerPlacementActive && (
            <div className="absolute right-2 md:right-6 bottom-4 flex flex-col items-center pl-4 border-l border-gold/15 z-35 bg-felt-dark/30 p-2.5 rounded-xl">
              <span className="text-[8px] font-bold text-gold/80 mb-1.5 uppercase tracking-widest">การ์ดที่จั่วได้</span>
              <div
                className={`w-14 h-22 md:w-20 md:h-30 rounded-xl flex flex-col justify-between p-2.5 border-t border-l border-b-4 border-r-2 shadow-2xl relative animate-pulse ${
                  drawnTile.color === 'black'
                    ? 'bg-charcoal border-gold/35 border-charcoal-dark text-gold shadow-gold/10'
                    : 'bg-ivory border-white border-ivory-dark text-charcoal-dark shadow-gold/10'
                }`}
              >
                <span className="text-[10px] font-bold self-start leading-none">{drawnTile.value === -1 ? '★' : drawnTile.value}</span>
                <div className="flex-1 flex items-center justify-center font-extrabold text-2xl md:text-3xl leading-none">
                  {drawnTile.value === -1 ? '★' : drawnTile.value}
                </div>
                <span className="text-[10px] font-bold self-end rotate-180 leading-none">{drawnTile.value === -1 ? '★' : drawnTile.value}</span>
              </div>
            </div>
          )}
        </div>
        
        <span className="text-[10px] font-bold text-gold/50 uppercase tracking-widest mt-2">
          {gamePhase === 'PENALTY_REVEAL' 
            ? 'บทลงโทษ! โปรดเลือกการ์ดของคุณ 1 ใบเพื่อกดยืนยันเปิดเผยต่อบอท AI' 
            : 'กองกำลังการ์ดของคุณ'
          }
        </span>
      </div>

    </div>
  );
}
