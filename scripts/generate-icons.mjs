/**
 * Generates the favicon set from the Vesperine emblem.
 * Run with `npm run assets:icons`; outputs are committed to `public/`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const INK = '#0b0705';
const GOLD = '#d2ab58';

const emblem = (stroke) => `
  <g fill="none" stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="60" cy="70" rx="33" ry="25" stroke-width="3"/>
    <ellipse cx="60" cy="70" rx="21" ry="25" stroke-width="2.4"/>
    <ellipse cx="60" cy="70" rx="8" ry="25" stroke-width="2.4"/>
    <path d="M60 45c0-6 1.6-10.5 6-14" stroke-width="3.4"/>
    <path d="M63 39c6-7 15-7 22-12-2 8-10 13-22 12Z" stroke-width="2.2"/>
  </g>`;

/** Rounded-square app icon; `padding` shrinks the emblem for maskable safe zones. */
const icon = (padding = 0) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="${padding ? 0 : 26}" fill="${INK}"/>
  <g transform="translate(${padding} ${padding}) scale(${(120 - padding * 2) / 120})">
    <circle cx="60" cy="60" r="52" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
    ${emblem(GOLD)}
  </g>
</svg>`;

await mkdir(`${root}icons`, { recursive: true });
await writeFile(`${root}favicon.svg`, icon());

const targets = [
  ['icons/favicon-32.png', 32, 0],
  ['icons/apple-touch-icon.png', 180, 0],
  ['icons/icon-192.png', 192, 0],
  ['icons/icon-512.png', 512, 0],
  ['icons/icon-maskable-512.png', 512, 14],
];

for (const [file, size, padding] of targets) {
  await sharp(Buffer.from(icon(padding)), { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(`${root}${file}`);
}

console.warn(`Generated ${targets.length + 1} icons in public/`);
