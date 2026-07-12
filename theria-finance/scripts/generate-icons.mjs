// Generates the PWA icon set into public/ from an inline SVG that mirrors
// the Theria Finance logomark ("Theria Finance Logo.png" at the repo root;
// see also src/shared/components/TheriaBrandLogo.tsx and public/logo.svg).
// Run once (and re-run after branding changes): node scripts/generate-icons.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');

// Theria Finance logomark (275x310 viewBox), matching TheriaBrandLogo.tsx.
const LOGO_W = 275;
const LOGO_H = 310;
const LOGO_CONTENT = `
  <g fill="none" stroke="#878787" stroke-width="33" stroke-linecap="round" stroke-linejoin="round">
    <path d="M104 27 L31 89 L31 182"/>
    <path d="M171 283 L244 221 L244 128"/>
  </g>
  <path d="M125 91 L210 91 L195 122 L130 122 L130 152 L185 152 L170 183 L130 183 L130 228 L100 242 L100 112 Z"
        fill="#2A633A" stroke="#2A633A" stroke-width="7" stroke-linejoin="round"/>
`;

// glyphScale = fraction of the canvas height the logomark is scaled to fill.
function brandSvg({ size, cornerRadius, glyphScale }) {
  const glyphH = size * glyphScale;
  const glyphW = glyphH * (LOGO_W / LOGO_H);
  const scale = glyphH / LOGO_H;
  const ox = (size - glyphW) / 2;
  const oy = (size - glyphH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#FFFFFF"/>
  <g transform="translate(${ox} ${oy}) scale(${scale})">
    ${LOGO_CONTENT}
  </g>
</svg>`;
}

// Rounded-corner icon (transparent corners) for favicon + manifest "any" icons.
const roundedIcon = (size) => brandSvg({ size, cornerRadius: size * 0.24, glyphScale: 0.66 });
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
await render(fullBleedIcon(512, 0.56), 512, path.join(iconsDir, 'maskable-512.png'));
await render(fullBleedIcon(180, 0.62), 180, path.join(iconsDir, 'apple-touch-icon.png'));
