/**
 * Renders the Open Graph images from the real WebGL hero, one per locale.
 * Requires a running preview (`npm run build && npm run preview`).
 * Usage: node scripts/capture-og.mjs [baseUrl]
 */
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://127.0.0.1:4321/Pumpkin-Spice/';
const out = fileURLToPath(new URL('../public/og/', import.meta.url));
const LOCALES = { en: '', hu: 'hu/' };

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

for (const [locale, path] of Object.entries(LOCALES)) {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${base}${path}?quality=high`, { waitUntil: 'load' });
  await page.waitForSelector('[data-webgl].is-ready', { timeout: 30_000 });
  await page.addStyleTag({
    content: '.header, .progress, .hero__scroll, .cursor, .skip-link { display: none !important; }',
  });
  await page.waitForTimeout(9000);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png)
    .resize(1200, 630)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${out}og-${locale}.jpg`);
  await page.close();
}

await browser.close();
console.warn('Open Graph images written to public/og/');
