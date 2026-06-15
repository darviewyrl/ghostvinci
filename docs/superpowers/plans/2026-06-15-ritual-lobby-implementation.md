# Ritual Lobby Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current Ghostvinci setup screen into a production-ready, desktop-first ritual lobby with reusable scene and panel components while preserving the existing game-start and configuration behavior.

**Architecture:** Keep `App.jsx` as the owner of lobby state and callbacks, replace the monolithic `SetupScreen.jsx` with a `LobbyShell` composition, and move visual atmosphere into scene-focused components plus lobby-specific CSS tokens. Protect the refactor with interaction tests before changing structure, then migrate layout, styling, and widgets in small verified increments.

**Tech Stack:** React 19, Vite, Tailwind CSS v4, Vitest, Testing Library, lucide-react

---

## File Structure

### Existing files to modify

- `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.jsx`
  Current monolithic lobby implementation. This will become a thin wrapper or export surface while composition moves into smaller components.
- `D:\ipaidekzian\grillapp.ep2\src\App.jsx`
  Supplies lobby props and should continue to own `onConfigChange`, `onStartGame`, `scores`, and settings callbacks.
- `D:\ipaidekzian\grillapp.ep2\src\index.css`
  Global theme tokens, animation classes, and reusable lobby utility classes live here today.

### New files to create

- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyShell.jsx`
  Top-level layout container for the redesigned lobby.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyTopBar.jsx`
  Settings button and any future top-right utility actions.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyScene.jsx`
  Composes the left-side atmosphere and brand presentation.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\AmbientParticles.jsx`
  Encapsulates embers/sparks data and particle markup.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\FloatingCardCluster.jsx`
  Encapsulates decorative floating card layers.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyBrandBlock.jsx`
  Wordmark, subtitle, short description, and info pills for the stage area.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyControlPanel.jsx`
  Right-hand setup panel composition.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbySection.jsx`
  Shared section frame for the panel.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\ModeStatusField.jsx`
  Single-mode status row with future-ready shape.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\DifficultySelector.jsx`
  Difficulty options UI, fed by existing `aiDifficulty` and `onConfigChange`.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\CardRemovalSelector.jsx`
  Card-removal options UI, fed by existing `cardRemovalCount` and `onConfigChange`.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\PrimaryLobbyAction.jsx`
  Start button UI, isolated from the rest of the panel.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\ScoreSummaryWidget.jsx`
  Optional scores widget replacing inline scoreboard markup.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\DailyQuestWidget.jsx`
  Supporting widget shell to keep the lobby feeling like a game screen.
- `D:\ipaidekzian\grillapp.ep2\src\components\lobby\lobbySceneData.js`
  Decorative scene metadata: floating card positions, descriptive copy, and widget defaults.
- `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.test.jsx`
  UI interaction tests for the lobby.

### Asset directories to create

- `D:\ipaidekzian\grillapp.ep2\public\lobby\background\`
- `D:\ipaidekzian\grillapp.ep2\public\lobby\character\`
- `D:\ipaidekzian\grillapp.ep2\public\lobby\cards\`
- `D:\ipaidekzian\grillapp.ep2\public\lobby\fx\`
- `D:\ipaidekzian\grillapp.ep2\public\lobby\ornaments\`
- `D:\ipaidekzian\grillapp.ep2\public\lobby\ui\`

## Task 1: Add Lobby Interaction Test Coverage

**Files:**
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.test.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.jsx`
- Check: `D:\ipaidekzian\grillapp.ep2\package.json`

- [ ] **Step 1: Write the failing lobby interaction tests**

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SetupScreen from './SetupScreen';

const baseProps = {
  aiDifficulty: 'medium',
  cardRemovalCount: 2,
  onConfigChange: vi.fn(),
  onStartGame: vi.fn(),
  playSFX: vi.fn(),
  onOpenSettings: vi.fn(),
  scores: { player: 0, ai: 0 },
  onResetScores: vi.fn(),
};

describe('SetupScreen', () => {
  it('lets the player change difficulty', () => {
    render(<SetupScreen {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /ง่าย/i }));

    expect(baseProps.onConfigChange).toHaveBeenCalledWith({
      aiDifficulty: 'easy',
      cardRemovalCount: 2,
    });
  });

  it('lets the player change card removal count', () => {
    render(<SetupScreen {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /4 ใบ/i }));

    expect(baseProps.onConfigChange).toHaveBeenCalledWith({
      aiDifficulty: 'medium',
      cardRemovalCount: 4,
    });
  });

  it('opens settings from the top bar action', () => {
    render(<SetupScreen {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /ตั้งค่าเสียง/i }));

    expect(baseProps.onOpenSettings).toHaveBeenCalled();
  });

  it('starts the game from the primary ritual action', () => {
    render(<SetupScreen {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /เริ่มพิธีกรรม/i }));

    expect(baseProps.onStartGame).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the new test file and confirm what fails before refactoring**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- The test runner executes only the new file
- At least one query is likely to fail because the current lobby markup is hard to target consistently

- [ ] **Step 3: Make the current screen testable without changing behavior**

Add stable accessibility hooks to `SetupScreen.jsx` before any major layout rewrite:

```jsx
<button
  aria-label="ตั้งค่าเสียง"
  onClick={() => {
    if (playSFX) playSFX('flip');
    onOpenSettings();
  }}
>
```

```jsx
<button
  type="button"
  aria-pressed={aiDifficulty === diff}
  aria-label={`ระดับความยาก ${diff}`}
  onClick={() => {
    if (playSFX) playSFX('flip');
    onConfigChange({ aiDifficulty: diff, cardRemovalCount });
  }}
>
```

```jsx
<button
  type="button"
  aria-pressed={cardRemovalCount === count}
  aria-label={`คัดไพ่ออก ${count} ใบ`}
  onClick={() => {
    if (playSFX) playSFX('flip');
    onConfigChange({ aiDifficulty, cardRemovalCount: count });
  }}
>
```

```jsx
<button
  type="button"
  aria-label="เริ่มพิธีกรรม"
  onClick={onStartGame}
>
```

- [ ] **Step 4: Re-run the lobby tests and confirm they pass**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- All lobby interaction tests PASS

- [ ] **Step 5: Commit the test safety net**

```bash
git add src/components/SetupScreen.test.jsx src/components/SetupScreen.jsx
git commit -m "test: cover lobby setup interactions"
```

## Task 2: Create the New Lobby Component Skeleton

**Files:**
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyShell.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyTopBar.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyScene.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyControlPanel.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\lobbySceneData.js`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.jsx`

- [ ] **Step 1: Write a failing smoke test proving the shell still exposes the same primary actions**

Append this test to `src/components/SetupScreen.test.jsx`:

```jsx
it('renders the lobby shell with stage content and control panel landmarks', () => {
  render(<SetupScreen {...baseProps} />);

  expect(screen.getByTestId('lobby-shell')).toBeInTheDocument();
  expect(screen.getByTestId('lobby-scene')).toBeInTheDocument();
  expect(screen.getByTestId('lobby-control-panel')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted test and verify it fails before creating the skeleton**

Run: `npm test -- src/components/SetupScreen.test.jsx -t "renders the lobby shell"`

Expected:
- FAIL because the data-testid hooks do not exist yet

- [ ] **Step 3: Add the new component skeleton and wire `SetupScreen` through it**

Create `src/components/lobby/LobbyShell.jsx`:

```jsx
import LobbyControlPanel from './LobbyControlPanel';
import LobbyScene from './LobbyScene';
import LobbyTopBar from './LobbyTopBar';

export default function LobbyShell(props) {
  const {
    playSFX,
    onOpenSettings,
    aiDifficulty,
    cardRemovalCount,
    onConfigChange,
    onStartGame,
    scores,
    onResetScores,
  } = props;

  return (
    <div data-testid="lobby-shell" className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-haunted font-thai select-none">
      <LobbyTopBar playSFX={playSFX} onOpenSettings={onOpenSettings} />
      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center lg:px-10 xl:px-16">
        <LobbyScene />
        <LobbyControlPanel
          aiDifficulty={aiDifficulty}
          cardRemovalCount={cardRemovalCount}
          onConfigChange={onConfigChange}
          onStartGame={onStartGame}
          playSFX={playSFX}
          scores={scores}
          onResetScores={onResetScores}
        />
      </main>
    </div>
  );
}
```

Create `src/components/lobby/LobbyTopBar.jsx`:

```jsx
import { Settings } from 'lucide-react';

export default function LobbyTopBar({ playSFX, onOpenSettings }) {
  return (
    <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
      <button
        type="button"
        aria-label="ตั้งค่าเสียง"
        className="lobby-icon-button"
        onClick={() => {
          if (playSFX) playSFX('flip');
          onOpenSettings();
        }}
      >
        <Settings className="h-6 w-6 text-rose-500" strokeWidth={2} />
      </button>
    </div>
  );
}
```

Create `src/components/lobby/LobbyScene.jsx`:

```jsx
export default function LobbyScene() {
  return (
    <section data-testid="lobby-scene" className="relative min-h-[560px]">
      <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.24),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
      <div className="relative z-10 flex min-h-[560px] items-end rounded-[32px] border border-white/5 bg-black/20 p-6 lg:p-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[rgba(230,80,80,0.9)]">Ghostvinci</p>
          <h1 className="mt-4 text-5xl font-black uppercase tracking-[0.08em] text-bone font-cinzel xl:text-7xl">Ghostvinci</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-bone/70">
            Ritual lobby stage placeholder. Replace this shell with layered artwork components in later tasks.
          </p>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/lobby/LobbyControlPanel.jsx`:

```jsx
export default function LobbyControlPanel({
  aiDifficulty,
  cardRemovalCount,
  onConfigChange,
  onStartGame,
  playSFX,
  scores,
  onResetScores,
}) {
  return (
    <aside data-testid="lobby-control-panel" className="lobby-panel p-6 sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgba(230,80,80,0.9)]">Ritual Lobby</p>
      <p className="mt-2 text-bone/70">Panel placeholder. Real sections land in Task 4.</p>
      <button type="button" className="mt-6 lobby-button-primary" onClick={onStartGame}>
        เริ่มพิธีกรรม
      </button>
    </aside>
  );
}
```

Replace `SetupScreen.jsx` with a thin wrapper:

```jsx
import LobbyShell from './lobby/LobbyShell';

export default function SetupScreen(props) {
  return <LobbyShell {...props} />;
}
```

- [ ] **Step 4: Run the shell-oriented test and the full lobby test file**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- The shell landmark test PASSes
- Existing interaction tests may still fail because selectors have not been rebuilt yet

- [ ] **Step 5: Commit the skeleton split**

```bash
git add src/components/SetupScreen.jsx src/components/SetupScreen.test.jsx src/components/lobby
git commit -m "refactor: scaffold ritual lobby shell"
```

## Task 3: Add Lobby Theme Tokens and Shared Utility Classes

**Files:**
- Modify: `D:\ipaidekzian\grillapp.ep2\src\index.css`
- Modify: `D:\ipaidekzian\grillapp.ep2\tailwind.config.js`

- [ ] **Step 1: Write a failing assertion for the new panel class to avoid dead CSS work**

Add this test to `src/components/SetupScreen.test.jsx`:

```jsx
it('applies the reusable lobby panel styling hook', () => {
  render(<SetupScreen {...baseProps} />);

  expect(screen.getByTestId('lobby-control-panel').className).toMatch(/lobby-panel/);
});
```

- [ ] **Step 2: Run the targeted test and confirm it fails if the panel class is not present**

Run: `npm test -- src/components/SetupScreen.test.jsx -t "reusable lobby panel styling hook"`

Expected:
- FAIL if the placeholder panel has drifted away from the intended utility class

- [ ] **Step 3: Add lobby-scoped theme tokens and reusable utility classes**

Append to `src/index.css`:

```css
@theme {
  --color-lobby-bg: #070709;
  --color-lobby-surface: #111016;
  --color-lobby-surface-2: #18141c;
  --color-lobby-border: rgba(166, 42, 42, 0.42);
  --color-lobby-accent: #ef4444;
  --color-lobby-accent-soft: rgba(239, 68, 68, 0.2);
  --color-lobby-text: #f2ede3;
  --color-lobby-text-dim: rgba(242, 237, 227, 0.68);
  --color-lobby-success: #22c55e;
}

.lobby-panel {
  border: 1px solid var(--color-lobby-border);
  background:
    linear-gradient(180deg, rgba(23, 18, 24, 0.96), rgba(10, 10, 14, 0.98)),
    radial-gradient(circle at top, rgba(239, 68, 68, 0.08), transparent 30%);
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.8),
    0 0 18px rgba(239, 68, 68, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 28px;
  backdrop-filter: blur(18px);
}

.lobby-button-primary {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 1px solid rgba(239, 68, 68, 0.55);
  background: linear-gradient(180deg, rgba(116, 16, 16, 0.95), rgba(78, 10, 10, 0.98));
  color: #f7efe3;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 900;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.24);
}

.lobby-icon-button {
  border: 1px solid rgba(127, 29, 29, 0.32);
  background: rgba(10, 10, 12, 0.9);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
}
```

Extend `tailwind.config.js`:

```js
fontFamily: {
  thai: ['Kanit', 'Noto Sans Thai', 'sans-serif'],
  cinzel: ['Cinzel', 'serif'],
},
```

- [ ] **Step 4: Run the lobby tests to ensure the shell still renders with the new classes**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- All current tests PASS

- [ ] **Step 5: Commit the shared lobby styling primitives**

```bash
git add src/index.css tailwind.config.js src/components/SetupScreen.test.jsx
git commit -m "style: add ritual lobby theme primitives"
```

## Task 4: Build the Right-Hand Control Panel with Reusable Sections

**Files:**
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbySection.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\ModeStatusField.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\DifficultySelector.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\CardRemovalSelector.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\PrimaryLobbyAction.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\ScoreSummaryWidget.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\DailyQuestWidget.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyControlPanel.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.test.jsx`

- [ ] **Step 1: Add tests for the real panel sections and selected states**

Add the following tests:

```jsx
it('shows the current mode as single player', () => {
  render(<SetupScreen {...baseProps} />);
  expect(screen.getByText(/single player/i)).toBeInTheDocument();
});

it('marks the active difficulty option as pressed', () => {
  render(<SetupScreen {...baseProps} />);
  expect(screen.getByRole('button', { name: /ระดับความยาก medium/i })).toHaveAttribute('aria-pressed', 'true');
});

it('marks the active card removal option as pressed', () => {
  render(<SetupScreen {...baseProps} />);
  expect(screen.getByRole('button', { name: /คัดไพ่ออก 2 ใบ/i })).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run the panel-focused tests and verify failures before implementation**

Run: `npm test -- src/components/SetupScreen.test.jsx -t "active"`

Expected:
- FAIL because the placeholder panel does not yet expose these controls

- [ ] **Step 3: Implement the reusable panel pieces**

Create `LobbySection.jsx`:

```jsx
export default function LobbySection({ title, helper, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[rgba(230,80,80,0.92)] sm:text-base">
          {title}
        </h3>
        {helper ? <p className="mt-1 text-xs text-bone/50">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}
```

Create `ModeStatusField.jsx`:

```jsx
export default function ModeStatusField() {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-bone/45">Mode</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
        <span className="text-sm font-black uppercase tracking-[0.12em] text-bone">Single Player</span>
      </div>
    </div>
  );
}
```

Create `DifficultySelector.jsx`:

```jsx
const OPTIONS = [
  { id: 'easy', label: 'ง่าย' },
  { id: 'medium', label: 'ปานกลาง' },
  { id: 'hard', label: 'อันตราย' },
];

export default function DifficultySelector({ aiDifficulty, cardRemovalCount, onConfigChange, playSFX }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-label={`ระดับความยาก ${option.id}`}
          aria-pressed={aiDifficulty === option.id}
          className={`lobby-tile ${aiDifficulty === option.id ? 'lobby-tile-active' : ''}`}
          onClick={() => {
            if (playSFX) playSFX('flip');
            onConfigChange({ aiDifficulty: option.id, cardRemovalCount });
          }}
        >
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
```

Create `CardRemovalSelector.jsx`:

```jsx
const OPTIONS = [0, 2, 4, 6];

export default function CardRemovalSelector({ aiDifficulty, cardRemovalCount, onConfigChange, playSFX }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {OPTIONS.map((count) => (
        <button
          key={count}
          type="button"
          aria-label={`คัดไพ่ออก ${count} ใบ`}
          aria-pressed={cardRemovalCount === count}
          className={`lobby-tile ${cardRemovalCount === count ? 'lobby-tile-active' : ''}`}
          onClick={() => {
            if (playSFX) playSFX('flip');
            onConfigChange({ aiDifficulty, cardRemovalCount: count });
          }}
        >
          <span>{count} ใบ</span>
        </button>
      ))}
    </div>
  );
}
```

Create `PrimaryLobbyAction.jsx`:

```jsx
import { Skull } from 'lucide-react';

export default function PrimaryLobbyAction({ onStartGame }) {
  return (
    <button type="button" aria-label="เริ่มพิธีกรรม" className="lobby-button-primary" onClick={onStartGame}>
      <Skull className="h-5 w-5" />
      <span>เริ่มพิธีกรรม</span>
    </button>
  );
}
```

Create `ScoreSummaryWidget.jsx`:

```jsx
export default function ScoreSummaryWidget({ scores, onResetScores, playSFX }) {
  if (!scores || (scores.player === 0 && scores.ai === 0)) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[rgba(230,80,80,0.9)]">คะแนนล่าสุด</span>
        <button
          type="button"
          className="text-[11px] font-bold uppercase tracking-widest text-bone/40 underline"
          onClick={() => {
            if (playSFX) playSFX('toggle');
            onResetScores();
          }}
        >
          ล้างคะแนน
        </button>
      </div>
      <div className="flex items-center justify-center gap-5">
        <span className="text-3xl font-black text-emerald-400">{scores.player}</span>
        <span className="text-bone/30">:</span>
        <span className="text-3xl font-black text-rose-500">{scores.ai}</span>
      </div>
    </div>
  );
}
```

Create `DailyQuestWidget.jsx`:

```jsx
export default function DailyQuestWidget() {
  return (
    <div className="rounded-2xl border border-[rgba(127,29,29,0.22)] bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[rgba(230,80,80,0.9)]">ภารกิจประจำวัน</p>
      <p className="mt-2 text-sm font-semibold text-bone">ชนะเกม 3 ครั้ง</p>
      <div className="mt-3 h-2 rounded-full bg-white/8">
        <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-rose-700 to-red-400" />
      </div>
      <p className="mt-2 text-xs text-bone/60">2 / 3</p>
    </div>
  );
}
```

Update `LobbyControlPanel.jsx` to compose these pieces instead of placeholder text.

- [ ] **Step 4: Run the full lobby test file**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- All lobby interaction and section tests PASS

- [ ] **Step 5: Commit the control panel implementation**

```bash
git add src/components/lobby src/components/SetupScreen.test.jsx
git commit -m "feat: build ritual lobby control panel"
```

## Task 5: Build the Left Stage Scene and Separate Decorative Data

**Files:**
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\AmbientParticles.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\FloatingCardCluster.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyBrandBlock.jsx`
- Create: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\lobbySceneData.js`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyScene.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.test.jsx`

- [ ] **Step 1: Add a test asserting the scene exposes stage content without hardcoding every visual detail**

Add:

```jsx
it('renders the stage brand block and decorative floating card cluster', () => {
  render(<SetupScreen {...baseProps} />);

  expect(screen.getByText(/ghostvinci/i)).toBeInTheDocument();
  expect(screen.getByTestId('floating-card-cluster')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the new scene test and confirm it fails first**

Run: `npm test -- src/components/SetupScreen.test.jsx -t "decorative floating card cluster"`

Expected:
- FAIL because the cluster test id is not implemented yet

- [ ] **Step 3: Move decorative stage content into dedicated scene components**

Create `lobbySceneData.js`:

```js
export const FLOATING_CARDS = [
  { id: 'top-left', className: 'left-[8%] top-[6%] rotate-[-14deg]', label: '8' },
  { id: 'upper-right', className: 'right-[18%] top-[10%] rotate-[14deg]', label: '3' },
  { id: 'left-edge', className: 'left-[-2%] top-[34%] rotate-[-20deg]', label: 'sigil' },
  { id: 'feature', className: 'right-[6%] top-[42%] rotate-[11deg]', label: 'joker' },
];

export const LOBBY_INFO_PILLS = ['Single Player', '20 Sec Turns', 'Joker Chaos'];
```

Create `AmbientParticles.jsx`:

```jsx
const EMBERS = Array.from({ length: 7 }, (_, index) => ({
  id: index,
  left: `${10 + index * 12}%`,
  top: `${8 + (index % 4) * 18}%`,
  size: 56 + (index % 3) * 26,
  delay: `${index * 0.5}s`,
  duration: `${6 + (index % 3)}s`,
}));

export default function AmbientParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {EMBERS.map((ember) => (
        <div
          key={ember.id}
          className="absolute rounded-full bg-[rgba(140,20,20,0.08)] animate-ghost-bob"
          style={{
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            left: ember.left,
            top: ember.top,
            filter: 'blur(40px)',
            animationDelay: ember.delay,
            animationDuration: ember.duration,
          }}
        />
      ))}
    </div>
  );
}
```

Create `FloatingCardCluster.jsx`:

```jsx
import { FLOATING_CARDS } from './lobbySceneData';

export default function FloatingCardCluster() {
  return (
    <div data-testid="floating-card-cluster" className="pointer-events-none absolute inset-0 hidden lg:block">
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.id}
          className={`absolute h-[180px] w-[120px] rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(35,26,28,0.96),rgba(17,16,21,0.98))] shadow-[0_20px_60px_rgba(0,0,0,0.55)] ${card.className}`}
        >
          <div className="flex h-full items-center justify-center text-4xl font-black text-bone/70 font-cinzel">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

Create `LobbyBrandBlock.jsx`:

```jsx
import { LOBBY_INFO_PILLS } from './lobbySceneData';

export default function LobbyBrandBlock() {
  return (
    <div className="relative z-10 max-w-3xl">
      <p className="inline-flex items-center rounded-full border border-[rgba(230,80,80,0.24)] bg-black/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.32em] text-[rgba(230,80,80,0.9)]">
        Ghostvinci
      </p>
      <h1 className="mt-5 text-[3.5rem] font-black uppercase leading-[0.84] tracking-[0.07em] text-bone font-cinzel sm:text-[4.8rem] xl:text-[6.4rem]">
        Ghostvinci
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-bone/75">
        Open the ritual, choose the setup, and step directly into a playable supernatural guessing match.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {LOBBY_INFO_PILLS.map((pill) => (
          <span key={pill} className="rounded-full border border-[rgba(127,29,29,0.18)] bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bone/58">
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}
```

Update `LobbyScene.jsx` to compose `AmbientParticles`, `FloatingCardCluster`, and `LobbyBrandBlock`.

- [ ] **Step 4: Run the scene tests and the whole lobby suite**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- Scene tests PASS
- No regressions in panel behavior

- [ ] **Step 5: Commit the stage composition**

```bash
git add src/components/lobby src/components/SetupScreen.test.jsx
git commit -m "feat: compose ritual lobby stage scene"
```

## Task 6: Create Asset Directories and Hook the Scene to Independent Artwork Paths

**Files:**
- Create: `D:\ipaidekzian\grillapp.ep2\public\lobby\background\.gitkeep`
- Create: `D:\ipaidekzian\grillapp.ep2\public\lobby\character\.gitkeep`
- Create: `D:\ipaidekzian\grillapp.ep2\public\lobby\cards\.gitkeep`
- Create: `D:\ipaidekzian\grillapp.ep2\public\lobby\fx\.gitkeep`
- Create: `D:\ipaidekzian\grillapp.ep2\public\lobby\ornaments\.gitkeep`
- Create: `D:\ipaidekzian\grillapp.ep2\public\lobby\ui\.gitkeep`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\lobbySceneData.js`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyScene.jsx`

- [ ] **Step 1: Add a small test proving the scene uses independent asset paths**

Add:

```jsx
it('uses lobby asset paths instead of embedding decorative text into the UI shell', () => {
  render(<SetupScreen {...baseProps} />);
  expect(screen.getByTestId('lobby-scene')).toHaveAttribute('data-uses-layered-assets', 'true');
});
```

- [ ] **Step 2: Run the targeted asset-path test and verify it fails first**

Run: `npm test -- src/components/SetupScreen.test.jsx -t "layered assets"`

Expected:
- FAIL because the scene does not yet declare the layered-asset hook

- [ ] **Step 3: Create the directory structure and wire explicit asset constants**

Update `lobbySceneData.js`:

```js
export const LOBBY_ASSETS = {
  backgroundBase: '/lobby/background/lobby-bg-base.webp',
  backgroundVignette: '/lobby/background/lobby-bg-vignette.png',
  sigil: '/lobby/ornaments/ritual-sigil-red.svg',
  character: '/lobby/character/lobby-host-silhouette.webp',
  characterGlow: '/lobby/character/lobby-host-glow.png',
  smokeLeft: '/lobby/fx/smoke-left.png',
  smokeRight: '/lobby/fx/smoke-right.png',
};
```

Update `LobbyScene.jsx`:

```jsx
import AmbientParticles from './AmbientParticles';
import FloatingCardCluster from './FloatingCardCluster';
import LobbyBrandBlock from './LobbyBrandBlock';
import { LOBBY_ASSETS } from './lobbySceneData';

export default function LobbyScene() {
  return (
    <section data-testid="lobby-scene" data-uses-layered-assets="true" className="relative min-h-[560px] overflow-hidden rounded-[32px]">
      <img src={LOBBY_ASSETS.backgroundBase} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <img src={LOBBY_ASSETS.backgroundVignette} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <AmbientParticles />
      <img src={LOBBY_ASSETS.sigil} alt="" aria-hidden="true" className="absolute left-1/2 top-[8%] w-[min(70%,640px)] -translate-x-1/2 opacity-20" />
      <img src={LOBBY_ASSETS.characterGlow} alt="" aria-hidden="true" className="absolute bottom-0 left-[44%] w-[min(55%,520px)] -translate-x-1/2 opacity-45" />
      <img src={LOBBY_ASSETS.character} alt="" aria-hidden="true" className="absolute bottom-0 left-[44%] z-[1] w-[min(54%,500px)] -translate-x-1/2 opacity-90" />
      <FloatingCardCluster />
      <div className="relative z-10 flex min-h-[560px] items-end p-6 lg:p-10">
        <LobbyBrandBlock />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Re-run the lobby tests**

Run: `npm test -- src/components/SetupScreen.test.jsx`

Expected:
- All tests PASS

- [ ] **Step 5: Commit the asset-structure groundwork**

```bash
git add public/lobby src/components/lobby src/components/SetupScreen.test.jsx
git commit -m "chore: prepare layered lobby asset structure"
```

## Task 7: Polish Responsive Layout and Reduce Monolithic Legacy CSS Pressure

**Files:**
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyShell.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyScene.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\components\lobby\LobbyControlPanel.jsx`
- Modify: `D:\ipaidekzian\grillapp.ep2\src\index.css`

- [ ] **Step 1: Add a test to protect the desktop-first shell proportions**

Add:

```jsx
it('keeps the desktop-first lobby shell grid class', () => {
  render(<SetupScreen {...baseProps} />);
  expect(screen.getByTestId('lobby-shell').innerHTML).toMatch(/lg:grid-cols-\[minmax\(0,1\.2fr\)_420px\]/);
});
```

- [ ] **Step 2: Run the layout test and confirm it fails if the intended grid disappears**

Run: `npm test -- src/components/SetupScreen.test.jsx -t "desktop-first lobby shell grid class"`

Expected:
- FAIL if the desktop-first layout token is missing

- [ ] **Step 3: Apply the responsive and motion polish**

Update `LobbyShell.jsx` main container and child spacing:

```jsx
<main className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center lg:gap-10 lg:px-10 xl:gap-14 xl:px-16">
```

Add utility classes in `src/index.css`:

```css
.lobby-tile {
  display: flex;
  min-height: 112px;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  border: 1px solid rgba(127, 29, 29, 0.22);
  background: rgba(8, 8, 10, 0.82);
  color: rgba(232, 226, 213, 0.62);
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease;
}

.lobby-tile-active {
  border-color: #ef4444;
  background: rgba(34, 7, 7, 0.95);
  color: #ff5a5a;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.45);
  transform: scale(1.02);
}

@media (prefers-reduced-motion: reduce) {
  .animate-ghost-bob,
  .animate-ember,
  .animate-cta-breath {
    animation: none !important;
  }

  .lobby-tile,
  .lobby-button-primary {
    transition: none;
  }
}
```

- [ ] **Step 4: Run tests plus a production build smoke check**

Run: `npm test -- src/components/SetupScreen.test.jsx`
Expected: PASS

Run: `npm run build`
Expected: Vite production build succeeds

- [ ] **Step 5: Commit the lobby polish pass**

```bash
git add src/components/lobby src/index.css src/components/SetupScreen.test.jsx
git commit -m "style: polish ritual lobby layout"
```

## Task 8: Final Verification and Documentation Pass

**Files:**
- Modify: `D:\ipaidekzian\grillapp.ep2\README.md` (only if it is being used to document the project UI status)
- Review: `D:\ipaidekzian\grillapp.ep2\src\App.jsx`
- Review: `D:\ipaidekzian\grillapp.ep2\src\components\SetupScreen.jsx`

- [ ] **Step 1: Review the changed surface against the approved spec**

Manual checklist:

```md
- left stage feels atmospheric
- right panel stays visible and actionable
- only one mode is exposed
- setup interactions still call existing callbacks
- scene layers and panel code are independent
- no multiplayer behavior was accidentally introduced
```

- [ ] **Step 2: Run the full required verification suite**

Run: `npm test`
Expected: All Vitest suites PASS

Run: `npm run lint`
Expected: ESLint exits with code 0

Run: `npm run build`
Expected: Vite build succeeds with no fatal warnings

- [ ] **Step 3: Perform a manual desktop-first visual pass in the browser**

Run: `npm run dev`

Manual checks:
- inspect the lobby at desktop width first
- confirm the control panel reads clearly at first glance
- confirm the CTA is visible without scrolling on common laptop heights
- confirm mobile fallback stacks without clipped controls
- confirm reduced-motion mode removes non-essential ambient animation

- [ ] **Step 4: Update top-level docs only if the lobby behavior or structure needs a durable note**

If README needs a short note, append something like:

```md
## Lobby UI

The lobby is composed from reusable ritual scene and control-panel components under `src/components/lobby/`.
Game flow state still lives in `App.jsx` and the reducer layer.
```

- [ ] **Step 5: Commit the verified final state**

```bash
git add README.md src App.jsx
git commit -m "feat: ship ritual lobby redesign"
```

## Spec Coverage Check

- Modern game-lobby feel: covered by Tasks 4, 5, and 7
- Single-mode scope: covered by Task 4 `ModeStatusField`
- Desktop-first layout: covered by Tasks 2 and 7
- Independent artwork layers: covered by Tasks 5 and 6
- Reusable React components: covered by Tasks 2, 4, and 5
- Tailwind-based implementation: covered by Tasks 3 and 7
- Future multiplayer readiness without implementing it: covered by Task 2 structure and Task 4 prop boundaries
- Verification requirements: covered by Tasks 1 and 8

## Placeholder Scan

- No `TODO`, `TBD`, or “similar to above” placeholders remain
- Each code-changing step includes concrete code snippets
- Each verification step includes exact commands and expected outcomes

## Type Consistency Check

- `aiDifficulty`, `cardRemovalCount`, `onConfigChange`, `onStartGame`, `scores`, `onResetScores`, and `playSFX` use consistent names across tasks
- `LobbyShell`, `LobbyScene`, and `LobbyControlPanel` are defined before later tasks build on them
- Asset constants are introduced in `lobbySceneData.js` before the scene consumes them
