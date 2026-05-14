# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Ludo

Browser Ludo game. Vanilla JS + Web Components + Tailwind. No bundler — ES modules load directly via `<script type="module">`. GitHub Pages serves `docs/` as site root.

## Dev Commands

- `task dev` — runs `live-server` on `docs/` (port 8888) + `tailwindcss --watch` in parallel. Requires global install: `npm i -g live-server tailwindcss @go-task/cli`.
- Tests: open `http://localhost:8888/test/` in browser. QUnit suite in [docs/test/test.js](docs/test/test.js). No CLI test runner.
- `python3 cache-bust.py` — see Cache Busting below.

## Architecture

Two top-level module trees under `docs/`, each with an `index.*.js` barrel that re-exports its tree:

- **`docs/components/`** — Web Components (`wc-board`, `wc-token`, `wc-dice`, `wc-quick-start`, `wc-settings`, `wc-game-end`, etc.) + shared `utils`. Each custom element registers itself on import via `customElements.define`. The components barrel re-exports all.
- **`docs/scripts/`** — Game state machine and rendering. `game-logic` (pure functions: dice, mark index, capture detection, safe squares), `render-logic` (DOM/audio side effects), `game-events` (turn loop, input lock, assist flags, bot scheduling — main orchestrator, 500+ LOC), `bot-ai` (expectiminimax with personality-weighted scoring: `balanced`/`aggressive`/`defensive`/`rusher`), `bot-names`.

Entry points wired in [docs/index.html](docs/index.html): components index + scripts index. `wc-board` consumes the scripts barrel for game flow; `render-logic` imports `getMarkIndex` from `game-logic` via the scripts barrel.

Pure logic lives in `docs/scripts/game-logic.*.js` — keep it side-effect-free so tests can import it directly.

## Pause Model

`game-events` owns a `_paused` flag plus a `scheduleTurn(fn, delay)` helper. **Any bot or autoplay `setTimeout` in the turn flow must go through `scheduleTurn`** — that lets `pauseGameLogic()` clear in-flight timers and defer the next callback into `_pendingResume`, which `resumeGameLogic()` fires on resume. `handleDiceRoll` and `handleOnTokenMove` also early-return when paused.

Two surfaces pause the game today:
- The in-game pause button → `handleGamePause` (shows the pause overlay in `index.html`).
- Opening the settings overlay during a game → `wc-settings.openSettings` calls `pauseGameLogic` and remembers `_pausedBySettings` so closing settings resumes it.

If you add a new modal that overlays the game, decide whether it should pause; if yes, use the same pattern (call `pauseGameLogic` on open, `resumeGameLogic` on close).

## Full-Page Layout Shell

Home, setup, settings, and pause all share one layout pattern — keep new full-page screens consistent:

- Outer overlay (or `#root`) uses `flex items-start justify-center p-2`.
- Inner column: `max-w-96 w-full flex flex-col min-h-[calc(100vh-16px)]`.
- Top icon row: `flex items-center gap-2 pt-1 pb-6` with a 38×38 circle button (`CIRCLE_BTN` in `wc-quick-start`) on each side and a centered tracking-widest uppercase label.
- Middle content sits inside `flex-1 flex flex-col justify-center`.
- Primary CTA (`bg-foreground text-background` h-[60px] rounded-2xl) at the bottom of the column inside a `pt-4 pb-2` wrapper.

The game board (`wc-board`) uses the same outer min-height plus `flex-1` spacers above corner-row-top *and* below corner-row-bottom to vertically center the play area while keeping the top icon row aligned with the other screens.

## Test Overrides (URL Params)

`handleGameStart` in `docs/scripts/game-events.*.js` reads two query params for scenario testing — bypasses normal home-start:

- `?positions=p0t0,p0t1,p0t2,p0t3,p1t0,...,p3t3` — comma-separated token positions, indexed as `playerIndex * 4 + tokenIndex`. Values: `-1` (home), `0..50` (track), `51..56` (home stretch, `56` = finished). Missing/blank entries stay at `-1`.
- `?player=N` — force `currentPlayerIndex` (0..3) for first turn.

Example: `http://localhost:8888/?positions=50,,,,,,,,,,,,,,,&player=0` puts P0's first token one step from finish and gives P0 the opening turn. Preserve this behavior when refactoring game start.

## Cache Busting

All JS files in `docs/components/` and `docs/scripts/` use content-hash filenames: `name.{hash}.js`.

**After editing any JS file, run `python3 cache-bust.py` from repo root.** This:
- Strips old checksums from filenames
- Computes new MD5-based 8-char hash (normalized to exclude import path checksums, so hashes are stable/idempotent)
- Renames files and updates all import/export references across JS and HTML

The script is idempotent — running it multiple times without edits produces no changes. Also updates refs in `docs/index.html` and `docs/test/{index.html,test.js}`.

## Versioning

Single source of truth: `VERSION` constant in `docs/components/utils.*.js`. Consumed by `wc-quick-start` (landing footer) and `wc-settings` (about dialog) via the components barrel.

**Bump after any user-visible change.** Semver-ish:
- Patch (`0.X.Y+1`) — bug fix, polish, copy tweak
- Minor (`0.X+1.0`) — new feature, AI/UX change, gameplay logic
- Major (`X+1.0.0`) — breaking save format, full rewrite

Edit `VERSION` in utils, then run `python3 cache-bust.py`.

## Android (Capacitor)

The same `docs/` tree ships as a Capacitor Android app. Scripts in `package.json`:

- `npm run android:prepare` — runs `cache-bust.py`, syncs the version into Android via `scripts/sync-android-version.mjs`, then `cap sync android`.
- `npm run android:open` / `npm run android:run` — prepare + open/run in Android Studio.
- `npm run icons` — regenerates app icons via `scripts/gen-app-icons.mjs` + `@capacitor/assets`.

`capacitor.config.json` points `webDir` at `docs`, so anything that works in the browser ships to Android as long as cache-bust + version sync run first.
