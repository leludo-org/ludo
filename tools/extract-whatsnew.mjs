#!/usr/bin/env node
// Extract the Highlights bullets for the current VERSION from changelog.html
// and write them to distribution/whatsnew/whatsnew-en-US.txt for the Play Store
// upload step. Play Store caps each "What's new" locale at 500 chars.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_LEN = 500;
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const versionSrc = await readFile(resolve(root, 'version.js'), 'utf8');
const vMatch = versionSrc.match(/export\s+const\s+VERSION\s*=\s*["']([^"']+)["']/);
if (!vMatch) throw new Error('VERSION constant not found in version.js');
const version = vMatch[1];

const changelog = await readFile(resolve(root, 'changelog.html'), 'utf8');

const articles = [...changelog.matchAll(/<article>([\s\S]*?)<\/article>/g)].map((m) => m[1]);
const target = articles.find((body) => new RegExp(`>v${version.replace(/\./g, '\\.')}<`).test(body));
if (!target) throw new Error(`No changelog article found for v${version}`);

const highlightsBlock = target.match(/Highlights[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
if (!highlightsBlock) throw new Error(`No Highlights <ul> in v${version} article`);

const bullets = [...highlightsBlock[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
  .map((m) => decodeEntities(stripTags(m[1])).trim())
  .filter(Boolean);

if (bullets.length === 0) throw new Error(`No <li> bullets in v${version} Highlights`);

let text = bullets.map((b) => `• ${b}`).join('\n');
if (text.length > MAX_LEN) {
  text = text.slice(0, MAX_LEN - 1).trimEnd() + '…';
}

const outDir = resolve(root, 'distribution/whatsnew');
await mkdir(outDir, { recursive: true });
const outPath = resolve(outDir, 'whatsnew-en-US.txt');
await writeFile(outPath, text + '\n');

console.log(`whatsnew v${version} (${text.length} chars) → ${outPath}`);

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

function decodeEntities(s) {
  return s
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}
