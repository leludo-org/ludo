# Ludo

Browser Ludo game. Vanilla JS + Web Components + Tailwind. No bundler. Ships to web (GitHub Pages) and Android (Capacitor).

## Setup

```
npm install
```

## Dev

```
npm run dev
```

Live-server on http://localhost:8888 + Tailwind `--watch` in parallel.

Tests: open http://localhost:8888/test/ (QUnit).

## After Editing JS

Run cache-bust to update content-hash filenames + import refs:

```
npm run cache-bust
```

Idempotent — safe to re-run.

## Android (Capacitor)

```
npm run android:prepare   # cache-bust + version sync + build www/ + cap sync
npm run android:open      # opens Android Studio
npm run android:run       # runs on connected device/emulator
```

## Project Layout

See [CLAUDE.md](CLAUDE.md) for full repo layout and architecture notes.
