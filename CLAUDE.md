# Claude Instructions

## Project
Vite + React 19 game app with:
- reducer-driven game state
- audio playback and autoplay unlock handling
- persistent `localStorage` state
- responsive gameplay UI
- Vitest + Testing Library

## Working Style
- Make small, targeted changes.
- Preserve existing behavior unless the user asks for a behavior change.
- Treat the reducer as the source of truth for game flow.
- Update logic, UI, and tests together when a change crosses layers.
- Prefer the smallest reasonable diff.

## Branching
- Use a dedicated branch for non-trivial work.
- Branch names should follow `codex/<short-topic>`.
- Do not rewrite unrelated branches.
- Do not force-push unless explicitly requested.

## Testing
### Before completion
Run the relevant checks before claiming the work is done:
- `npm test`
- `npm run lint`
- `npm run build`

### Add tests when you change
- reducer logic
- phase transitions
- audio unlock / mute / warning behavior
- persistence / `localStorage`
- interaction flows
- responsive behavior that can be tested

### Test standards
- Prefer behavior-focused tests.
- Keep tests deterministic.
- Mock browser APIs explicitly when needed.
- Do not rely on manual testing alone for logic changes.

## PR Expectations
A PR should include:
- a clear, scoped title
- a short description of what changed and why
- test / lint / build results
- screenshots or video for visible UI changes when useful

## Definition of Done
A task is done only when all of these are true:
- the requested behavior works
- the change is minimal and scoped
- relevant tests were added or updated
- `npm test` passes
- `npm run lint` passes
- `npm run build` passes
- UI / interaction changes were manually verified
- no unrelated files were modified
- the final response explains what changed and how it was verified

## Repo-Specific Rules
- Keep game transitions serialized; avoid overlapping phases.
- Respect autoplay restrictions and mute state in audio code.
- Avoid repeated warning sound spam.
- Prevent mobile overflow, clipping, and blocked controls.
- Respect `prefers-reduced-motion` where relevant.

## Editing Rules
- Prefer `apply_patch` for file edits.
- Do not use destructive git commands unless explicitly requested.
- Do not revert user changes you did not make.
- Keep comments short and only when needed.
- Default to ASCII unless the file already uses non-ASCII.