import { useReducer, useEffect, useRef } from 'react';
import { createDeck, shuffle, sortHand, calculateJokerAssignedValue, getAIDecision } from '../utils/gameLogic';

const LOCAL_STORAGE_KEY = 'davinci_game_state_v1';

const INITIAL_STATE = {
  gamePhase: 'LOBBY', // LOBBY, DEAL, JOKER_SETUP, TURN_BANNER, DRAW, GUESS, DECIDE, JOKER_PLACEMENT, GAME_OVER
  deck: [],
  removedTiles: [],
  playerHand: [],
  aiHand: [],
  activePlayer: 'player', // 'player' | 'ai'
  drawnTile: null, // Card currently drawn, placed in separate slot
  lastGuess: null, // { targetIndex, guess, isCorrect }
  consecutiveCorrectGuesses: 0,
  turnCount: 0,
  timeLeft: 20, // 20s turn timer
  gameLogs: [],
  scores: { player: 0, ai: 0 },
  aiDifficulty: 'medium',
  cardRemovalCount: 2,
  // Animation states for dealing
  dealingIndex: 0, 
  jokerSetupIndex: 0, // tracking which Joker is being set up
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'SET_LOBBY_CONFIG':
      return {
        ...state,
        aiDifficulty: action.payload.aiDifficulty,
        cardRemovalCount: action.payload.cardRemovalCount,
      };

    case 'START_GAME': {
      const fullDeck = createDeck();
      const shuffledDeck = shuffle(fullDeck);
      
      // Remove cards config
      const removed = shuffledDeck.splice(0, state.cardRemovalCount);
      
      return {
        ...state,
        gamePhase: 'DEAL',
        deck: shuffledDeck,
        removedTiles: removed,
        playerHand: [],
        aiHand: [],
        drawnTile: null,
        lastGuess: null,
        consecutiveCorrectGuesses: 0,
        turnCount: 0,
        timeLeft: 20,
        gameLogs: ['เริ่มเกมใหม่! กำลังแจกการ์ด...'],
        dealingIndex: 0,
        jokerSetupIndex: 0,
      };
    }

    case 'DEAL_CARD': {
      const { deck, playerHand, aiHand, dealingIndex } = state;
      if (deck.length === 0) return state;

      const newDeck = [...deck];
      const card = newDeck.pop();
      const newPlayerHand = [...playerHand];
      const newAiHand = [...aiHand];

      let logMessage = '';
      if (dealingIndex % 2 === 0) {
        newPlayerHand.push(card);
        logMessage = `แจกการ์ดสี${card.color === 'black' ? 'ดำ' : 'ขาว'} ให้ผู้เล่น`;
      } else {
        newAiHand.push(card);
        logMessage = `แจกการ์ดสี${card.color === 'black' ? 'ดำ' : 'ขาว'} ให้ AI`;
      }

      return {
        ...state,
        deck: newDeck,
        playerHand: newPlayerHand,
        aiHand: newAiHand,
        dealingIndex: dealingIndex + 1,
        gameLogs: [logMessage, ...state.gameLogs],
      };
    }

    case 'CHECK_JOKERS_POST_DEAL': {
      // Sort hands
      const sortedPlayer = sortHand(state.playerHand);
      const sortedAi = sortHand(state.aiHand);

      // AI places its Jokers automatically
      const finalAiHand = sortedAi.map(tile => {
        if (tile.value === -1 && tile.assignedValue === -1) {
          // Place AI Joker in a random slot or middle slot
          // We can set its assignedValue to some default value
          return { ...tile, assignedValue: 5.5 }; 
        }
        return tile;
      });
      const finalSortedAi = sortHand(finalAiHand);

      // Check if Player has any Jokers that need manual positioning
      const playerJokersToPlace = sortedPlayer.filter(tile => tile.value === -1 && tile.assignedValue === -1);

      if (playerJokersToPlace.length > 0) {
        return {
          ...state,
          playerHand: sortedPlayer,
          aiHand: finalSortedAi,
          gamePhase: 'JOKER_SETUP',
          jokerSetupIndex: 0,
          gameLogs: ['กรุณาเลือกตำแหน่งวางการ์ด Joker ของคุณ', ...state.gameLogs],
        };
      }

      // If no Jokers to place, proceed directly to turn banner
      return {
        ...state,
        playerHand: sortedPlayer,
        aiHand: finalSortedAi,
        gamePhase: 'TURN_BANNER',
        activePlayer: 'player',
        timeLeft: 20,
      };
    }

    case 'PLACE_JOKER': {
      const { playerHand, aiHand, activePlayer, gamePhase, jokerSetupIndex, drawnTile } = state;
      const { tileId, insertIndex } = action.payload;

      let newPlayerHand = [...playerHand];
      let newAiHand = [...aiHand];

      if (activePlayer === 'player' || gamePhase === 'JOKER_SETUP') {
        // Find if the Joker is in the hand, or if it is the drawnTile
        let jokerTile = newPlayerHand.find(t => t.id === tileId);
        
        if (!jokerTile && drawnTile && drawnTile.id === tileId) {
          jokerTile = drawnTile;
        }

        if (!jokerTile) return state;

        // Temporarily remove Joker from hand to calculate bounds (only if it was already in the hand)
        const otherCards = newPlayerHand.filter(t => t.id !== tileId);
        const newAssignedValue = calculateJokerAssignedValue(otherCards, insertIndex);
        
        // Update Joker and place back
        const updatedJoker = { ...jokerTile, assignedValue: newAssignedValue };
        newPlayerHand = [...otherCards];
        newPlayerHand.splice(insertIndex, 0, updatedJoker);
        newPlayerHand = sortHand(newPlayerHand);

        const logs = [`คุณวาง Joker ไว้ที่ตำแหน่งที่ ${insertIndex + 1}`, ...state.gameLogs];

        if (gamePhase === 'JOKER_SETUP') {
          // Check if there are more Jokers to place
          const remainingJokers = newPlayerHand.filter(tile => tile.value === -1 && tile.assignedValue === -1);
          if (remainingJokers.length > 0) {
            return {
              ...state,
              playerHand: newPlayerHand,
              jokerSetupIndex: jokerSetupIndex + 1,
              gameLogs: logs,
            };
          } else {
            return {
              ...state,
              playerHand: newPlayerHand,
              gamePhase: 'TURN_BANNER',
              activePlayer: 'player',
              timeLeft: 20,
              gameLogs: ['การจัดทัพเสร็จสิ้น! เริ่มเทิร์นของคุณ', ...logs],
            };
          }
        } else {
          // This was placing a drawn Joker
          return {
            ...state,
            playerHand: newPlayerHand,
            drawnTile: null,
            gamePhase: 'TURN_BANNER',
            activePlayer: activePlayer === 'player' ? 'ai' : 'player',
            timeLeft: 20,
            gameLogs: logs,
          };
        }
      }

      return state;
    }

    case 'TRANSITION_TO_DRAW': {
      const { deck, activePlayer } = state;
      if (deck.length === 0) {
        // Deck empty: skip to guess phase
        return {
          ...state,
          gamePhase: 'GUESS',
          drawnTile: null,
          timeLeft: 20,
          lastGuess: null,
          gameLogs: [`กองจั่วหมดแล้ว! ข้ามการจั่ว ไปยังขั้นตอนทายการ์ดทันที`, ...state.gameLogs],
        };
      }

      const newDeck = [...deck];
      const drawn = newDeck.pop();
      const logs = [
        `${activePlayer === 'player' ? 'คุณ' : 'AI'} ได้จั่วการ์ดใหม่เข้าสู่สนาม`,
        ...state.gameLogs
      ];

      return {
        ...state,
        deck: newDeck,
        drawnTile: drawn,
        gamePhase: 'GUESS',
        timeLeft: 20,
        lastGuess: null,
        gameLogs: logs,
      };
    }

    case 'CONTINUE_GUESSING':
      return {
        ...state,
        gamePhase: 'GUESS',
        timeLeft: 20,
      };

    case 'GUESS_TILE': {
      const { targetIndex, guessedValue } = action.payload;
      const { playerHand, aiHand, activePlayer, drawnTile, consecutiveCorrectGuesses, timeLeft } = state;
      
      const targetHand = activePlayer === 'player' ? aiHand : playerHand;
      const targetTile = targetHand[targetIndex];
      const actualValue = targetTile.value === -1 ? 'Joker' : targetTile.value;
      
      const isCorrect = guessedValue === actualValue;
      let newPlayerHand = [...playerHand];
      let newAiHand = [...aiHand];
      let newDrawnTile = drawnTile ? { ...drawnTile } : null;
      let scoreChange = 0;
      let comboBonus = 0;

      const logs = [];

      if (isCorrect) {
        // Correct Guess: Flip target card
        if (activePlayer === 'player') {
          newAiHand[targetIndex] = { ...targetTile, isRevealed: true };
          
          // Calculate score: base points + speed bonus + combo bonus
          // Base score 10
          // Speed bonus: up to 10 points (timeLeft / 2)
          // Combo bonus: 5 points * consecutiveCorrectGuesses
          const base = 10;
          const speedVal = Math.max(0, Math.floor(timeLeft / 2));
          comboBonus = 5 * consecutiveCorrectGuesses;
          scoreChange = base + speedVal + comboBonus;
          
          logs.push(`คุณทายถูก! การ์ดที่ตำแหน่ง ${targetIndex + 1} ของ AI คือ ${actualValue === 'Joker' ? '★' : actualValue} (+${scoreChange} คะแนน)`);
        } else {
          newPlayerHand[targetIndex] = { ...targetTile, isRevealed: true };
          logs.push(`AI ทายถูก! การ์ดที่ตำแหน่ง ${targetIndex + 1} ของคุณคือ ${actualValue === 'Joker' ? '★' : actualValue}`);
        }

        const newScores = {
          ...state.scores,
          player: activePlayer === 'player' ? state.scores.player + scoreChange : state.scores.player,
          ai: activePlayer === 'ai' ? state.scores.ai + 10 : state.scores.ai, // simple AI score increment
        };

        // Check for Win condition
        const opponentHand = activePlayer === 'player' ? newAiHand : newPlayerHand;
        const allRevealed = opponentHand.every(tile => tile.isRevealed);

        if (allRevealed) {
          // Active player wins!
          const winBonus = 30; // win bonus points
          const finalScores = {
            ...newScores,
            player: activePlayer === 'player' ? newScores.player + winBonus : newScores.player,
          };
          logs.unshift(`${activePlayer === 'player' ? 'คุณชนะการแข่งรอบนี้!' : 'AI ชนะการแข่งรอบนี้!'}`);
          
          return {
            ...state,
            playerHand: newPlayerHand,
            aiHand: newAiHand,
            scores: finalScores,
            gamePhase: 'GAME_OVER',
            gameLogs: [...logs, ...state.gameLogs],
          };
        }

        return {
          ...state,
          playerHand: newPlayerHand,
          aiHand: newAiHand,
          scores: newScores,
          gamePhase: 'DECIDE',
          consecutiveCorrectGuesses: consecutiveCorrectGuesses + 1,
          lastGuess: { targetIndex, guess: guessedValue, isCorrect: true },
          gameLogs: [...logs, ...state.gameLogs],
        };
      } else {
        // Wrong Guess:
        if (activePlayer === 'player') {
          logs.push(`คุณทายผิด! การ์ดตำแหน่งที่ ${targetIndex + 1} ของ AI ไม่ใช่ ${guessedValue === 'Joker' ? '★' : guessedValue}`);
        } else {
          logs.push(`AI ทายผิด! การ์ดตำแหน่งที่ ${targetIndex + 1} ของคุณไม่ใช่ ${guessedValue === 'Joker' ? '★' : guessedValue}`);
        }

        if (drawnTile) {
          // Reveal the drawn tile to everyone
          const revealedDrawn = { ...drawnTile, isRevealed: true };
          logs.push(`${activePlayer === 'player' ? 'คุณ' : 'AI'} ต้องเปิดเผยการ์ดที่จั่วได้: ${revealedDrawn.value === -1 ? '★ (Joker)' : revealedDrawn.value}`);
          
          if (revealedDrawn.value === -1) {
            // Draw tile is a Joker, trigger Joker placement phase
            return {
              ...state,
              drawnTile: revealedDrawn,
              gamePhase: 'JOKER_PLACEMENT',
              lastGuess: { targetIndex, guess: guessedValue, isCorrect: false },
              gameLogs: [...logs, ...state.gameLogs],
              timeLeft: 5,
            };
          } else {
            // Automatically insert normal tile in sorted order
            if (activePlayer === 'player') {
              newPlayerHand.push(revealedDrawn);
              newPlayerHand = sortHand(newPlayerHand);
            } else {
              newAiHand.push(revealedDrawn);
              newAiHand = sortHand(newAiHand);
            }

            return {
              ...state,
              playerHand: newPlayerHand,
              aiHand: newAiHand,
              drawnTile: null,
              gamePhase: 'TURN_BANNER',
              activePlayer: activePlayer === 'player' ? 'ai' : 'player',
              consecutiveCorrectGuesses: 0,
              lastGuess: { targetIndex, guess: guessedValue, isCorrect: false },
              gameLogs: [...logs, ...state.gameLogs],
              timeLeft: 20,
            };
          }
        } else {
          // Penalty Reveal: Deck is empty, must reveal one of their own hidden cards
          if (activePlayer === 'player') {
            // Player must manually select a card to reveal. We transition to a PENALTY state
            logs.push(`บทลงโทษกองจั่วหมด! กรุณาเลือกการ์ดใบใดใบหนึ่งของคุณเพื่อเปิดเผยเพื่อลงโทษ`);
            return {
              ...state,
              gamePhase: 'PENALTY_REVEAL',
              consecutiveCorrectGuesses: 0,
              lastGuess: { targetIndex, guess: guessedValue, isCorrect: false },
              gameLogs: [...logs, ...state.gameLogs],
            };
          } else {
            // AI reveals a random hidden card as penalty
            const aiHiddenIndices = newAiHand
              .map((t, idx) => (t.isRevealed ? -1 : idx))
              .filter(idx => idx !== -1);
            
            if (aiHiddenIndices.length > 0) {
              const penaltyIdx = aiHiddenIndices[Math.floor(Math.random() * aiHiddenIndices.length)];
              newAiHand[penaltyIdx] = { ...newAiHand[penaltyIdx], isRevealed: true };
              logs.push(`บทลงโทษกองจั่วหมด! AI เปิดเผยการ์ด ${newAiHand[penaltyIdx].value === -1 ? '★ (Joker)' : newAiHand[penaltyIdx].value} ของตนเอง`);
            }

            // Check if AI penalty causes Player to win
            const allAiRevealed = newAiHand.every(tile => tile.isRevealed);
            if (allAiRevealed) {
              logs.unshift(`คุณชนะการแข่งรอบนี้! (AI การ์ดหมดตัวจากบทลงโทษ)`);
              return {
                ...state,
                playerHand: newPlayerHand,
                aiHand: newAiHand,
                gamePhase: 'GAME_OVER',
                gameLogs: [...logs, ...state.gameLogs],
              };
            }

            return {
              ...state,
              playerHand: newPlayerHand,
              aiHand: newAiHand,
              gamePhase: 'TURN_BANNER',
              activePlayer: 'player',
              consecutiveCorrectGuesses: 0,
              lastGuess: { targetIndex, guess: guessedValue, isCorrect: false },
              gameLogs: [...logs, ...state.gameLogs],
              timeLeft: 20,
            };
          }
        }
      }
    }

    case 'PENALTY_SELECT_PLAYER_CARD': {
      const { cardIndex } = action.payload;
      const { playerHand, aiHand, activePlayer } = state;
      let newPlayerHand = [...playerHand];
      const logs = [...state.gameLogs];

      newPlayerHand[cardIndex] = { ...newPlayerHand[cardIndex], isRevealed: true };
      logs.push(`คุณเปิดเผยการ์ด ${newPlayerHand[cardIndex].value === -1 ? '★ (Joker)' : newPlayerHand[cardIndex].value} เพื่อรับบทลงโทษ`);

      // Check if player's penalty causes game over
      const allPlayerRevealed = newPlayerHand.every(tile => tile.isRevealed);
      if (allPlayerRevealed) {
        logs.unshift(`AI ชนะการแข่งรอบนี้! (คุณการ์ดหมดตัวจากบทลงโทษ)`);
        return {
          ...state,
          playerHand: newPlayerHand,
          gamePhase: 'GAME_OVER',
          gameLogs: logs,
        };
      }

      return {
        ...state,
        playerHand: newPlayerHand,
        gamePhase: 'TURN_BANNER',
        activePlayer: 'ai',
        timeLeft: 20,
        gameLogs: logs,
      };
    }

    case 'PASS_TURN': {
      const { playerHand, aiHand, activePlayer, drawnTile } = state;
      let newPlayerHand = [...playerHand];
      let newAiHand = [...aiHand];
      const logs = [...state.gameLogs];

      if (drawnTile) {
        // Keep card hidden (face-down) and insert into hand
        const hiddenDrawn = { ...drawnTile, isRevealed: false };
        
        if (activePlayer === 'player') {
          if (hiddenDrawn.value === -1) {
            // Player drew Joker and is passing. Transition to JOKER_PLACEMENT phase
            return {
              ...state,
              gamePhase: 'JOKER_PLACEMENT',
              consecutiveCorrectGuesses: 0,
              timeLeft: 5,
            };
          } else {
            newPlayerHand.push(hiddenDrawn);
            newPlayerHand = sortHand(newPlayerHand);
            logs.push(`คุณจบคอมโบและผ่านเทิร์น! เสียบการ์ดที่จั่วแบบคว่ำหน้าลงกอง`);
          }
        } else {
          // AI pass logic
          if (hiddenDrawn.value === -1) {
            // AI places Joker at default middle or random index
            const newAssigned = calculateJokerAssignedValue(newAiHand, Math.floor(newAiHand.length / 2));
            const jokerWithAssigned = { ...hiddenDrawn, assignedValue: newAssigned };
            newAiHand.push(jokerWithAssigned);
            newAiHand = sortHand(newAiHand);
            logs.push(`AI จบคอมโบและผ่านเทิร์น! เสียบการ์ดที่จั่วแบบคว่ำหน้าลงกอง`);
          } else {
            newAiHand.push(hiddenDrawn);
            newAiHand = sortHand(newAiHand);
            logs.push(`AI จบคอมโบและผ่านเทิร์น! เสียบการ์ดที่จั่วแบบคว่ำหน้าลงกอง`);
          }
        }
      }

      return {
        ...state,
        playerHand: newPlayerHand,
        aiHand: newAiHand,
        drawnTile: null,
        gamePhase: 'TURN_BANNER',
        activePlayer: activePlayer === 'player' ? 'ai' : 'player',
        consecutiveCorrectGuesses: 0,
        timeLeft: 20,
        gameLogs: logs,
      };
    }

    case 'TIMER_TICK': {
      if (state.gamePhase !== 'GUESS' && state.gamePhase !== 'DECIDE' && state.gamePhase !== 'JOKER_PLACEMENT') return state;
      
      const newTime = state.timeLeft - 1;
      
      if (newTime <= 0) {
        if (state.gamePhase === 'JOKER_PLACEMENT') {
          // Joker placement time expired: auto-place Joker in a random slot!
          const { playerHand, activePlayer, drawnTile } = state;
          if (activePlayer === 'player') {
            const jokerToPlace = playerHand.find(tile => tile.value === -1 && tile.assignedValue === -1) || drawnTile;
            if (jokerToPlace) {
              const otherCards = playerHand.filter(t => t.id !== jokerToPlace.id);
              const randomInsertIndex = Math.floor(Math.random() * (otherCards.length + 1));
              return gameReducer(
                { ...state, timeLeft: 0 },
                { type: 'PLACE_JOKER', payload: { tileId: jokerToPlace.id, insertIndex: randomInsertIndex } }
              );
            }
          }
        }

        // Time is up! Treat as a WRONG GUESS penalty if in guess phase, or PASS if in decide phase
        const logs = [`หมดเวลาเทิร์นของ${state.activePlayer === 'player' ? 'คุณ' : 'AI'}!`, ...state.gameLogs];
        
        if (state.gamePhase === 'GUESS') {
          // Force wrong guess on a random card with random value to trigger penalty
          const targetIndex = state.activePlayer === 'player' 
            ? state.aiHand.findIndex(t => !t.isRevealed)
            : state.playerHand.findIndex(t => !t.isRevealed);
          
          if (targetIndex !== -1) {
            // Trigger wrong guess penalty
            return gameReducer(
              { ...state, timeLeft: 0, gameLogs: logs },
              { type: 'GUESS_TILE', payload: { targetIndex, guessedValue: -99 } } // invalid guess forces fail
            );
          }
        } else if (state.gamePhase === 'DECIDE') {
          // Deciding phase, force pass
          return gameReducer(
            { ...state, timeLeft: 0, gameLogs: logs },
            { type: 'PASS_TURN' }
          );
        }
      }

      return {
        ...state,
        timeLeft: newTime,
      };
    }

    case 'AI_PLACE_JOKER': {
      // AI automatically decides where to place its Joker
      const { aiHand, drawnTile } = state;
      if (!drawnTile || drawnTile.value !== -1) return state;

      let newAiHand = [...aiHand];
      // Place it randomly or at the average index
      const insertIndex = Math.floor(Math.random() * (newAiHand.length + 1));
      const newAssignedValue = calculateJokerAssignedValue(newAiHand, insertIndex);

      const placedJoker = { ...drawnTile, assignedValue: newAssignedValue };
      newAiHand.splice(insertIndex, 0, placedJoker);
      newAiHand = sortHand(newAiHand);

      const logs = [`AI เสียบการ์ด Joker ลงที่กระดาน`, ...state.gameLogs];

      return {
        ...state,
        aiHand: newAiHand,
        drawnTile: null,
        gamePhase: 'TURN_BANNER',
        activePlayer: 'player', // transition back to Player turn
        consecutiveCorrectGuesses: 0,
        timeLeft: 20,
        gameLogs: logs,
      };
    }

    case 'RESET_STATS':
      return {
        ...state,
        scores: { player: 0, ai: 0 },
      };

    case 'QUIT_TO_LOBBY':
      return {
        ...state,
        gamePhase: 'LOBBY',
        deck: [],
        playerHand: [],
        aiHand: [],
        drawnTile: null,
        lastGuess: null,
      };

    default:
      return state;
  }
}

export const useGameState = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (initial) => {
    // Attempt loading from localStorage on initialization
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If mid-game, resume cleanly.
        return { ...initial, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load game state from localStorage', e);
    }
    return initial;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      // We don't want to save transient timers or active ticks if we reload,
      // but keeping basic structure is key.
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  return [state, dispatch];
};
