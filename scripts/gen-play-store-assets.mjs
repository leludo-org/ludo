import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "play-store");
await mkdir(out, { recursive: true });

const CREAM = "#faf6ec";
const INK = "#1a1a1a";
const RED = "#d94c4c";
const GREEN = "#3f8a3f";
const BLUE = "#2f6fb8";
const YELLOW = "#d9a93a";

await sharp(resolve(root, "assets/icon.png"))
  .resize(512, 512, { fit: "cover" })
  .png()
  .toFile(resolve(out, "icon-512.png"));
console.log("✓ icon-512.png");

const LOGO = 380;
const LOGO_CX = 250;
const LOGO_CY = 250;

const logoBuf = await sharp(resolve(root, "assets/icon.png"))
  .resize(LOGO, LOGO, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#faf6ec"/>
      <stop offset="1" stop-color="#ecdfc1"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>

  <circle cx="60" cy="60" r="10" fill="${RED}" opacity="0.7"/>
  <circle cx="100" cy="440" r="14" fill="${YELLOW}" opacity="0.7"/>
  <circle cx="970" cy="80" r="14" fill="${BLUE}" opacity="0.7"/>
  <circle cx="960" cy="430" r="10" fill="${GREEN}" opacity="0.7"/>

  <text x="680" y="200" font-family="Helvetica, Arial, sans-serif" font-size="110" font-weight="900" fill="${INK}" letter-spacing="8" text-anchor="middle">LUDO</text>
  <text x="680" y="255" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600" fill="${INK}" letter-spacing="4" text-anchor="middle">ROLL · RACE · CAPTURE · WIN</text>

  <line x1="540" y1="295" x2="820" y2="295" stroke="${INK}" stroke-width="2" opacity="0.25"/>

  <g font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="500" fill="${INK}" text-anchor="middle">
    <text x="680" y="335">4 AI personalities · offline · ad-free</text>
    <text x="680" y="370" opacity="0.7" font-size="16">Quick games. Sharp bots. Clean board.</text>
  </g>
</svg>`;

const bgPng = await sharp(Buffer.from(bgSvg)).png().toBuffer();

await sharp(bgPng)
  .composite([
    {
      input: logoBuf,
      left: Math.round(LOGO_CX - LOGO / 2),
      top: Math.round(LOGO_CY - LOGO / 2),
    },
  ])
  .png()
  .toFile(resolve(out, "feature-graphic.png"));
console.log("✓ feature-graphic.png (1024×500)");

const adSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120">
  <rect width="180" height="120" fill="${CREAM}"/>
  <text x="90" y="58" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="900" fill="${INK}" letter-spacing="3" text-anchor="middle">LUDO</text>
  <text x="90" y="86" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="500" fill="${INK}" letter-spacing="2" text-anchor="middle">PLAY OFFLINE</text>
</svg>`;
await sharp(Buffer.from(adSvg)).png().toFile(resolve(out, "ad-banner-180x120.png"));
console.log("✓ ad-banner-180x120.png");

const SOCIAL_W = 1280;
const SOCIAL_H = 640;
const SOCIAL_LOGO = 460;
const SOCIAL_LOGO_CX = 320;
const SOCIAL_LOGO_CY = 320;

const socialLogoBuf = await sharp(resolve(root, "assets/icon.png"))
  .resize(SOCIAL_LOGO, SOCIAL_LOGO, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const socialSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_W}" height="${SOCIAL_H}" viewBox="0 0 ${SOCIAL_W} ${SOCIAL_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#faf6ec"/>
      <stop offset="1" stop-color="#ecdfc1"/>
    </linearGradient>
  </defs>
  <rect width="${SOCIAL_W}" height="${SOCIAL_H}" fill="url(#bg)"/>

  <circle cx="80" cy="80" r="14" fill="${RED}" opacity="0.7"/>
  <circle cx="130" cy="560" r="18" fill="${YELLOW}" opacity="0.7"/>
  <circle cx="1210" cy="100" r="18" fill="${BLUE}" opacity="0.7"/>
  <circle cx="1200" cy="555" r="14" fill="${GREEN}" opacity="0.7"/>

  <text x="850" y="265" font-family="Helvetica, Arial, sans-serif" font-size="150" font-weight="900" fill="${INK}" letter-spacing="12" text-anchor="middle">LUDO</text>
  <text x="850" y="330" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="${INK}" letter-spacing="5" text-anchor="middle">ROLL · RACE · CAPTURE · WIN</text>

  <line x1="650" y1="380" x2="1050" y2="380" stroke="${INK}" stroke-width="2" opacity="0.25"/>

  <g font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="500" fill="${INK}" text-anchor="middle">
    <text x="850" y="425">4 AI personalities · offline · ad-free</text>
    <text x="850" y="465" opacity="0.7" font-size="20">Quick games. Sharp bots. Clean board.</text>
  </g>

  <text x="850" y="555" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="600" fill="${INK}" letter-spacing="3" opacity="0.55" text-anchor="middle">github.com/leludo-org/ludo</text>
</svg>`;

const socialBgPng = await sharp(Buffer.from(socialSvg)).png().toBuffer();

await sharp(socialBgPng)
  .composite([
    {
      input: socialLogoBuf,
      left: Math.round(SOCIAL_LOGO_CX - SOCIAL_LOGO / 2),
      top: Math.round(SOCIAL_LOGO_CY - SOCIAL_LOGO / 2),
    },
  ])
  .png()
  .toFile(resolve(out, "social-preview-1280x640.png"));
console.log("✓ social-preview-1280x640.png");
