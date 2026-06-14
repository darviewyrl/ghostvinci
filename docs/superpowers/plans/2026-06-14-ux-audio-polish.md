# UX Audio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize audio playback, remove mobile gameplay layout breakage, reduce overlapping game states, and improve accessibility/motion polish across the app.

**Architecture:** Add a lightweight Vitest test harness for state and audio logic, then refactor the audio hook and game-phase transitions to use explicit unlock and feedback sequencing. Follow with a responsive gameplay layout pass that introduces mobile-specific structure without rewriting the game rules.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4, Vitest, Testing Library

---

### Task 1: Add a Test Harness for Hooks and Reducer Logic

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Create: `src/hooks/useAudio.test.jsx`
- Create: `src/hooks/useGameState.test.js`

- [ ] **Step 1: Write the failing audio hook tests**

```jsx
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudio } from './useAudio';

describe('useAudio', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not repeatedly attempt BGM playback before audio is unlocked', async () => {
    const play = vi.fn(() => Promise.reject(new Error('blocked')));
    global.Audio = vi.fn(() => ({
      loop: false,
      volume: 1,
      muted: false,
      currentTime: 0,
      pause: vi.fn(),
      play,
    }));

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playBGM();
      await result.current.playBGM();
    });

    expect(play).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Write the failing reducer/state-flow tests**

```js
import { describe, expect, it } from 'vitest';
import { gameReducer, INITIAL_STATE } from './useGameState';

describe('gameReducer feedback flow', () => {
  it('keeps a wrong-guess result available until feedback is acknowledged', () => {
    const state = {
      ...INITIAL_STATE,
      gamePhase: 'GUESS',
      activePlayer: 'player',
      aiHand: [{ id: 'a', value: 5, color: 'black', isRevealed: false }],
      playerHand: [{ id: 'p', value: 1, color: 'white', isRevealed: false }],
+      drawnTile: { id: 'j', value: -1, color: 'black', isRevealed: false },
    };

    const next = gameReducer(state, {
      type: 'GUESS_TILE',
      payload: { targetIndex: 0, guessedValue: 1, guessedColor: 'white' },
    });

    expect(next.gamePhase).toBe('FEEDBACK');
    expect(next.pendingPhase?.phase).toBe('JOKER_PLACEMENT');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- --runInBand`

Expected: command fails because `test` script and/or required files are missing.

- [ ] **Step 4: Add the minimal test tooling**

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

```js
// src/test/setup.js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Export reducer primitives needed by tests**

```js
export { INITIAL_STATE, gameReducer };
```

- [ ] **Step 6: Run tests to verify the new tests now fail for the intended behavior**

Run: `npm test`

Expected: Vitest runs and reports failures around repeated BGM attempts and missing `FEEDBACK` phase behavior.

### Task 2: Refactor Audio Unlocking and SFX Variety

**Files:**
- Modify: `src/hooks/useAudio.js`
- Test: `src/hooks/useAudio.test.jsx`

- [ ] **Step 1: Extend the failing audio tests with warning and unlock expectations**

```jsx
it('only plays warning heartbeat once per threshold bucket', async () => {
  const { result } = renderHook(() => useAudio());

  await act(async () => {
    result.current.markWarningPlayed(5);
    result.current.markWarningPlayed(5);
  });

  expect(result.current.shouldPlayWarning(5)).toBe(false);
});
```

- [ ] **Step 2: Implement minimal audio unlock and retry guards**

```js
const [audioUnlocked, setAudioUnlocked] = useState(false);
const bgmAttemptedRef = useRef(false);
const warningMarksRef = useRef(new Set());

const unlockAudio = async () => {
  setAudioUnlocked(true);
  bgmAttemptedRef.current = false;
};

const playBGM = async () => {
  if (!bgmRef.current || isMuted || !audioUnlocked || bgmAttemptedRef.current) return;
  bgmAttemptedRef.current = true;
  try {
    await bgmRef.current.play();
  } catch {
    bgmAttemptedRef.current = true;
  }
};

const shouldPlayWarning = (time) => !warningMarksRef.current.has(time);
const markWarningPlayed = (time) => warningMarksRef.current.add(time);
const resetWarningMarks = () => warningMarksRef.current.clear();
```

- [ ] **Step 3: Separate repetitive sound mappings**

```js
const SFX_URLS = {
  draw: '/audio/draw.mp3',
  flip: '/audio/flip.mp3',
  correct: '/audio/correct.wav',
  wrong: '/audio/wrong.wav',
  victory: '/audio/victory.wav',
  defeat: '/audio/defeat.wav',
  popup: '/audio/draw.wav',
  transition: '/audio/flip.wav',
};
```

- [ ] **Step 4: Debounce hover playback**

```js
const hoverCooldownRef = useRef(0);

if (type === 'hover') {
  const now = Date.now();
  if (now - hoverCooldownRef.current < 120) return;
  hoverCooldownRef.current = now;
}
```

- [ ] **Step 5: Run the targeted audio tests**

Run: `npm test -- src/hooks/useAudio.test.jsx`

Expected: audio tests pass.

### Task 3: Serialize Feedback, Timeout, and Joker Placement States

**Files:**
- Modify: `src/hooks/useGameState.js`
- Modify: `src/App.jsx`
- Modify: `src/components/GameBoard.jsx`
- Test: `src/hooks/useGameState.test.js`

- [ ] **Step 1: Expand reducer tests for feedback acknowledgement**

```js
it('applies the pending phase only after feedback acknowledgement', () => {
  const feedbackState = {
    ...INITIAL_STATE,
    gamePhase: 'FEEDBACK',
    pendingPhase: { phase: 'TURN_BANNER', activePlayer: 'ai', timeLeft: 20 },
  };

  const next = gameReducer(feedbackState, { type: 'ACK_FEEDBACK' });

  expect(next.gamePhase).toBe('TURN_BANNER');
  expect(next.pendingPhase).toBe(null);
});
```

- [ ] **Step 2: Add explicit feedback state to reducer**

```js
const INITIAL_STATE = {
  // ...
  pendingPhase: null,
};
```

```js
return {
  ...state,
  gamePhase: 'FEEDBACK',
  pendingPhase: {
    phase: 'JOKER_PLACEMENT',
    timeLeft: 5,
  },
  lastGuess: { targetIndex, guess: guessedValue, isCorrect: false, guesser: activePlayer },
};
```

- [ ] **Step 3: Add feedback acknowledgement handling**

```js
case 'ACK_FEEDBACK': {
  if (!state.pendingPhase) return state;
  return {
    ...state,
    ...state.pendingPhase,
    pendingPhase: null,
  };
}
```

- [ ] **Step 4: Update App feedback timer to acknowledge instead of allowing state overlap**

```jsx
useEffect(() => {
  if (gamePhase !== 'FEEDBACK' || !state.lastGuess) return;
  const timer = setTimeout(() => {
    dispatch({ type: 'ACK_FEEDBACK' });
  }, 1400);
  return () => clearTimeout(timer);
}, [gamePhase, state.lastGuess, dispatch]);
```

- [ ] **Step 5: Restrict GameBoard overlays to `FEEDBACK`**

```jsx
const isFeedbackPhase = gamePhase === 'FEEDBACK' && lastGuess;
```

- [ ] **Step 6: Run reducer tests**

Run: `npm test -- src/hooks/useGameState.test.js`

Expected: all reducer flow tests pass.

### Task 4: Build a Mobile-Safe Gameplay Layout

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/GameHUD.jsx`
- Modify: `src/components/GameBoard.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Replace the fixed desktop-only gameplay shell with a responsive stack**

```jsx
<div className="h-screen w-screen bg-haunted relative flex flex-col overflow-hidden font-thai select-none">
  <div className="flex-1 min-h-0 flex flex-col gap-2 p-2.5">
    <GameHUD ... />
    <div className="flex-1 min-h-0 ritual-table overflow-y-auto overflow-x-hidden">
      <GameBoard ... />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Condense the HUD on mobile**

```jsx
<div className="skull-panel px-3 py-3 flex flex-col gap-3 md:px-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
```

- [ ] **Step 3: Make both hand rows horizontally scrollable on small screens**

```jsx
<div className="w-full overflow-x-auto overflow-y-visible px-2 pb-2 mobile-hand-scroll">
  <div className="mx-auto flex w-max items-end justify-center" style={{ gap: '8px' }}>
```

- [ ] **Step 4: Move the center status panel into normal flow on mobile**

```jsx
<div className={`w-full max-w-sm mx-auto flex flex-col items-center text-center p-4 md:absolute md:top-1/2 md:-translate-y-1/2 ${selectedAICardIdx !== null ? 'md:left-[calc(100%-20rem)]' : 'md:left-1/2 md:-translate-x-1/2'}`}>
```

- [ ] **Step 5: Reduce mobile card sizes and overflow clipping**

```css
@media (max-width: 767px) {
  .card-base {
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, opacity 0.2s ease, filter 0.2s ease;
  }

  .mobile-hand-scroll {
    scrollbar-width: none;
  }

  .mobile-hand-scroll::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 6: Verify the app still builds**

Run: `npm run build`

Expected: Vite build succeeds.

### Task 5: Reduce Motion Jank and Fix Accessibility Basics

**Files:**
- Modify: `src/components/SetupScreen.jsx`
- Modify: `src/components/GameHUD.jsx`
- Modify: `src/components/GameBoard.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Convert icon-only controls to labeled buttons**

```jsx
<button
  type="button"
  aria-label="เปิดการตั้งค่าเสียง"
  title="ตั้งค่าเสียง"
>
```

- [ ] **Step 2: Add semantic roles and keyboard-safe controls to card actions**

```jsx
<button
  type="button"
  aria-label={`เลือกการ์ดวิญญาณตำแหน่ง ${idx + 1}`}
  onClick={() => handleAICardClick(idx)}
  className="hand-card-wrapper"
>
```

- [ ] **Step 3: Tie slider labels to controls**

```jsx
<label htmlFor="bgm-volume" className="text-xs font-bold text-bone/85">
  ระดับเสียงเพลงประกอบ (BGM)
</label>
<input id="bgm-volume" type="range" ... />
```

- [ ] **Step 4: Replace `transition: all` and lower motion amplitude**

```css
.card-base:not(.card-revealed):not(.card-selected):hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.85), 0 0 12px rgba(127,29,29,0.24);
  border-color: rgba(153,27,27,0.5);
}
```

- [ ] **Step 5: Add reduced-motion fallback**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Run lint**

Run: `npm run lint`

Expected: ESLint exits with `0`.

### Task 6: Verify End-to-End Behavior in the Browser

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/GameBoard.jsx`
- Modify: `src/components/GameHUD.jsx`
- Modify: `src/hooks/useAudio.js`
- Modify: `src/hooks/useGameState.js`
- Modify: `src/index.css`

- [ ] **Step 1: Run the full automated checks**

Run: `npm test && npm run lint && npm run build`

Expected: all commands pass.

- [ ] **Step 2: Verify desktop gameplay manually**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`

Expected: desktop view loads without autoplay log spam, feedback no longer overlaps Joker placement, and card interactions remain usable.

- [ ] **Step 3: Verify mobile gameplay manually**

Run: open `http://127.0.0.1:4173` in a `390x844` viewport

Expected: no card clipping at the viewport edges, no blocked controls, and settings modal remains fully usable.

- [ ] **Step 4: Commit the remediation**

```bash
git add package.json package-lock.json vitest.config.js src/test/setup.js src/hooks/useAudio.test.jsx src/hooks/useGameState.test.js src/hooks/useAudio.js src/hooks/useGameState.js src/App.jsx src/components/GameBoard.jsx src/components/GameHUD.jsx src/components/SetupScreen.jsx src/index.css docs/superpowers/plans/2026-06-14-ux-audio-polish.md
git commit -m "fix: polish gameplay audio and responsive UX"
```
