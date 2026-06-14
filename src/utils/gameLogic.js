/**
 * Ghostvinci game logic and AI decision engine.
 */

// Total 26 tiles: 12 Black (0-11), 12 White (0-11), 1 Black Joker (-1), 1 White Joker (-1)
export const createDeck = () => {
  const deck = [];
  
  // Create Black tiles (0-11)
  for (let i = 0; i <= 11; i++) {
    deck.push({
      id: `black-${i}`,
      color: 'black',
      value: i,
      isRevealed: false,
      assignedValue: i, // default to its value
    });
  }
  // Black Joker
  deck.push({
    id: 'black-joker',
    color: 'black',
    value: -1, // -1 represents Joker
    isRevealed: false,
    assignedValue: -1,
  });

  // Create White tiles (0-11)
  for (let i = 0; i <= 11; i++) {
    deck.push({
      id: `white-${i}`,
      color: 'white',
      value: i,
      isRevealed: false,
      assignedValue: i, // default to its value
    });
  }
  // White Joker
  deck.push({
    id: 'white-joker',
    color: 'white',
    value: -1, // -1 represents Joker
    isRevealed: false,
    assignedValue: -1,
  });

  return deck;
};

// Fisher-Yates Shuffle
export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Sort player hand based on assignedValue and color tie-breaker
// Rules:
// 1. Lower value on left, higher on right
// 2. If values are identical, Black goes to the left of White
export const sortHand = (hand) => {
  return [...hand].sort((a, b) => {
    if (a.assignedValue !== b.assignedValue) {
      return a.assignedValue - b.assignedValue;
    }
    // Color tie-breaker: Black first
    if (a.color === 'black' && b.color === 'white') return -1;
    if (a.color === 'white' && b.color === 'black') return 1;
    return 0;
  });
};

/**
 * Calculates a default sorted position and assignedValue for a Joker in a hand.
 * @param {Array} hand - The current sorted hand (excluding the new Joker)
 * @param {number} insertIndex - The desired index to insert the Joker into (0 to hand.length)
 * @returns {number} The calculated assignedValue for the Joker
 */
export const calculateJokerAssignedValue = (hand, insertIndex) => {
  if (hand.length === 0) {
    return 5.5; // Default middle value if hand is empty
  }

  if (insertIndex === 0) {
    // Insert at the far left
    return hand[0].assignedValue - 0.5;
  }

  if (insertIndex >= hand.length) {
    // Insert at the far right
    return hand[hand.length - 1].assignedValue + 0.5;
  }

  // Insert between two cards
  const prevVal = hand[insertIndex - 1].assignedValue;
  const nextVal = hand[insertIndex].assignedValue;
  return (prevVal + nextVal) / 2;
};

/**
 * Determine the legal candidates (values 0-11 and Joker) for each hidden tile in the player's hand.
 * 
 * @param {Array} playerHand - The player's hand tiles
 * @param {Array} aiHand - The AI's hand tiles (revealed or not)
 * @param {Array} removedTiles - The tiles removed from play (AI doesn't know what they are, treated as unknown)
 * @returns {Array<Array<number|string>>} Array of candidates for each tile index in playerHand
 */
export const calculateCandidatesForHand = (playerHand, aiHand, removedTiles = []) => {
  // 1. Compile all cards that are visible/known to the observer (AI).
  // AI knows all cards in its own hand, plus all revealed cards in the player's hand.
  const knownCards = new Set();
  aiHand.forEach(tile => knownCards.add(tile.id));
  playerHand.forEach(tile => {
    if (tile.isRevealed) {
      knownCards.add(tile.id);
    }
  });

  // 2. Identify the remaining unknown pool of cards (either in deck, player's hand hidden, or removed).
  const fullDeck = createDeck();
  const unknownPool = fullDeck.filter(tile => !knownCards.has(tile.id));

  // 3. For each tile in the player's hand, if it is hidden, find the legal values from the unknown pool.
  return playerHand.map((targetTile, targetIndex) => {
    if (targetTile.isRevealed) {
      // If it is already revealed, there is only 1 candidate (its actual value)
      return [targetTile.value === -1 ? 'Joker' : targetTile.value];
    }

    const candidates = [];
    const colorPool = unknownPool.filter(tile => tile.color === targetTile.color);

    colorPool.forEach(candidateTile => {
      // Joker is always a candidate for a hidden card of matching color
      if (candidateTile.value === -1) {
        if (!candidates.includes('Joker')) {
          candidates.push('Joker');
        }
        return;
      }

      // For normal cards, check if placing its value at targetIndex violates sorting order with
      // any revealed cards in the player's hand.
      let isLegal = true;
      const val = candidateTile.value;

      for (let j = 0; j < playerHand.length; j++) {
        const otherTile = playerHand[j];
        if (j === targetIndex || !otherTile.isRevealed || otherTile.value === -1) {
          // Skip itself, hidden cards, and revealed Jokers (revealed Jokers don't bound sorting numerically in the same way)
          continue;
        }

        const otherVal = otherTile.value;

        if (j < targetIndex) {
          // The other tile is to the LEFT. It must be less than or equal to the candidate.
          if (otherVal > val) {
            isLegal = false;
            break;
          }
          // If values are equal, Black must be on the left.
          // Since otherTile is at j < targetIndex, if they have equal values:
          // it is only legal if otherTile is Black and candidate is White.
          // If otherTile is White and candidate is Black, it is illegal.
          if (otherVal === val && otherTile.color === 'white' && targetTile.color === 'black') {
            isLegal = false;
            break;
          }
        } else {
          // The other tile is to the RIGHT. It must be greater than or equal to the candidate.
          if (otherVal < val) {
            isLegal = false;
            break;
          }
          // If values are equal, Black must be on the left.
          // Since otherTile is at j > targetIndex, if they have equal values:
          // it is only legal if candidate is Black and otherTile is White.
          // If candidate is White and otherTile is Black, it is illegal.
          if (otherVal === val && targetTile.color === 'white' && otherTile.color === 'black') {
            isLegal = false;
            break;
          }
        }
      }

      if (isLegal) {
        if (!candidates.includes(val)) {
          candidates.push(val);
        }
      }
    });

    // Sort candidates numerically, putting 'Joker' at the end or beginning.
    candidates.sort((a, b) => {
      if (a === 'Joker') return 1;
      if (b === 'Joker') return -1;
      return a - b;
    });

    return candidates;
  });
};

/**
 * AI Decision Engine
 * Returns an object containing the targeted card index and the guessed value.
 * 
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {Array} playerHand - The player's hand tiles
 * @param {Array} aiHand - The AI's hand tiles
 * @returns {Object} { targetIndex: number, guess: number|string }
 */
export const getAIDecision = (difficulty, playerHand, aiHand) => {
  // 1. Identify all hidden cards in player's hand
  const hiddenIndices = playerHand
    .map((tile, idx) => (tile.isRevealed ? -1 : idx))
    .filter(idx => idx !== -1);

  if (hiddenIndices.length === 0) return null;

  // Calculate candidates for all player cards
  const allCandidates = calculateCandidatesForHand(playerHand, aiHand);

  // EASY DIFFICULTY: Random target, random guess from pool
  if (difficulty === 'easy') {
    const randomTargetIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    const candidates = allCandidates[randomTargetIndex];
    // If no candidates, fall back to a random number 0-11 or Joker
    const guess = candidates.length > 0 
      ? candidates[Math.floor(Math.random() * candidates.length)] 
      : (Math.random() > 0.1 ? Math.floor(Math.random() * 12) : 'Joker');
      
    return { targetIndex: randomTargetIndex, guess };
  }

  // MEDIUM DIFFICULTY: Targets the tile with the fewest possible candidates.
  // Guesses randomly among those candidates.
  if (difficulty === 'medium') {
    // Find hidden indices sorted by candidate list length (ascending)
    const sortedTargets = [...hiddenIndices].sort((a, b) => {
      return allCandidates[a].length - allCandidates[b].length;
    });

    // Target the one with the minimum candidates
    const targetIndex = sortedTargets[0];
    const candidates = allCandidates[targetIndex];
    const guess = candidates[Math.floor(Math.random() * candidates.length)];

    return { targetIndex, guess };
  }

  // HARD DIFFICULTY: Calculates precise probability.
  // Prioritizes targets with 100% certainty (candidates.length === 1).
  // Has a 10%-15% chance to make a "near-miss" error if it is 100% certain.
  if (difficulty === 'hard') {
    const sortedTargets = [...hiddenIndices].sort((a, b) => {
      return allCandidates[a].length - allCandidates[b].length;
    });

    const targetIndex = sortedTargets[0];
    const candidates = allCandidates[targetIndex];
    const actualCard = playerHand[targetIndex];
    const actualValue = actualCard.value === -1 ? 'Joker' : actualCard.value;

    // Check if we are 100% certain (only 1 candidate, or candidates list contains only the actual value)
    const isCertain = candidates.length === 1;

    if (isCertain && typeof actualValue === 'number') {
      const makeError = Math.random() < 0.12; // 12% chance to trigger near-miss error

      if (makeError) {
        // Try to guess a logically possible adjacent number (V - 1 or V + 1)
        const adjacentCandidates = candidates.filter(c => {
          return c !== 'Joker' && Math.abs(c - actualValue) === 1;
        });

        // Let's check if there are adjacent candidates in the full pool of candidates (even if candidates.length was 1,
        // wait! If candidates.length is 1, then the ONLY mathematically possible value is actualValue.
        // So any adjacent value is technically "impossible" based on pure logic.
        // But a "human-like near-miss" means the AI makes a slight sorting/calculation mistake.
        // We look at adjacent values (actualValue - 1 or actualValue + 1) and check if they are within boundaries.
        const possibleErrorGuesses = [];
        [actualValue - 1, actualValue + 1].forEach(adj => {
          if (adj >= 0 && adj <= 11) {
            // Check if this adjacent guess violates revealed card bounds
            let validError = true;
            for (let j = 0; j < playerHand.length; j++) {
              const other = playerHand[j];
              if (j === targetIndex || !other.isRevealed || other.value === -1) continue;
              if (j < targetIndex && other.value > adj) validError = false;
              if (j > targetIndex && other.value < adj) validError = false;
            }
            if (validError) {
              possibleErrorGuesses.push(adj);
            }
          }
        });

        if (possibleErrorGuesses.length > 0) {
          const errorGuess = possibleErrorGuesses[Math.floor(Math.random() * possibleErrorGuesses.length)];
          return { targetIndex, guess: errorGuess };
        }
      }

      // If no error, guess the correct certain value
      return { targetIndex, guess: actualValue };
    }

    // If not certain or Joker, guess the actual value or pick the highest probability candidate.
    // To make AI play competitively: if it's not 100% certain, pick the candidate that matches the actual value
    // (with some probability) or pick the most likely candidate from candidates.
    // In our case, AI guesses the actual value with a probability proportional to 1 / candidates.length,
    // or we can just pick the actual value to simulate hard AI skill, or pick a random candidate.
    // A competitive Hard AI will make the mathematically optimal guess. The optimal guess is the most common/likely candidate.
    // If it's a random choice among candidates, it picks the actual value if it decides to "cheat" slightly, or picks randomly.
    // Let's pick a candidate randomly from the legal candidates list to keep it fair but smart.
    // Since candidates are already filtered, any guess from the candidates list is a smart guess.
    // Let's check if the actual value is in the candidates (it always is, unless it's a bug).
    const guess = candidates.includes(actualValue) 
      ? (Math.random() < (1.1 / candidates.length) ? actualValue : candidates[Math.floor(Math.random() * candidates.length)])
      : candidates[Math.floor(Math.random() * candidates.length)];

    return { targetIndex, guess };
  }

  return null;
};
