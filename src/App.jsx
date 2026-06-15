import React, { useEffect, useRef, useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import GameHUD from './components/GameHUD';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { getAIDecision, calculateCandidatesForHand } from './utils/gameLogic';
import { X, Settings, Volume2, VolumeX, Music, Sliders } from 'lucide-react';
import SmoothSlider from './components/SmoothSlider';

export default function App() {
  const [state, dispatch] = useGameState();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuitConfirmOpen, setIsQuitConfirmOpen] = useState(false);

  const [dailyQuest, setDailyQuest] = useState(() => {
    const saved = localStorage.getItem('ghostvinci_daily_quest_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      title: 'ชนะเกม 3 ครั้ง',
      progress: 2,
      target: 3,
      claimed: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('ghostvinci_daily_quest_v1', JSON.stringify(dailyQuest));
  }, [dailyQuest]);

  const handleClaimReward = () => {
    playSFX('victory');
    setDailyQuest(prev => ({ ...prev, claimed: true }));
  };

  const handleResetQuest = () => {
    playSFX('flip');
    setDailyQuest({
      title: 'ชนะเกม 3 ครั้ง',
      progress: 0,
      target: 3,
      claimed: false,
    });
  };

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

  // BGM plays only during active gameplay and stops in the lobby.
  useEffect(() => {
    if (gamePhase === 'LOBBY') {
      stopBGM();
    } else {
      void playBGM();
    }
  }, [gamePhase]);

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
      } else if (gamePhase === 'TURN_BANNER' || gamePhase === 'JOKER_SETUP' || gamePhase === 'JOKER_PLACEMENT') {
        playSFX('popup');
      }
      prevPhase.current = gamePhase;
    }
  }, [gamePhase, drawnTile, playSFX, playerLost]);

  // Turn Countdown Heartbeat Sound Warning (under 5 seconds)
  useEffect(() => {
    if ((gamePhase === 'GUESS' || gamePhase === 'DECIDE' || gamePhase === 'JOKER_PLACEMENT') && activePlayer === 'player') {
      if (timeLeft > 0 && timeLeft <= 5) {
        void playSFX('warning', timeLeft);
      }
    }
  }, [timeLeft, gamePhase, activePlayer, playSFX]);

  useEffect(() => {
    if (gamePhase !== 'FEEDBACK' || !state.lastGuess) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'ACKNOWLEDGE_FEEDBACK' });
    }, 1600);

    return () => clearTimeout(timer);
  }, [gamePhase, state.lastGuess]);

  const questProcessedRef = useRef(false);

  useEffect(() => {
    if (gamePhase === 'GAME_OVER') {
      if (!questProcessedRef.current) {
        questProcessedRef.current = true;
        if (!playerLost) {
          setDailyQuest(prev => {
            const nextProgress = Math.min(prev.progress + 1, prev.target);
            return {
              ...prev,
              progress: nextProgress,
            };
          });
        }
      }
    } else if (gamePhase === 'DEAL' || gamePhase === 'LOBBY') {
      questProcessedRef.current = false;
    }
  }, [gamePhase, playerLost]);

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
    if (activePlayer !== 'ai' || gamePhase === 'LOBBY' || gamePhase === 'DEAL' || gamePhase === 'FEEDBACK' || gamePhase === 'GAME_OVER') return;
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
    playSFX('transition');
    setIsTransitioning(true);
    // At the midpoint (800ms) when screen is fully black, trigger start game & play BGM
    setTimeout(() => {
      void playBGM();
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
    playSFX('transition');
    setIsTransitioning(true);
    stopBGM();
    setTimeout(() => {
      dispatch({ type: 'QUIT_TO_LOBBY' });
    }, 800);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1600);
  };
  
  const handleRestartGame    = () => { 
    void playBGM(); 
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
          dailyQuest={dailyQuest}
          onClaimReward={handleClaimReward}
          onResetQuest={handleResetQuest}
        />
      ) : (
        <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-haunted relative flex flex-col gap-3 p-2 pb-4 font-thai select-none md:h-screen md:flex-row md:gap-2 md:overflow-hidden md:p-2.5">
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
              onQuitLobby={() => setIsQuitConfirmOpen(true)}
              onRestartGame={handleRestartGame}
              aiDifficulty={aiDifficulty}
              onOpenSettings={() => setIsSettingsOpen(true)}
              elapsedTime={elapsedTime}
              turnCount={turnCount}
            />

            {/* Turn Banner Overlay */}
            {gamePhase === 'TURN_BANNER' && (
              <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto animate-turn-banner px-4">
                  <div className="bg-[rgba(10,10,12,0.97)] border-y border-[rgba(127,29,29,0.6)] py-5 px-6 text-center shadow-2xl shadow-black/90 md:px-16 md:py-6">
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
            <div className="flex-1 min-h-0 flex flex-col ritual-table p-2 overflow-visible md:overflow-hidden">
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
                  ✝ &nbsp; Ghostvinci &nbsp; ✝
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
                      ? '"วิญญาณได้อ่านทุกแผ่นจารึกในมือคุณ\u2002คุณกลายเป็นส่วนหนึ่งของพิธีกรรม..."'
                      : '"คุณถอดรหัสสำเร็จ\u2002ตราประทับแตก\u2002วิญญาณสิ้นพลัง\u2002ประตูถูกเปิด..."'
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
        <div className="fixed inset-0 z-[100] bg-black animate-fade-transition pointer-events-auto" />
      )}

      {/* RENDER SETTINGS MODAL */}
      {/* RENDER SETTINGS MODAL */}
      <div 
        onClick={() => {
          if (playSFX) playSFX('toggle');
          setIsSettingsOpen(false);
        }}
        className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-[8px] p-4 cursor-pointer transition-all duration-300 ease-in-out ${
          isSettingsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#0c0c10]/95 border border-[rgba(239,68,68,0.32)] max-w-md w-full max-h-[calc(100vh-4rem)] shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_20px_rgba(239,68,68,0.15)] rounded-2xl relative font-thai cursor-default flex flex-col overflow-hidden transition-all duration-300 ease-in-out sm:-translate-x-10 lg:-translate-x-20 xl:-translate-x-28 ${
            isSettingsOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
          }`}
        >
          <div className="overflow-y-auto curse-scrollbar p-6 sm:p-8 space-y-6 flex-1">
            <h3 className="text-base font-black text-bone mb-6 text-center uppercase tracking-widest border-b border-[rgba(239,68,68,0.15)] pb-3 flex items-center justify-center gap-2">
              <Sliders className="w-5 h-5 text-red-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.85)]" />
              <span>การตั้งค่าเสียงพิธีกรรม</span>
            </h3>

            <div className="space-y-5">
              {/* Mute Segmented Control (Excellent UX) */}
              <div className="flex items-center justify-between bg-black/45 p-4 border border-neutral-900 rounded-2xl transition-all duration-300 hover:border-red-950 hover:bg-black/60">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-bone uppercase tracking-wider">โหมดเสียง</span>
                  <span className="text-[10px] text-bone/50">เปิด/ปิดเสียงทั้งหมด</span>
                </div>
                <div className="flex bg-black/80 p-1 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => {
                      if (playSFX) playSFX('flip');
                      if (isMuted) toggleMute();
                    }}
                    className={`settings-segment-button px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer flex items-center gap-1.5 ${
                      !isMuted 
                        ? 'settings-segment-button-active bg-rose-950/60 text-rose-400 border border-rose-800/40 shadow-sm' 
                        : 'text-bone/40 border border-transparent'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>เปิด</span>
                  </button>
                  <button
                    onClick={() => {
                      if (playSFX) playSFX('flip');
                      if (!isMuted) toggleMute();
                    }}
                    className={`settings-segment-button px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer flex items-center gap-1.5 ${
                      isMuted 
                        ? 'settings-segment-button-active bg-rose-950/60 text-rose-400 border border-rose-800/40 shadow-sm' 
                        : 'text-bone/40 border border-transparent'
                    }`}
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>ปิด</span>
                  </button>
                </div>
              </div>

              {/* BGM Volume */}
              <SmoothSlider
                label="เพลงประกอบ (BGM)"
                icon={Music}
                volume={bgmVolume}
                onChange={setBGMVolume}
                isMuted={isMuted}
              />

              {/* SFX Volume */}
              <SmoothSlider
                label="เอฟเฟกต์เสียง (SFX)"
                icon={Volume2}
                volume={sfxVolume}
                onChange={setSFXVolume}
                isMuted={isMuted}
                onCommit={() => {
                  if (playSFX) playSFX('flip');
                }}
              />

              {/* Close Button at bottom */}
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  setIsSettingsOpen(false);
                }}
                className="settings-close-button w-full py-3.5 mt-2 bg-[#100606] text-[#ef4444] font-black text-xs tracking-[0.2em] border border-red-900/40 rounded-xl cursor-pointer uppercase shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUIT CONFIRMATION MODAL ── */}
      {isQuitConfirmOpen && (
        <div 
          onClick={() => {
            if (playSFX) playSFX('toggle');
            setIsQuitConfirmOpen(false);
          }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-[2px] p-4 font-thai cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c0c10] border border-[rgba(220,50,50,0.5)] p-6 max-w-sm w-full text-center relative shadow-2xl shadow-black/95 rounded-lg cursor-default"
            style={{ clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)' }}
          >
            <h3 className="text-base font-black text-bone mb-3.5 uppercase tracking-wider">
              ☠ ยืนยันการออกจากเกม?
            </h3>
            <p className="text-xs text-bone/70 mb-6 leading-relaxed">
              การออกจากพิธีกรรมจะทำให้ความคืบหน้าของรอบนี้สูญหาย คุณยืนยันที่จะออกจากเกมหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  setIsQuitConfirmOpen(false);
                  handleQuitLobby();
                }}
                className="flex-1 py-3 bg-[#1a0808] text-[#ef4444] font-black text-xs tracking-wider border border-[rgba(153,27,27,0.8)] hover:bg-[#250a0a] transition-colors cursor-pointer uppercase"
                style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
              >
                    ออกจากเกม
              </button>
              <button
                onClick={() => {
                  if (playSFX) playSFX('flip');
                  setIsQuitConfirmOpen(false);
                }}
                className="py-3 px-5 bg-transparent text-bone/60 border border-[rgba(127,29,29,0.18)] hover:border-[rgba(127,29,29,0.45)] hover:text-bone font-black text-xs transition-colors cursor-pointer"
                style={{ clipPath: 'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)' }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
