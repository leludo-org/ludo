#!/usr/bin/env node
// Render docs/assets/icons/favicon.svg into the PNG inputs that
// @capacitor/assets consumes. Run before `npx capacitor-assets generate`.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcSvg = resolve(root, 'docs/assets/icons/favicon.svg');
const outDir = resolve(root, 'assets');

const CREAM = { r: 0xfa, g: 0xf6, b: 0xec, alpha: 1 };
const ICON_SIZE = 1024;
const SPLASH_SIZE = 2732;
const FG_SAFE_FRACTION = 0.66; // adaptive icon safe zone

await mkdir(outDir, { recursive: true });
const svg = await readFile(srcSvg);

function renderSvg(size) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return r.render().asPng();
}

// 1. icon.png — legacy square launcher icon (full SVG)
const iconPng = renderSvg(ICON_SIZE);
await writeFile(resolve(outDir, 'icon.png'), iconPng);

// 2. icon-background.png — solid cream
const bg = await sharp({
  create: { width: ICON_SIZE, height: ICON_SIZE, channels: 4, background: CREAM },
}).png().toBuffer();
await writeFile(resolve(outDir, 'icon-background.png'), bg);

// 3. icon-foreground.png — SVG rendered at safe-zone size, centered on transparent
const fgInner = renderSvg(Math.round(ICON_SIZE * FG_SAFE_FRACTION));
const fgComposed = await sharp({
  create: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: fgInner, gravity: 'center' }])
  .png()
  .toBuffer();
await writeFile(resolve(outDir, 'icon-foreground.png'), fgComposed);

// 4. splash.png — cream bg with icon at 25% size, centered
const splashInner = renderSvg(Math.round(SPLASH_SIZE * 0.25));
const splash = await sharp({
  create: { width: SPLASH_SIZE, height: SPLASH_SIZE, channels: 4, background: CREAM },
})
  .composite([{ input: splashInner, gravity: 'center' }])
  .png()
  .toBuffer();
await writeFile(resolve(outDir, 'splash.png'), splash);

// 5. splash-dark.png — same as splash (game has no dark theme yet)
await writeFile(resolve(outDir, 'splash-dark.png'), splash);

console.log('Generated:', ['icon.png', 'icon-background.png', 'icon-foreground.png', 'splash.png', 'splash-dark.png']
  .map((f) => `assets/${f}`).join(', '));
