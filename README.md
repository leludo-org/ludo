# Ludo

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Browser Ludo game. Vanilla JS + Web Components + Tailwind. No bundler. Ships to web ([leludo.org](https://leludo.org)) and Android via Capacitor.

Play offline. Four AI personalities (`balanced`, `aggressive`, `defensive`, `rusher`). No ads, no tracking, no accounts.

## Setup

```bash
npm install
```

## Develop

```bash
npm run dev      # five-server on :8888 + tailwindcss --watch
npm test         # opens the QUnit test page (needs dev running)
```

Open <http://localhost:8888> for the game, <http://localhost:8888/test/> for tests.

## After editing JS

Filenames carry a content hash. Run cache-bust to refresh hashes + import refs:

```bash
npm run cache-bust
```

Idempotent — safe to re-run.

## Android (Capacitor)

```bash
npm run android:prepare   # cache-bust + version sync + build www/ + cap sync
npm run android:open      # open in Android Studio
npm run android:run       # run on connected device or emulator
```

## Project layout & architecture

See [CLAUDE.md](CLAUDE.md) for the full repo map, pause model, cache-busting flow, and Android pipeline.

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the house rules.

## License

GPL-3.0-or-later — see [LICENSE](LICENSE).

Copyright © 2024 Vishal Gidwani.

You can fork it, modify it, ship it. Derivative works (including web deployments and mobile builds) must remain under GPL-3.0 and ship source. No proprietary closed-source forks.

## Credits

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for fonts, libraries, and third-party assets.
