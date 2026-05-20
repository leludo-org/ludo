#!/usr/bin/env node
// Dev: serve the repo root via five-server on port 8888. No build step —
// browsers load CSS + ES modules directly.

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const proc = spawn('npx', ['five-server', '--port=8888', '--open=/'], { cwd: root, stdio: 'inherit' });

const shutdown = () => {
  if (!proc.killed) proc.kill('SIGTERM');
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

proc.on('exit', (code) => { if (code !== 0) shutdown(); });
