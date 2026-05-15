#!/usr/bin/env node
// Populate www/ with files Capacitor should ship to the APK.
// Skips build-only inputs (input.css, tailwind.config.js), source design assets, tests, tools, etc.

import { rm, mkdir, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const www = resolve(root, 'www');

const SHIPPED = [
  'index.html',
  'changelog.html',
  'privacy.html',
  'manifest.json',
  'output.css',
  'components',
  'scripts',
  'assets',
];

await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });

for (const item of SHIPPED) {
  await cp(resolve(root, item), resolve(www, item), { recursive: true });
}

console.log(`Built www/ (${SHIPPED.length} entries)`);
