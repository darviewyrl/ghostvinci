import React, { useEffect, useRef, useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import GameHUD from './components/GameHUD';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { getAIDecision, calculateCandidatesForHand } from './utils/gameLogic';
import { X } from 'lucide-react';

export default function App() {
  const [state, dispatch] = useGameState();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    gamePhase,
    playerHand,
    aiHand,
    deck,
    removedTiles,
    activePlayer,
    drawnTile,
    consecutiveCorrectGuesses,
    turnCount,
    elapsedTime,
    timeLeft,
    gameLogs,
    scores,
    aiDifficulty,
    cardRemovalCount,
    dealingIndex,
    jokerSetupIndex,
  } = state;

  const playerLost = playerHand.every(t => t.isRevealed);

  const {
    isMuted,
    toggleMute,
    playBGM,
    stopBGM,
    playSFX,
    bgmVolume,
    sfxVolume,
    setBGMVolume,
    setSFXVolume,
  } = useAudio();

  // BGM only plays inside gameplay. Stopped on lobby mount.
  useEffect(() => {
    if (gamePhase === 'LOBBY') {
      stopBGM();
    }
  }, [gamePhase, stopBGM]);

  // Refs to track state transitions for audio triggers
  const prevPhase      = useRef(gamePhase);
  const prevActivePlayer = useRef(activePlayer);
  const prevDrawnTile = useRef(drawnTile);

  // Sound effects mapping
  useEffect(() => {
    // 1. Play draw sound when a card is drawn (drawnTile changes from null to something)
    if (drawnTile && !prevDrawnTile.current) {
      playSFX('draw');
    }
    prevDrawnTile.current = drawnTile;

    // 2. Play victory/game over BGM and SFX
    if (gamePhase !== prevPhase.current) {
      if (gamePhase === 'GAME_OVER') {
        if (playerLost) {
          playSFX('defeat');
        } else {
          playSFX('victory');
        }
      }
      prevPhase.current = gamePhase;
    }
  }, [gamePhase, drawnTile, playSFX, playerLost]);

  // 2. Turn Countdown Timer
  useEffect(() => {
    let interval = null;
    if (gamePhase === 'GUESS' || gamePhase === 'DECIDE' || (gamePhase === 'JOKER_PLACEMENT' && activePlayer === 'player')) {
      interval = setInterval(() => {
        dispatch({ type: 'TIMER_TICK' });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [gamePhase, activePlayer]);

  // 2.5 Match Elapsed Timer
  useEffect(() => {
    let interval = null;
    if (gamePhase !== 'LOBBY' && gamePhase !== 'GAME_OVER') {
      interval = setInterval(() => {
        dispatch({ type: 'TICK_ELAPSED' });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [gamePhase]);

  // 3. Staggered Dealing animation
  useEffect(() => {
    if (gamePhase !== 'DEAL') return;
    if (dealingIndex < 8) {
      const timer = setTimeout(() => {
        playSFX('draw');
        dispatch({ type: 'DEAL_CARD' });
      }, 500);
      return () => clearTimeout(timer);
    } else if (dealingIndex === 8) {
      const timer = setTimeout(() => dispatch({ type: 'CHECK_JOKERS_POST_DEAL' }), 600);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, dealingIndex, playSFX]);

  // 4. Auto turn transition banners
  useEffect(() => {
    if (gamePhase !== 'TURN_BANNER') return;
    const timer = setTimeout(() => dispatch({ type: 'TRANSITION_TO_DRAW' }), 1500);
    return () => clearTimeout(timer);
  }, [gamePhase]);

  // 5. AI Turn Automation State Machine
  useEffect(() => {
    if (activePlayer !== 'ai' || gamePhase === 'LOBBY' || gamePhase === 'DEAL' || gamePhase === 'GAME_OVER') return;
    if (gamePhase === 'TURN_BANNER') return;

    if (gamePhase === 'GUESS') {
      const timer = setTimeout(() => {
        const decision = getAIDecision(aiDifficulty, playerHand, aiHand);
        if (decision) {
          const targetCard = playerHand[decision.targetIndex];
          dispatch({ type: 'GUESS_TILE', payload: { targetIndex: decision.targetIndex, guessedValue: decision.guess, guessedColor: targetCard.color } });
        } else {
          dispatch({ type: 'PASS_TURN' });
        }
      }, 2200);
      return () => clearTimeout(timer);
    }

    if (gamePhase === 'DECIDE') {
      const timer = setTimeout(() => {
        if (aiDifficulty === 'easy') {
          dispatch({ type: 'PASS_TURN' });
          return;
        }
        if (aiDifficulty === 'medium') {
          const shouldPass = Math.random() > 0.5 || consecutiveCorrectGuesses >= 2;
          dispatch({ type: shouldPass ? 'PASS_TURN' : 'CONTINUE_GUESSING' });
          return;
        }
        if (aiDifficulty === 'hard') {
          const candidates = calculateCandidatesForHand(playerHand, aiHand);
          const hiddenIndices = playerHand.map((t, idx) => (t.isRevealed ? -1 : idx)).filter(idx => idx !== -1);
          const hasCertainCard = hiddenIndices.some(idx => candidates[idx].length === 1);
          if (hasCertainCard) {
            dispatch({ type: 'CONTINUE_GUESSING' });
          } else {
            const shouldPass = Math.random() > 0.3 || consecutiveCorrectGuesses >= 3;
            dispatch({ type: shouldPass ? 'PASS_TURN' : 'CONTINUE_GUESSING' });
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (gamePhase === 'JOKER_PLACEMENT') {
      const timer = setTimeout(() => dispatch({ type: 'AI_PLACE_JOKER' }), 1500);
      return () => clearTimeout(timer);
    }
  }, [activePlayer, gamePhase, aiDifficulty, playerHand, aiHand, consecutiveCorrectGuesses]);

  // Handler functions — ALL LOGIC PRESERVED
  const handleConfigChange   = (config) => dispatch({ type: 'SET_LOBBY_CONFIG', payload: config });
  
  const handleStartGame      = () => {
    setIsTransitioning(true);
    // At the midpoint (800ms) when screen is fully black, trigger start game & play BGM
    setTimeout(() => {
      playBGM();
      dispatch({ type: 'START_GAME' });
    }, 800);
    // Finish transition after 1600ms
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1600);
  };

  const handleGuess          = (targetIndex, value, color) => dispatch({ type: 'GUESS_TILE', payload: { targetIndex, guessedValue: value, guessedColor: color } });
  const handleContinue       = () => dispatch({ type: 'CONTINUE_GUESSING' });
  const handlePass           = () => dispatch({ type: 'PASS_TURN' });
  const handleJokerPlace     = (tileId, insertIndex) => dispatch({ type: 'PLACE_JOKER', payload: { tileId, insertIndex } });
  const handlePenaltySelect  = (cardIndex) => dispatch({ type: 'PENALTY_SELECT_PLAYER_CARD', payload: { cardIndex } });
  const handleResetScores    = () => dispatch({ type: 'RESET_STATS' });
  
  const handleQuitLobby      = () => { 
    stopBGM(); 
    dispatch({ type: 'QUIT_TO_LOBBY' }); 
  };
  
  const handleRestartGame    = () => { 
    playBGM(); 
    dispatch({ type: 'START_GAME' }); 
  };

  return (
    <>
      {gamePhase === 'LOBBY' ? (
        <SetupScreen
          aiDifficulty={aiDifficulty}
          cardRemovalCount={cardRemovalCount}
          onConfigChange={handleConfigChange}
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          scores={scores}
          onResetScores={handleResetScores}
          playSFX={playSFX}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <div className="h-screen w-screen overflow-hidden bg-haunted relative flex flex-row gap-2 p-2.5 font-thai select-none">
          {/* ── LEFT COLUMN: HUD + Board ── */}
          <div className="flex-1 h-full flex flex-col gap-2 min-w-0 relative z-10">
            {/* HUD Header */}
            <GameHUD
              activePlayer={activePlayer}
              gamePhase={gamePhase}
              timeLeft={timeLeft}
              scores={scores}
              consecutiveGuesses={consecutiveCorrectGuesses}
              gameLogs={gameLogs}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onQuitLobby={handleQuitLobby}
              onRestartGame={handleRestartGame}
              aiDifficulty={aiDifficulty}
              onOpenSettings={() => setIsSettingsOpen(true)}
              elapsedTime={elapsedTime}
              turnCount={turnCount}
            />

            {/* Turn Banner Overlay */}
            {gamePhase === 'TURN_BANNER' && (
              <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto animate-turn-banner">
                  <div className="bg-[rgba(10,10,12,0.97)] border-y border-[rgba(127,29,29,0.6)] py-6 px-16 text-center shadow-2xl shadow-black/90">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-[rgba(230,60,60,0.85)] font-black text-lg">✝</span>
                      <h1 className="text-4xl font-black text-bone tracking-[0.18em] uppercase leading-none text-flicker">
                        {activePlayer === 'player' ? 'ถึงตาของคุณ' : 'วิญญาณเคลื่อนไหว'}
                      </h1>
                      <span className="text-[rgba(230,60,60,0.85)] font-black text-lg">✝</span>
                    </div>
                    <p className="text-[12px] font-bold text-bone/70 uppercase tracking-[0.18em] leading-none">
                      {activePlayer === 'player' ? 'ถอดรหัสให้ได้ก่อนถูกสาป' : 'วิญญาณกำลังประเมินคุณ...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Board Arena */}
            <div className="flex-1 min-h-0 flex flex-col ritual-table p-2">
              <GameBoard
                playerHand={playerHand}
                aiHand={aiHand}
                deck={deck}
                drawnTile={drawnTile}
                activePlayer={activePlayer}
                gamePhase={gamePhase}
                lastGuess={state.lastGuess}
                timeLeft={timeLeft}
                consecutiveGuesses={consecutiveCorrectGuesses}
                onGuess={handleGuess}
                onContinue={handleContinue}
                onPass={handlePass}
                onPenaltySelect={handlePenaltySelect}
                onJokerPlace={handleJokerPlace}
                playSFX={playSFX}
              />
            </div>
          </div>

          {/* ── GAME OVER MODAL ── */}
          {gamePhase === 'GAME_OVER' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-[2px] p-4 font-thai">
              <div
                className="bg-[#080808] border border-[rgba(127,29,29,0.5)] p-8 max-w-sm w-full text-center relative shadow-2xl shadow-black/95 overflow-hidden"
                style={{ clipPath: 'polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)' }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <span className="text-[16rem] font-black text-bone leading-none select-none">☠</span>
                </div>
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[rgba(127,29,29,0.8)] to-transparent" />
                <p className="text-[11px] font-black text-[rgba(230,60,60,0.7)] font-cinzel uppercase tracking-[0.28em] mb-3">
                  ✝ &nbsp; Davinci Code &nbsp; ✝
                </p>
                <h2 className={`text-4xl font-black uppercase tracking-wider mb-1 leading-tight text-flicker ${
                  playerLost ? 'text-[rgba(220,60,60,0.95)]' : 'text-bone'
                }`}>
                  {playerLost ? 'คุณถูกสาป!' : 'คุณหลุดพ้น!'}
                </h2>
                <p className="text-[12px] font-bold uppercase tracking-widest mb-6 leading-none text-bone/65">
                  {playerLost ? 'วิญญาณพิชิตคุณแล้ว' : 'รหัสลับถูกถอดแล้ว'}
                </p>
                <div className="bg-[rgba(127,29,29,0.06)] border border-[rgba(127,29,29,0.2)] px-4 py-4 mb-6 text-left"
                  style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                >
                  <p className="text-[12px] text-bone/65 leading-relaxed italic text-center">
                    {playerLost
                      ? '"วิญญาณได้อ่านทุกแผ่นจารึกในมือคุณ&ensp;คุณกลายเป็นส่วนหนึ่งของพิธีกรรม..."'
                      : '"คุณถอดรหัสสำเร็จ&ensp;ตราประทับแตก&ensp;วิญญาณสิ้นพลัง&ensp;ประตูถูกเปิด..."'
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRestartGame}
                    className="w-full py-3.5 bg-[#0e0505] hover:bg-[#1a0808] text-[#ef4444] font-black text-xs tracking-[0.18em] border border-[rgba(153,27,27,0.5)] hover:border-[rgba(200,40,40,0.9)] transition-all duration-300 active-blood-pulse cursor-pointer uppercase"
                    style={{ clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)' }}
                  >
                    ☠ &nbsp; เข้าพิธีกรรมอีกครั้ง
                  </button>
                  <button
                    onClick={handleQuitLobby}
                    className="w-full py-3 bg-transparent text-bone/35 border border-[rgba(127,29,29,0.18)] hover:border-[rgba(127,29,29,0.45)] hover:text-bone/60 font-bold text-xs tracking-widest transition-all duration-300 cursor-pointer uppercase"
                    style={{ clipPath: 'polygon(5px 0%, calc(100% - 5px) 0%, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0% calc(100% - 5px), 0% 5px)' }}
                  >
                    ออกจากพิธีกรรม
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER ROOT-LEVEL TRANSITION OVERLAY */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black animate-fade-transition pointer-events-none" />
      )}

      {/* RENDER SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-[2px] p-4">
          <div className="bg-[#0c0c10] border border-[rgba(220,50,50,0.5)] p-8 max-w-sm w-full shadow-2xl shadow-black rounded-lg relative font-thai"
               style={{ clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)' }}
          >
            {/* Close button */}
            <button 
              onClick={() => {
                if (playSFX) playSFX('flip');
                setIsSettingsOpen(false);
              }}
              className="absolute top-4 right-4 text-bone/50 hover:text-[#ef4444] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-bone mb-6 text-center uppercase tracking-widest border-b border-[rgba(220,50,50,0.2)] pb-2 flex items-center justify-center gap-2">
              <span>⚙️ การตั้งค่าเสียง</span>
            </h3>

            <div className="space-y-6">
              {/* Mute Toggle */}
              <div className="flex items-center justify-between bg-black/40 p-3.5 border border-neutral-900 rounded-lg">
                <span className="text-xs font-bold text-bone/80">ปิดเสียงทั้งหมด</span>
                <button
                  onClick={() => {
                    if (playSFX) playSFX('flip');
                    toggleMute();
                  }}
                  className={`px-4 py-1.5 text-xs font-black border transition-all duration-200 cursor-pointer ${
                    isMuted
                      ? 'bg-[#1a0808] text-[#ef4444] border-red-500/50'
                      : 'bg-black/60 text-bone/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                  style={{ clipPath: 'polygon(3px 0%, calc(100% - 3px) 0%, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0% calc(100% - 3px), 0% 3px)' }}
                >
                  {isMuted ? 'เปิดอยู่' : 'ปิดอยู่'}
                </button>
              </div>

              {/* BGM Volume */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-bone/85">ระดับเสียงเพลงประกอบ (BGM)</span>
                  <span className="text-xs font-bold text-rose-500/80">{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgmVolume}
                  onChange={(e) => setBGMVolume(parseFloat(e.target.value))}
                  disabled={isMuted}
                  className="w-full accent-rose-600 h-1 bg-black/60 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-bone/85">ระดับเสียงเอฟเฟกต์ (SFX)</span>
                  <span className="text-xs font-bold text-rose-500/80">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setSFXVolume(vol);
                  }}
                  onMouseUp={() => {
                    if (playSFX) playSFX('flip');
                  }}
                  onTouchEnd={() => {
                    if (playSFX) playSFX('flip');
                  }}
                  disabled={isMuted}
                  className="w-full accent-rose-600 h-1 bg-black/60 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  setIsSettingsOpen(false);
                }}
                className="w-full py-3.5 mt-2 bg-[#0e0505] hover:bg-[#1a0808] text-[#ef4444] font-black text-xs tracking-wider border border-[rgba(153,27,27,0.5)] hover:border-[rgba(200,40,40,0.9)] transition-all duration-300 cursor-pointer uppercase"
                style={{ clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)' }}
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
