/**
 * Renders the Open Graph images from the real WebGL scenes: the hero of each home page
 * and an opened greeting card for each card page.
 * Requires a running preview (`npm run build && npm run preview`).
 * Usage: node scripts/capture-og.mjs [baseUrl]
 */
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import sharp from 'sharp';

import { getDictionary } from '../src/i18n/index.ts';
import { encodeCard } from '../src/lib/card/payload.ts';

const base = process.argv[2] ?? 'http://127.0.0.1:4321/Pumpkin-Spice/';
const out = fileURLToPath(new URL('../public/og/', import.meta.url));
const LOCALES = { en: '', hu: 'hu/' };
const SAMPLE = { en: { to: 'Anna', from: 'Ben' }, hu: { to: 'Anna', from: 'Bence' } };

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

async function capture(url, ready, hide, file) {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector(ready, { timeout: 60_000 });
  await page.addStyleTag({ content: hide });
  await page.waitForTimeout(9000);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile(`${out}${file}`);
  await page.close();
}

for (const [locale, path] of Object.entries(LOCALES)) {
  await capture(
    `${base}${path}?quality=high`,
    '[data-webgl].is-ready',
    '.header, .progress, .hero__scroll, .cursor, .skip-link { display: none !important; }',
    `og-${locale}.jpg`,
  );

  const design = getDictionary(locale).card.designs[0];
  const token = await encodeCard({
    template: design.id,
    message: design.message,
    ...SAMPLE[locale],
  });
  await capture(
    `${base}${path}card/?quality=high#c=${token}`,
    '.is-live',
    '.bar, .panel, .stage__hint, .skip-link { display: none !important; } .stage__focus { inset: 1.5rem 2rem !important; }',
    `og-card-${locale}.jpg`,
  );
}

await browser.close();
console.warn('Open Graph images written to public/og/');
