#!/usr/bin/env node
// Cache-bust: strip old checksums, compute new ones, rename files, update all references.
// Run from repo root after editing any JS file.

import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
process.chdir(root);

const DIRS = ['components', 'scripts'];
const EXTRA_REF_FILES = ['test/test.js', 'test/index.html'];
const CHECKSUM_RE = /^(.+)\.[a-f0-9]{8}\.js$/;
const IMPORT_CHECKSUM_RE = /\.[a-f0-9]{8}\.js/g;
const PATH_CHAR = '[A-Za-z0-9_./\\\\-]';

const stripChecksum = (fname) => {
  const m = CHECKSUM_RE.exec(fname);
  return m ? m[1] + '.js' : fname;
};

const computeHash = (content) => {
  const normalized = content.replace(IMPORT_CHECKSUM_RE, '.js');
  return createHash('md5').update(normalized).digest('hex').slice(0, 8);
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Step 1: Discover JS files, group by base (no checksum). Detect duplicates.
const currentFiles = new Map(); // base_path -> actual_path
const duplicates = [];
for (const d of DIRS) {
  const entries = readdirSync(d).filter((f) => f.endsWith('.js')).sort();
  for (const fname of entries) {
    const fullPath = join(d, fname);
    const basePath = join(d, stripChecksum(fname));
    if (currentFiles.has(basePath)) duplicates.push([currentFiles.get(basePath), fullPath]);
    currentFiles.set(basePath, fullPath);
  }
}

if (duplicates.length) {
  console.error('ERROR: duplicate base names on disk:');
  for (const [a, b] of duplicates) console.error(`  ${a} <-> ${b}`);
  process.exit(1);
}

// Step 2: Collect every file that may contain references
const allRefFiles = [];
for (const d of DIRS) {
  for (const fname of readdirSync(d).filter((f) => f.endsWith('.js')).sort()) {
    allRefFiles.push(join(d, fname));
  }
}
allRefFiles.push('index.html');
for (const f of EXTRA_REF_FILES) if (existsSync(f)) allRefFiles.push(f);
const seenRef = new Set();
const refFiles = allRefFiles.filter((p) => (seenRef.has(p) ? false : (seenRef.add(p), true)));

// Step 3: Read once, compute hashes from normalized content
const fileContents = new Map();
for (const p of refFiles) fileContents.set(p, readFileSync(p, 'utf8'));

const dirNewNames = new Map(); // `${dir}|${base}` -> new_fname
const renameMap = new Map();
for (const [basePath, oldPath] of currentFiles) {
  const d = dirname(basePath);
  const base = basename(basePath);
  const name = base.slice(0, -3);
  const h = computeHash(fileContents.get(oldPath));
  const newFname = `${name}.${h}.js`;
  renameMap.set(oldPath, join(d, newFname));
  dirNewNames.set(`${d}|${base}`, newFname);
}

// Step 4: Build anchored replacements (avoid partial-path collisions)
const replacements = []; // { pat, repl, scope }
for (const [key, newFname] of dirNewNames) {
  const [dirShort, base] = key.split('|');
  const scope = dirShort;
  for (const [oldFrag, newFrag, sc] of [
    [`${dirShort}/${base}`, `${dirShort}/${newFname}`, null],
    [`./${base}`, `./${newFname}`, scope],
    [`../${dirShort}/${base}`, `../${dirShort}/${newFname}`, null],
  ]) {
    const pat = new RegExp(`(?<!${PATH_CHAR})${escapeRegex(oldFrag)}(?!${PATH_CHAR})`, 'g');
    replacements.push({ pat, repl: newFrag, scope: sc });
  }
}

// Step 5: Strip old hashes, inject new ones, write only on change
let updated = 0;
for (const filepath of refFiles) {
  const original = fileContents.get(filepath);
  let content = original.replace(IMPORT_CHECKSUM_RE, '.js');
  const filedir = dirname(filepath);
  for (const { pat, repl, scope } of replacements) {
    if (scope && filedir !== scope) continue;
    content = content.replace(pat, repl);
  }
  if (content !== original) {
    writeFileSync(filepath, content);
    updated++;
  }
}

// Step 6: Rename files on disk
let renamed = 0;
const sortedRenames = [...renameMap.entries()].sort(([a], [b]) => a.localeCompare(b));
for (const [oldPath, newPath] of sortedRenames) {
  if (oldPath !== newPath) {
    renameSync(oldPath, newPath);
    renamed++;
  }
}

console.log(`Cache-bust: renamed ${renamed} file(s), updated refs in ${updated} file(s).`);
for (const [oldPath, newPath] of sortedRenames) {
  if (oldPath !== newPath) {
    console.log(`  ${oldPath.padEnd(55, '.')} ${basename(newPath)}`);
  }
}
