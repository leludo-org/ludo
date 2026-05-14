# Ludo

## Cache Busting

All JS files in `docs/components/` and `docs/scripts/` use content-hash filenames: `name.{hash}.js`.

**After editing any JS file, run `python3 cache-bust.py` from repo root.** This:
- Strips old checksums from filenames
- Computes new MD5-based 8-char hash (normalized to exclude import path checksums, so hashes are stable/idempotent)
- Renames files and updates all import/export references across JS and HTML

The script is idempotent — running it multiple times without edits produces no changes.
