#!/usr/bin/env node
// Open the QUnit test page in default browser. Assumes `npm run dev` is running.

import { spawn } from 'node:child_process';

const url = 'http://localhost:8888/test/';
const cmd = process.platform === 'darwin' ? 'open'
  : process.platform === 'win32' ? 'start'
  : 'xdg-open';

spawn(cmd, [url], { stdio: 'inherit', shell: process.platform === 'win32' });
