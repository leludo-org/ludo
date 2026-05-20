# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Ludo

Browser Ludo game. Vanilla JS + Web Components + Tailwind. No bundler — ES modules load directly via `<script type="module">`. GitHub Pages serves the repo root as site root.

## Repo Layout

```
/
├── index.html, changelog.html, privacy.html, manifest.json, CNAME
├── input.css, output.css, tailwind.config.js
├── components/          Web Components (wc-board, wc-dice, …)
├── scripts/             game logic (game-events, game-logic, render-logic, bot-ai, bot-names)
├── assets/              shipped fonts, icons, sounds
├── test/                QUnit test suite
├── design/              source PNGs/SVGs for app icons
├── tools/               build helpers (all Node .mjs)
├── play-store/          generated store listing assets
├── www/                 (gitignored) Capacitor shipping dir, built by tools/build-www.mjs
└── android/             Capacitor Android project
```

## Dev Commands

- `npm install` (one-time).
- `npm run dev` — five-server on port 8888 + tailwindcss `--watch` in parallel.
- `npm test` — vitest watch mode. Unit + integration suite in `test/**/*.test.js`, mirrors source tree (e.g. [test/scripts/game-logic.test.js](test/scripts/game-logic.test.js) tests [scripts/game-logic.js](scripts/game-logic.js)). Runs in `happy-dom`. Integration tests under [test/integration/](test/integration/) drive full games via the pure [scripts/game-driver.js](scripts/game-driver.js).
- `npm run test:run` — single-shot vitest run (CI mode, exits when done).
- `npm run test:coverage` — coverage report (v8 provider) into `coverage/`.
- `npm run test:e2e` — Playwright smoke tests in [test/e2e/](test/e2e/). Spawns a static server via [tools/serve-static.mjs](tools/serve-static.mjs) on port 8889. Use `npm run test:e2e:ui` for the inspector.
- `npm run cache-bust` — see Cache Busting below.

## Architecture

Two top-level module trees at the repo root, each with an `index.*.js` barrel that re-exports its tree:

- **`components/`** — Web Components (`wc-board`, `wc-token`, `wc-dice`, `wc-quick-start`, `wc-settings`, `wc-game-end`, etc.) + shared `utils`. Each custom element registers itself on import via `customElements.define`. The components barrel re-exports all.
- **`scripts/`** — Game state machine and rendering.
  - `game-logic` — pure functions: dice, mark index, capture detection, safe squares.
  - `turn-rules` — pure: player rotation, end-game detection, leftover ranking, save/load serialization.
  - `bot-ai` — expectiminimax with personality-weighted scoring (`balanced`/`aggressive`/`defensive`/`rusher`).
  - `game-driver` — pure programmatic game loop that composes `game-logic` + `bot-ai` + `turn-rules` with a seedable RNG. Used by integration tests; no DOM.
  - `render-logic` — DOM/audio side effects.
  - `game-events` — turn orchestration, input lock, assist flags, bot scheduling. Thin glue between the pure modules and the DOM.
  - `bot-names` — name lists.

Entry points wired in [index.html](index.html): components index + scripts index. `wc-board` consumes the scripts barrel for game flow; `render-logic` imports `getMarkIndex` from `game-logic` via the scripts barrel.

Pure logic lives in `scripts/game-logic.js`, `scripts/turn-rules.js`, `scripts/bot-ai.js`, `scripts/game-driver.js` — keep these side-effect-free so tests can import them directly.

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

`handleGameStart` in `scripts/game-events.*.js` reads two query params for scenario testing — bypasses normal home-start:

- `?positions=p0t0,p0t1,p0t2,p0t3,p1t0,...,p3t3` — comma-separated token positions, indexed as `playerIndex * 4 + tokenIndex`. Values: `-1` (home), `0..50` (track), `51..56` (home stretch, `56` = finished). Missing/blank entries stay at `-1`.
- `?player=N` — force `currentPlayerIndex` (0..3) for first turn.

Example: `http://localhost:8888/?positions=50,,,,,,,,,,,,,,,&player=0` puts P0's first token one step from finish and gives P0 the opening turn. Preserve this behavior when refactoring game start.

## Cache Busting

A module service worker at [sw.js](sw.js) owns cache invalidation. JS filenames are canonical (`name.js`) — no content hashes.

How it works:
- SW imports `VERSION` from [version.js](version.js); cache name = `leludo-${VERSION}`.
- On install, it precaches the shell (HTML + CSS + every `components/*.js` and `scripts/*.js` + critical assets).
- On activate, old caches not matching the current name are deleted; `clients.claim()` takes over open tabs.
- Fetch strategy: network-first for HTML navigations (fresh shell on release), cache-first for everything else.
- Registered as a module SW (`type: 'module'`), so browsers diff `sw.js` AND its static imports — bumping `version.js` triggers an update.
- Registration is gated off on `localhost` / `127.0.0.1` to keep `npm run dev` simple.

**Release ritual: bump `VERSION` in [version.js](version.js). That's it.** Browsers detect the SW dependency change on next navigation, install the new SW, purge the old cache, and serve fresh assets.

If you add a new top-level file that must be cached offline, also add it to the `PRECACHE` array in [sw.js](sw.js).

## Versioning

Single source of truth: `VERSION` constant in [version.js](version.js). Consumed by `wc-quick-start` (landing footer), `wc-settings` (about dialog), and `sw.js` (cache name). The components barrel re-exports it.

**Bump after any user-visible change.** Semver-ish:
- Patch (`0.X.Y+1`) — bug fix, polish, copy tweak
- Minor (`0.X+1.0`) — new feature, AI/UX change, gameplay logic
- Major (`X+1.0.0`) — breaking save format, full rewrite

Edit `version.js`. No other steps for web. For Android, `npm run android:prepare` mirrors it into `build.gradle` via [tools/sync-android-version.mjs](tools/sync-android-version.mjs).

## Changelog

Public release notes live at [changelog.html](changelog.html). Newest entry on top.

**Every VERSION bump must add a changelog entry.** Copy the most recent `<article>` block, change the version + date, fill in the new content. Keep the layout shell (icon row, max-w-96, `bg-card` sections) consistent with `privacy.html`.

Minimum sections per entry:
- **Highlights** — short bullet list of user-visible changes.
- For Play Store releases only (versions actually shipped to a listing): also include **Play Store description — short** (≤80 chars) and **Play Store description — full** sections so the published copy stays in sync with the app.

## Android (Capacitor)

Capacitor's `webDir` is `www/`, which is **built** from the root by `tools/build-www.mjs` (copies `index.html`, `changelog.html`, `privacy.html`, `manifest.json`, `output.css`, `sw.js`, `version.js`, `components/`, `scripts/`, `assets/`). `www/` is gitignored.

Scripts in `package.json`:

- `npm run android:prepare` — version sync → build:www → `cap sync android`.
- `npm run android:open` / `npm run android:run` — prepare + open/run in Android Studio.

Anything that works in the browser ships to Android as long as `npm run android:prepare` runs first.
