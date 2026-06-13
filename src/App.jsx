import React, { useEffect, useRef } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import GameHUD from './components/GameHUD';
import { Scroll } from 'lucide-react';
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
    <div className="h-screen w-screen overflow-hidden bg-radial-table p-4 flex flex-row gap-4 font-thai select-none">
      {/* Left Column: Stats header & Game Board Arena */}
      <div className="flex-1 h-full flex flex-col justify-between gap-3 min-w-0">
        {/* HUD Statistics Header */}
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

        {/* Dynamic 3D Turn Overlay Banner */}
        {gamePhase === 'TURN_BANNER' && (
          <div className="fixed top-0 left-0 w-full h-full z-45 flex items-center justify-center pointer-events-none bg-black/10">
            <div className="bg-charcoal/90 border-y-2 border-gold py-4 px-12 md:py-6 md:px-20 text-center animate-turn-banner shadow-xl pointer-events-auto">
              <h1 className="text-2xl md:text-4xl font-bold font-serif text-gold tracking-widest uppercase">
                {activePlayer === 'player' ? 'ตาของคุณ' : 'ตาของ AI'}
              </h1>
              <p className="text-xs text-ivory/50 font-bold uppercase tracking-wider mt-1">
                {activePlayer === 'player' ? 'กรุณาดำเนินการ' : 'กำลังประเมินสถานการณ์...'}
              </p>
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

      {/* Right Column: Clean, compact, scrollable Game Log Sidebar */}
      <div className="w-80 h-full bg-charcoal/95 border-2 border-gold rounded-2xl p-5 shadow-2xl flex flex-col text-left">
        <div className="flex items-center gap-2 border-b border-gold/25 pb-3 mb-4">
          <Scroll className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-bold text-gold uppercase tracking-widest leading-relaxed">
            บันทึกการแข่งขัน
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
          {gameLogs.map((log, index) => {
            let logTypeClass = 'text-ivory/80';
            if (log.includes('ทายถูก')) logTypeClass = 'text-emerald-400 font-semibold';
            else if (log.includes('ทายผิด') || log.includes('บทลงโทษ')) logTypeClass = 'text-red-400 font-semibold';
            else if (log.includes('ชนะ')) logTypeClass = 'text-gold font-bold';
            
            return (
              <div 
                key={index} 
                className={`text-[11px] leading-relaxed py-2 px-3 rounded bg-felt-dark/40 border border-gold/10 ${logTypeClass}`}
              >
                {log}
              </div>
            );
          })}
          {gameLogs.length === 0 && (
            <div className="text-[11px] text-ivory/40 text-center py-8">
              ยังไม่มีประวัติการแข่งขันในรอบนี้
            </div>
          )}
        </div>
      </div>

      {/* Post-Game Over Modal overlay */}
      {gamePhase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-thai">
          <div className="bg-charcoal border-2 border-gold rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl shadow-black/95">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-xl pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-bold font-serif text-gold tracking-widest uppercase mb-1 leading-normal">
              ผลการแข่งขัน!
            </h2>
            <p className="text-sm font-extrabold text-gold uppercase tracking-widest mb-6 leading-relaxed">
              {playerHand.every(t => t.isRevealed) ? 'AI บอทคือผู้ชนะ!' : 'คุณคือผู้ชนะการแข่งขัน!'}
            </p>

            {/* Hand details */}
            <div className="bg-felt-dark/65 border border-gold/25 rounded-xl p-5 mb-6 space-y-3.5 text-left text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ivory/50 tracking-wider">คะแนนจากการชนะรอบนี้:</span>
                <span className="font-bold text-gold tracking-wider">{playerHand.every(t => t.isRevealed) ? 0 : 30} คะแนน</span>
              </div>
              <div className="h-px bg-gold/15" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ivory/50 tracking-wider">คะแนนรวมสะสมทั้งหมด:</span>
                <span className="font-bold text-gold tracking-wider">คุณ {scores.player} - AI {scores.ai}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleRestartGame}
                className="w-full py-3.5 bg-gold hover:bg-gold-dark text-charcoal-dark font-extrabold text-xs tracking-widest rounded-xl border border-gold-light transition-all duration-300 shadow-md cursor-pointer uppercase"
              >
                เล่นอีกครั้ง (Play Again)
              </button>
              <button
                onClick={handleQuitLobby}
                className="w-full py-3.5 bg-charcoal text-gold border border-gold/30 hover:border-gold font-extrabold text-xs tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer uppercase"
              >
                ออกไปหน้าแรก (Lobby)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
