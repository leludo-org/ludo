---
description: Audit codebase for dead code, duplication, and complexity; apply safe fixes on a new branch.
argument-hint: "[scope: optional path to limit scan, e.g. scripts/]"
allowed-tools: Bash, Read, Edit, Write, Agent, mcp__Claude_Preview__preview_start, mcp__Claude_Preview__preview_eval, mcp__Claude_Preview__preview_console_logs, mcp__Claude_Preview__preview_snapshot, mcp__Claude_Preview__preview_screenshot, mcp__Claude_Preview__preview_click, mcp__Claude_Preview__preview_stop
---

# Code-quality cleanup

LLM-written codebase. Refactor for clarity without changing behavior.
Scope: $ARGUMENTS (default: whole repo)

## Procedure

1. **Sync + branch.**
   ```bash
   git fetch origin main
   git checkout main && git pull origin main
   git checkout -b chore/code-quality-cleanup-$(date +%Y%m%d)
   ```
   If branch exists, append `-N`.

2. **Survey via Explore subagent.** Hunt for, within scope $ARGUMENTS:
   - Dead code: unused exports, unused functions, unused vars, unused imports, commented-out code, empty stub functions still being called
   - Duplication: repeated literal arrays/objects, copy-pasted regex/helpers across files, near-identical functions, same magic number in 2+ files
   - Stale references: leftover Tailwind class names, references to deleted files, "legacy" / "keep for compatibility" shims
   - Overly complex logic: deeply nested loops that can be split, redundant null checks after guards, manual loops that can collapse to `.map`/`.filter`
   - Magic literals: arrays/strings appearing 2+ times that deserve a named export
   - Inconsistency: `.slice()` vs `Array.from()`, `querySelector` vs `getElementById` for same target
   - Defensive cruft: try/catch swallowing real errors, fallbacks for impossible states, debug `console.log`/`console.debug`

   For each: file:line, one-sentence problem, concrete fix, confidence (high/medium/low). Group by category. Prioritize HIGH-confidence wins. No tests/docs/architecture rewrites.

3. **Verify every finding before editing.** Subagent reports drift. For each item: `grep` to confirm symbol, line numbers, usage count. Drop low-confidence items unless trivially verifiable.

4. **Create TaskList.** One task per cluster. Mark in_progress / completed as you go.

5. **Apply edits.** Smallest possible diffs. Preserve public API. Never rename exports unless every caller updated in same change.

6. **Run tests.**
   ```bash
   npm run test:run
   npm run test:e2e
   ```
   Both must pass. If fail: diagnose, fix, re-run. Don't disable tests.

7. **Browser-verify if UI-observable.** `preview_start` → load home → start game via URL override (`/?positions=50,,,,,,,,,,,,,,,&player=0`) → check console errors → screenshot proof → `preview_stop`.

8. **Report.** Summary table: file → LOC delta → category. Net additions vs deletions. Verification status. Show user the diff stat. **Do NOT commit unless user asks.**

## Guardrails

- Never delete code you haven't read.
- Never delete a stub if any caller still uses its return value or side effect — verify it's truly dead first.
- Never change function signatures, even "to clean up params" — that's behavior change.
- Never reformat unrelated lines (no trailing-whitespace fixes, no quote-style swaps).
- Never touch tests, configs, CI, package.json unless that IS the dead code.
- If a "duplicate" has subtly different semantics (e.g. different shadow filter in two SVG copies), leave both alone or ask user.
- Skip cosmetic naming nits.

## Output

End with: `Branch: <name>. <N> files, +<X>/-<Y> LOC. vitest <pass/fail>. e2e <pass/fail>. preview <pass/skipped>. Commit?`
