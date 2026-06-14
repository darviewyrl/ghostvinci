# Ritual Lobby Design Spec

Date: 2026-06-15
Status: Approved for spec drafting
Scope: Production-ready React + Tailwind lobby redesign for Ghostvinci

## Goal

Redesign the existing lobby into a modern game lobby that uses the supplied mockup only as a visual reference, not as a literal template.

The final lobby should:

- feel like an interactive game lobby, not a marketing landing page
- remain single-mode for now
- be desktop-first
- balance artwork presence with readable control UI
- separate artwork into independent assets
- use reusable React components
- keep future expansion paths open for multiplayer or additional modes later

## Product Direction

The chosen direction is `Balanced Ritual Lobby`.

This means:

- the left side behaves like a ritual stage with character presence, floating cards, ambient smoke, and brand identity
- the right side behaves like a clean control panel for game setup
- the composition should feel playable and immediate, not like a homepage hero
- visual drama is important, but setup clarity and interaction hierarchy win when the two compete

## Constraints

- Current product supports only one mode
- Multiplayer is not in scope for this version
- Existing reducer-driven game flow should remain the source of truth
- Existing config actions for difficulty and card removal should be preserved
- The redesign should minimize coupling between artwork and UI state

## Experience Principles

- `Playable first`: the main action and setup options must be obvious within a few seconds
- `Worldbuilding second`: atmosphere should enrich the experience without hiding controls
- `Asset independence`: no meaningful UI text or state should be baked into artwork
- `Composable structure`: panel blocks and scene layers should be replaceable or extendable
- `Future-ready shell`: even though there is one mode today, the shell should not block additional mode entry points later

## Layer Breakdown

### Background Layers

1. `lobby-bg-base.webp`
Purpose: dark scenic base for the entire lobby, providing overall depth and contrast.
Suggested dimensions: `2560x1440`
Format: `webp`

2. `lobby-bg-vignette.png`
Purpose: directional contrast overlay to focus attention toward the stage center and control panel.
Suggested dimensions: `2560x1440`
Format: `png`

3. `ritual-sigil-red.svg`
Purpose: symbolic anchor behind the character, giving the lobby a distinct ritual identity.
Suggested dimensions: `1400x1400`
Format: `svg`

### Character Layers

1. `lobby-host-silhouette.webp`
Purpose: primary focal artwork that establishes tone and identity for the lobby.
Suggested dimensions: `1400x1800`
Format: `webp`

2. `lobby-host-glow.png`
Purpose: independent light separation layer so the character can be emphasized without rebaking the main illustration.
Suggested dimensions: `1600x1900`
Format: `png`

### Card Layers

1. `card-feature-jester.webp`
Purpose: featured foreground card that adds narrative flavor and establishes the card-based core loop.
Suggested dimensions: `700x1050`
Format: `webp`

2. `card-floating-01.webp`
Purpose: secondary floating card for motion and composition balance.
Suggested dimensions: `420x630`
Format: `webp`

3. `card-floating-02.webp`
Purpose: additional floating card to support asymmetric composition on the stage.
Suggested dimensions: `420x630`
Format: `webp`

4. `card-back-ritual.webp`
Purpose: reusable card back for decorative stacks and future scene variation.
Suggested dimensions: `420x630`
Format: `webp`

### Smoke Layers

1. `smoke-left.png`
Purpose: soft atmospheric veil around the left stage and brand block.
Suggested dimensions: `900x1400`
Format: `png`

2. `smoke-right.png`
Purpose: transitional depth between the stage and control panel.
Suggested dimensions: `900x1400`
Format: `png`

3. `smoke-ambient.png`
Purpose: full-scene motion overlay for subtle opacity drift and layered ambience.
Suggested dimensions: `2560x1440`
Format: `png`

### Decorative Layers

1. `embers-overlay.png`
Purpose: reusable ambient particle layer for heat, motion, and ritual energy.
Suggested dimensions: `1920x1080`
Format: `png`

2. `ornament-corner-ritual.svg`
Purpose: reusable gothic corner detail for panels, cards, or framed buttons.
Suggested dimensions: `128x128`
Format: `svg`

3. `ornament-divider.svg`
Purpose: section divider for headings, lore, or supporting meta labels.
Suggested dimensions: `512x64`
Format: `svg`

4. `ritual-icons.svg`
Purpose: icon sprite or set for difficulty, info widgets, and ritual symbols.
Suggested dimensions: `256x256` sprite sheet or separate `48x48` icons
Format: `svg`

5. `ghostvinci-wordmark.svg`
Purpose: crisp logo wordmark that scales independently from scene art.
Suggested dimensions: `900x220`
Format: `svg`

### UI Panel Layers

1. `panel-ritual-shell.png`
Purpose: ornamental skin for the main control panel container.
Suggested dimensions: `720x1180`
Format: `png`

2. `panel-option-tile.png`
Purpose: reusable visual skin for difficulty and setup tiles.
Suggested dimensions: `240x240`
Format: `png`

3. `button-ritual-primary.png`
Purpose: decorative primary action frame for the main lobby CTA.
Suggested dimensions: `560x120`
Format: `png`

4. `widget-daily-shell.png`
Purpose: smaller panel shell for supporting widgets such as quests, score recap, or lore hints.
Suggested dimensions: `720x260`
Format: `png`

## Asset Rules

- All artwork should live separately from the React component tree and be layered in composition
- Text labels, values, progress numbers, and active states must never be baked into image files
- Decorative frames may be image-based, but control states must still be rendered in HTML and Tailwind
- Floating cards must be independent scene elements so they can be animated, reordered, or swapped later
- The panel shell is a visual skin only; layout spacing and interactive state belong to code

## Recommended Layout

### Desktop

Use a two-column lobby shell:

- left: stage area with background, character, floating cards, logo, and short supporting identity text
- right: fixed-width ritual control panel containing setup options and the primary CTA

Recommended grid direction:

- `minmax(0, 1.2fr)` for the stage column
- `380px` to `440px` fixed width for the control column

### Mobile Fallback

Mobile is not the primary design target, but must remain usable.

- compress the stage artwork vertically
- move the control panel below the brand block
- reduce floating card count if needed
- keep the CTA visible without long scrolling

## Component Architecture

### Top-Level Components

- `LobbyShell`
- `LobbyTopBar`
- `LobbyScene`
- `LobbyControlPanel`

### Scene Components

- `LobbyBackground`
- `LobbySigil`
- `LobbyCharacter`
- `FloatingCardCluster`
- `SmokeOverlay`
- `AmbientParticles`
- `LobbyBrandBlock`

### Control Components

- `LobbySection`
- `ModeStatusField`
- `DifficultySelector`
- `CardRemovalSelector`
- `PrimaryLobbyAction`
- `DailyQuestWidget`
- `LoreHintWidget`
- `InfoPillRow`

## Responsibility Boundaries

### `LobbyShell`

- owns overall layout and composition
- receives app state and dispatch callbacks from higher-level game flow
- decides what content appears in scene versus control panel

### `LobbyScene`

- renders all artwork and atmospheric layers
- owns scene-only animation and positioning
- must not own reducer state or game configuration logic

### `LobbyControlPanel`

- renders the current mode status, setup fields, and CTA
- stays stateless apart from local presentational behavior
- receives selected values and change callbacks from the app layer

### `LobbySection`

- standardizes title, divider, spacing, and optional helper text
- prevents future settings blocks from drifting into inconsistent panel styles

## State Model

Current scope stays single-mode, but props should be shaped to allow future expansion:

```ts
type LobbyConfig = {
  aiDifficulty: 'easy' | 'medium' | 'hard'
  cardRemovalCount: 0 | 2 | 4 | 6
}

type LobbyStatus = {
  modeLabel: string
  modeValue: string
  connectionState?: 'offline' | 'online' | 'local'
  scores?: { player: number; ai: number }
}

type DailyQuest = {
  title: string
  progress: number
  target: number
  rewardAsset?: string
}
```

## Tailwind System Direction

Define reusable lobby tokens instead of scattering custom values everywhere:

- `--lobby-bg`
- `--lobby-surface`
- `--lobby-surface-2`
- `--lobby-border`
- `--lobby-accent`
- `--lobby-accent-soft`
- `--lobby-text`
- `--lobby-text-dim`
- `--lobby-success`

Suggested reusable utility patterns:

- `.lobby-panel`
- `.lobby-tile`
- `.lobby-tile-active`
- `.lobby-ornament-frame`
- `.lobby-glow-red`
- `.lobby-stage-fade`
- `.lobby-button-primary`

## Motion Direction

- smoke should drift slowly with subtle opacity variation
- cards should float with low-amplitude vertical movement and slight rotation
- ember motion should stay lightweight and not dominate the screen
- selector hover and active states should feel sharp and game-like
- all non-essential motion should respect `prefers-reduced-motion`

## Implementation Strategy

1. Create an asset directory structure for lobby artwork:
   - `background/`
   - `character/`
   - `cards/`
   - `fx/`
   - `ornaments/`
   - `ui/`
2. Refactor the existing `SetupScreen` into a compositional `LobbyShell` structure
3. Move artwork composition into `LobbyScene`
4. Create reusable panel primitives and selectors
5. Keep the current reducer actions and lobby config behavior intact
6. Add supporting widgets without displacing the primary CTA
7. Tune desktop-first spacing, visual hierarchy, and responsive collapse behavior
8. Add or update tests for configuration selection and start-game interaction
9. Run lint, test, build, and a manual responsive verification pass

## Out of Scope

- multiplayer rooms
- matchmaking
- online presence systems
- network status workflows beyond placeholder-ready UI structure
- game rule changes unrelated to lobby presentation

## Risks and Mitigations

### Risk: The redesign drifts into a landing-page composition

Mitigation:
Keep the control panel dense, actionable, and always visually present. Avoid oversized marketing copy or CTA-only layouts.

### Risk: Artwork and UI become tightly coupled again

Mitigation:
Treat every scene element as an independent layer and render all game state in code.

### Risk: `SetupScreen` remains too monolithic after redesign

Mitigation:
Break scene, panel, and widgets into focused components with clear prop boundaries.

### Risk: Desktop-first design degrades badly on smaller devices

Mitigation:
Define a deliberate stacked mobile fallback rather than relying on scale reduction alone.

## Success Criteria

- The lobby reads as a playable game screen within a few seconds
- The left stage feels atmospheric without hiding the main interaction path
- The right panel clearly exposes current mode, difficulty, and card removal settings
- Artwork is independently swappable without rewriting panel logic
- The component structure is ready for future expansion without requiring a lobby rewrite
