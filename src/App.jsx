import React, { useEffect, useRef } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import GameHUD from './components/GameHUD';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { getAIDecision, calculateCandidatesForHand } from './utils/gameLogic';

export default function App() {
  const [state, dispatch] = useGameState();
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
    timeLeft,
    gameLogs,
    scores,
    aiDifficulty,
    cardRemovalCount,
    dealingIndex,
    jokerSetupIndex,
  } = state;

  const {
    isMuted,
    toggleMute,
    playBGM,
    stopBGM,
    playSFX,
  } = useAudio();

  // Refs to track state transitions for audio triggers
  const prevPhase = useRef(gamePhase);
  const prevActivePlayer = useRef(activePlayer);
  const prevLogsCount = useRef(gameLogs.length);

  // 1. Manage Audio effects on phase and log updates
  useEffect(() => {
    // Check if new log arrived (indicates game event)
    if (gameLogs.length > prevLogsCount.current) {
      const latestLog = gameLogs[0];
      
      if (latestLog.includes('ทายถูก!') || latestLog.includes('เปิดเผยการ์ด')) {
        playSFX('correct');
      } else if (latestLog.includes('ทายผิด!') || latestLog.includes('บทลงโทษ')) {
        playSFX('wrong');
      } else if (latestLog.includes('จั่วได้การ์ด') || latestLog.includes('แจกการ์ด')) {
        playSFX('draw');
      } else if (latestLog.includes('จัดทัพเสร็จสิ้น') || latestLog.includes('จบคอมโบ')) {
        playSFX('flip');
      }
      
      prevLogsCount.current = gameLogs.length;
    }

    if (gamePhase !== prevPhase.current) {
      if (gamePhase === 'GAME_OVER') {
        playSFX('victory');
      }
      prevPhase.current = gamePhase;
    }
  }, [gamePhase, gameLogs, playSFX]);

  // 2. Turn Countdown Timer ticking
  useEffect(() => {
    let interval = null;
    if (gamePhase === 'GUESS' || gamePhase === 'DECIDE' || (gamePhase === 'JOKER_PLACEMENT' && activePlayer === 'player')) {
      interval = setInterval(() => {
        dispatch({ type: 'TIMER_TICK' });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gamePhase, activePlayer]);

  // 3. Staggered Dealing animation (one by one with 0.5s delay)
  useEffect(() => {
    if (gamePhase !== 'DEAL') return;

    if (dealingIndex < 8) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DEAL_CARD' });
      }, 500);
      return () => clearTimeout(timer);
    } else if (dealingIndex === 8) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CHECK_JOKERS_POST_DEAL' });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, dealingIndex]);

  // 4. Auto turn transition banners (1.5s delay)
  useEffect(() => {
    if (gamePhase !== 'TURN_BANNER') return;

    const timer = setTimeout(() => {
      dispatch({ type: 'TRANSITION_TO_DRAW' });
    }, 1500);

    return () => clearTimeout(timer);
  }, [gamePhase]);

  // 5. AI Turn Automation State Machine
  useEffect(() => {
    if (activePlayer !== 'ai' || gamePhase === 'LOBBY' || gamePhase === 'DEAL' || gamePhase === 'GAME_OVER') return;

    // AI is thinking banner transition
    if (gamePhase === 'TURN_BANNER') {
      // handled by Turn banner timer
      return;
    }

    // AI Guess Card Phase
    if (gamePhase === 'GUESS') {
      const timer = setTimeout(() => {
        const decision = getAIDecision(aiDifficulty, playerHand, aiHand);
        if (decision) {
          dispatch({
            type: 'GUESS_TILE',
            payload: {
              targetIndex: decision.targetIndex,
              guessedValue: decision.guess,
            },
          });
        } else {
          // Fallback if no targets (should not happen)
          dispatch({ type: 'PASS_TURN' });
        }
      }, 2200); // realistic think time
      return () => clearTimeout(timer);
    }

    // AI Decide Phase (Continue or Pass)
    if (gamePhase === 'DECIDE') {
      const timer = setTimeout(() => {
        // AI Decides:
        // Easy AI: always passes
        if (aiDifficulty === 'easy') {
          dispatch({ type: 'PASS_TURN' });
          return;
        }

        // Medium AI: 50% chance to continue (max 2 consecutive)
        if (aiDifficulty === 'medium') {
          const shouldPass = Math.random() > 0.5 || consecutiveCorrectGuesses >= 2;
          if (shouldPass) {
            dispatch({ type: 'PASS_TURN' });
          } else {
            dispatch({ type: 'CONTINUE_GUESSING' });
          }
          return;
        }

        // Hard AI: Checks if any 100% certain cards remain in playerHand.
        // If yes, always continue. If no, 30% chance to continue (max 3 consecutive), else pass.
        if (aiDifficulty === 'hard') {
          const candidates = calculateCandidatesForHand(playerHand, aiHand);
          const hiddenIndices = playerHand
            .map((t, idx) => (t.isRevealed ? -1 : idx))
            .filter(idx => idx !== -1);
          
          const hasCertainCard = hiddenIndices.some(idx => candidates[idx].length === 1);

          if (hasCertainCard) {
            // Continues guessing since there is a 100% sure card
            dispatch({ type: 'CONTINUE_GUESSING' });
          } else {
            const shouldPass = Math.random() > 0.3 || consecutiveCorrectGuesses >= 3;
            if (shouldPass) {
              dispatch({ type: 'PASS_TURN' });
            } else {
              dispatch({ type: 'CONTINUE_GUESSING' });
            }
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    // AI Joker Placement Phase
    if (gamePhase === 'JOKER_PLACEMENT') {
      const timer = setTimeout(() => {
        dispatch({ type: 'AI_PLACE_JOKER' });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activePlayer, gamePhase, aiDifficulty, playerHand, aiHand, consecutiveCorrectGuesses]);

  // Handler functions for user moves
  const handleConfigChange = (config) => {
    dispatch({ type: 'SET_LOBBY_CONFIG', payload: config });
  };

  const handleStartGame = () => {
    playBGM();
    dispatch({ type: 'START_GAME' });
  };

  const handleGuess = (targetIndex, value) => {
    dispatch({
      type: 'GUESS_TILE',
      payload: { targetIndex, guessedValue: value },
    });
  };

  const handleContinue = () => {
    dispatch({ type: 'CONTINUE_GUESSING' });
  };

  const handlePass = () => {
    dispatch({ type: 'PASS_TURN' });
  };

  const handleJokerPlace = (tileId, insertIndex) => {
    dispatch({
      type: 'PLACE_JOKER',
      payload: { tileId, insertIndex },
    });
  };

  const handlePenaltySelect = (cardIndex) => {
    dispatch({
      type: 'PENALTY_SELECT_PLAYER_CARD',
      payload: { cardIndex },
    });
  };

  const handleResetScores = () => {
    dispatch({ type: 'RESET_STATS' });
  };

  const handleQuitLobby = () => {
    stopBGM();
    dispatch({ type: 'QUIT_TO_LOBBY' });
  };

  const handleRestartGame = () => {
    playBGM();
    dispatch({ type: 'START_GAME' });
  };

  // Render Lobby screen
  if (gamePhase === 'LOBBY') {
    return (
      <SetupScreen
        aiDifficulty={aiDifficulty}
        cardRemovalCount={cardRemovalCount}
        onConfigChange={handleConfigChange}
        onStartGame={handleStartGame}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        scores={scores}
        onResetScores={handleResetScores}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-radial-table relative flex flex-row gap-3 p-3 font-thai select-none">

      {/* ── LEFT COLUMN: HUD + Board ── */}
      <div className="flex-1 h-full flex flex-col gap-2.5 min-w-0">

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
        />

        {/* Turn Banner Overlay */}
        {gamePhase === 'TURN_BANNER' && (
          <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto animate-turn-banner">
              <div className="bg-charcoal/92 border-y-[3px] border-gold/80 py-5 px-16 text-center shadow-2xl shadow-black/70">
                <h1 className="text-3xl font-bold text-gold tracking-[0.18em] uppercase leading-none">
                  {activePlayer === 'player' ? 'ตาของคุณ' : 'ตาของ AI'}
                </h1>
                <p className="text-[11px] font-semibold text-ivory/45 uppercase tracking-[0.15em] mt-2 leading-none">
                  {activePlayer === 'player' ? 'กรุณาดำเนินการ' : 'กำลังประเมินสถานการณ์...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Board Arena */}
        <div className="flex-1 min-h-0 flex flex-col">
          <GameBoard
            playerHand={playerHand}
            aiHand={aiHand}
            deck={deck}
            drawnTile={drawnTile}
            activePlayer={activePlayer}
            gamePhase={gamePhase}
            lastGuess={state.lastGuess}
            onGuess={handleGuess}
            onContinue={handleContinue}
            onPass={handlePass}
            onPenaltySelect={handlePenaltySelect}
            onJokerPlace={handleJokerPlace}
          />
        </div>
      </div>

      {/* ── RIGHT SIDEBAR: Game Log ── */}
      <div className="w-72 h-full flex flex-col bg-charcoal-dark/90 border border-gold/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
        {/* Sidebar header */}
        <div className="px-4 py-3 border-b border-gold/15 flex items-center gap-2 shrink-0">
          <div className="w-1.5 h-4 bg-gold/70 rounded-full" />
          <h3 className="text-[10px] font-bold text-gold/70 uppercase tracking-[0.2em] leading-none">
            บันทึกการแข่งขัน
          </h3>
        </div>

        {/* Log entries */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-1.5">
          {gameLogs.length === 0 && (
            <p className="text-[10px] text-ivory/25 text-center py-10 leading-relaxed">
              ยังไม่มีรายการ
            </p>
          )}
          {gameLogs.map((log, index) => {
            let accent = 'border-gold/8 text-ivory/65';
            if (log.includes('ทายถูก'))  accent = 'border-emerald-600/30 text-emerald-300/90 font-semibold';
            else if (log.includes('ทายผิด') || log.includes('บทลงโทษ')) accent = 'border-red-600/30 text-red-300/90 font-semibold';
            else if (log.includes('ชนะ')) accent = 'border-gold/40 text-gold font-bold';

            return (
              <div
                key={index}
                className={`text-[10px] leading-relaxed py-1.5 px-2.5 rounded-lg bg-felt-dark/30 border ${accent}`}
              >
                {log}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GAME OVER MODAL ── */}
      {gamePhase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[3px] p-4 font-thai">
          <div className="bg-charcoal border border-gold/50 rounded-2xl p-8 max-w-sm w-full text-center relative shadow-2xl shadow-black/90 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/70 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/70 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/70 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/70 rounded-br-xl" />

            <p className="text-[9px] font-bold text-gold/45 uppercase tracking-[0.25em] mb-2">Davinci Code</p>
            <h2 className="text-2xl font-bold text-gold tracking-wider uppercase mb-1 leading-tight">
              {playerHand.every(t => t.isRevealed) ? 'AI ชนะ!' : 'คุณชนะ!'}
            </h2>
            <p className="text-[11px] font-semibold text-ivory/45 uppercase tracking-widest mb-6 leading-none">
              ผลการแข่งขัน
            </p>

            <div className="bg-felt-dark/50 border border-gold/15 rounded-xl p-4 mb-6 space-y-3 text-left text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ivory/50">คะแนนรอบนี้</span>
                <span className="font-bold text-gold tabular-nums">{playerHand.every(t => t.isRevealed) ? 0 : 30} คะแนน</span>
              </div>
              <div className="h-px bg-gold/12" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ivory/50">คะแนนสะสม</span>
                <span className="font-bold text-gold tabular-nums">คุณ {scores.player} — AI {scores.ai}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleRestartGame}
                className="w-full py-3.5 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-xs tracking-widest rounded-xl border border-gold-light/60 transition-all duration-250 hover:-translate-y-0.5 shadow-md cursor-pointer uppercase"
              >
                เล่นอีกครั้ง
              </button>
              <button
                onClick={handleQuitLobby}
                className="w-full py-3 bg-transparent text-gold/70 border border-gold/20 hover:border-gold/50 hover:text-gold font-semibold text-xs tracking-widest rounded-xl transition-all duration-200 cursor-pointer uppercase"
              >
                ออกไปหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
