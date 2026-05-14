# Ludo

## Cache Busting

All JS files in `docs/components/` and `docs/scripts/` use content-hash filenames: `name.{hash}.js`.

**After editing any JS file, run `python3 cache-bust.py` from repo root.** This:
- Strips old checksums from filenames
- Computes new MD5-based 8-char hash (normalized to exclude import path checksums, so hashes are stable/idempotent)
- Renames files and updates all import/export references across JS and HTML

The script is idempotent — running it multiple times without edits produces no changes.

## Versioning

Version string lives in two places:
- `docs/components/wc-quick-start.*.js` — landing screen footer (`v0.X.Y`)
- `docs/components/wc-settings.*.js` — settings dialog (`0.X.Y`)

**Bump the version after any user-visible change.** Semver-ish:
- Patch (`0.X.Y+1`) — bug fix, polish, copy tweak
- Minor (`0.X+1.0`) — new feature, AI/UX change, gameplay logic
- Major (`X+1.0.0`) — breaking save format, full rewrite

Bump both files in one go, then run `python3 cache-bust.py`.
