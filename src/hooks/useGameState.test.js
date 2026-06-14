import { describe, expect, it } from 'vitest';
import { INITIAL_STATE, gameReducer } from './useGameState';

describe('gameReducer feedback flow', () => {
  it('keeps a wrong-guess result available until feedback is acknowledged', () => {
    const state = {
      ...INITIAL_STATE,
      gamePhase: 'GUESS',
      activePlayer: 'player',
      aiHand: [{ id: 'a', value: 5, color: 'black', isRevealed: false }],
      playerHand: [{ id: 'p', value: 1, color: 'white', isRevealed: false }],
      drawnTile: { id: 'j', value: -1, color: 'black', isRevealed: false },
    };

    const next = gameReducer(state, {
      type: 'GUESS_TILE',
      payload: { targetIndex: 0, guessedValue: 1, guessedColor: 'white' },
    });

    expect(next.gamePhase).toBe('FEEDBACK');
    expect(next.pendingPhase?.phase).toBe('JOKER_PLACEMENT');
  });
});
