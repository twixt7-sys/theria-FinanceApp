// Generates the PWA icon set into public/ from an inline SVG that mirrors
// TheriaBrandLogo.tsx (lucide Wallet on the emerald brand gradient).
// Run once (and re-run after branding changes): node scripts/generate-icons.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');

// Lucide "wallet" glyph (24x24 viewBox), matching TheriaBrandLogo.tsx.
const WALLET_PATHS = `
  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
`;

// glyphScale = fraction of the canvas the 24px glyph is scaled to fill.
function brandSvg({ size, cornerRadius, glyphScale }) {
  const glyphSize = size * glyphScale;
  const offset = (size - glyphSize) / 2;
  const scale = glyphSize / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10B981"/>
      <stop offset="0.6" stop-color="#10B981"/>
      <stop offset="1" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.3"/>
      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#sheen)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})"
     fill="none" stroke="#FFFFFF" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
    ${WALLET_PATHS}
  </g>
</svg>`;
}

// Rounded-corner icon (transparent corners) for favicon + manifest "any" icons.
const roundedIcon = (size) => brandSvg({ size, cornerRadius: size * 0.24, glyphScale: 0.56 });
// Full-bleed icon for maskable (Android masks it) and apple-touch-icon (iOS rounds it).
const fullBleedIcon = (size, glyphScale) => brandSvg({ size, cornerRadius: 0, glyphScale });

async function render(svg, size, file) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log('wrote', path.relative(root, file));
}

await mkdir(iconsDir, { recursive: true });
await writeFile(path.join(publicDir, 'favicon.svg'), roundedIcon(64));
console.log('wrote public/favicon.svg');
await render(roundedIcon(192), 192, path.join(iconsDir, 'pwa-192.png'));
await render(roundedIcon(512), 512, path.join(iconsDir, 'pwa-512.png'));
// Keep the glyph inside the maskable safe zone (~central 80%).
await render(fullBleedIcon(512, 0.46), 512, path.join(iconsDir, 'maskable-512.png'));
await render(fullBleedIcon(180, 0.52), 180, path.join(iconsDir, 'apple-touch-icon.png'));
