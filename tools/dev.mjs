#!/usr/bin/env node
// Dev: run live-server (port 8888) + tailwindcss --watch in parallel.

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const procs = [
  spawn('npx', ['live-server', '--port=8888', '--open=/'], { cwd: root, stdio: 'inherit' }),
  spawn('npx', ['tailwindcss', '-c', 'tailwind.config.js', '-i', 'input.css', '-o', 'output.css', '--watch'], { cwd: root, stdio: 'inherit' }),
];

const shutdown = () => {
  for (const p of procs) if (!p.killed) p.kill('SIGTERM');
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

for (const p of procs) p.on('exit', (code) => { if (code !== 0) shutdown(); });
