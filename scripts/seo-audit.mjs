/**
 * Post-build SEO & integrity audit. Fails the build (exit 1) on any violation so
 * a regression can never reach GitHub Pages.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'node-html-parser';

import { LOCALE_PATH, SITE as CONFIG, SITE_URL } from '../src/config/site.ts';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const ORIGIN = CONFIG.origin;
const BASE = `${CONFIG.base}/`;
const SITE = SITE_URL;
const LOCALES = LOCALE_PATH;

const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

/** Maps an absolute site URL or base-relative path to a file inside dist/. */
function toDistPath(url) {
  const path = url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : url;
  if (!path.startsWith(BASE)) return null;
  const clean = decodeURIComponent(path.slice(BASE.length).split(/[?#]/)[0] ?? '');
  const target = join(DIST, clean);
  return clean === '' || clean.endsWith('/') ? join(target, 'index.html') : target;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const htmlFiles = walk(DIST).filter((file) => file.endsWith('.html'));

/** Splits a built page into its locale and the page path below the locale root. */
function pageOf(name) {
  const path = name.replace(/index\.html$/, '');
  const [locale, root] = Object.entries(LOCALES)
    .filter(([, prefix]) => path.startsWith(prefix))
    .sort((a, b) => b[1].length - a[1].length)[0];
  return { locale, page: path.slice(root.length) };
}

const indexablePages = [];

for (const file of htmlFiles) {
  const name = relative(DIST, file);
  const { page } = pageOf(name);
  const root = parse(readFileSync(file, 'utf8'));
  const meta = (selector) => root.querySelector(selector)?.getAttribute('content') ?? '';
  const robots = meta('meta[name="robots"]');
  const indexable = !robots.includes('noindex');

  if (!root.querySelector('html')?.getAttribute('lang')) fail(name, 'missing <html lang>');
  if (!meta('meta[name="viewport"]')) fail(name, 'missing viewport meta');
  if (!root.querySelector('meta[charset]')) fail(name, 'missing charset');

  const title = root.querySelector('title')?.text.trim() ?? '';
  if (title.length < 20 || title.length > 70) fail(name, `title length ${title.length} (20–70)`);

  const description = meta('meta[name="description"]');
  if (description.length < 70 || description.length > 170) {
    fail(name, `description length ${description.length} (70–170)`);
  }

  const h1s = root.querySelectorAll('h1');
  if (h1s.length !== 1) fail(name, `expected exactly one <h1>, found ${h1s.length}`);

  for (const img of root.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) fail(name, `<img src="${img.getAttribute('src')}"> without alt`);
  }

  // Internal links, scripts and inlined CSS assets must resolve to a built file.
  const references = [
    ...root.querySelectorAll('a[href], link[href]').map((el) => el.getAttribute('href') ?? ''),
    ...root.querySelectorAll('script[src], img[src]').map((el) => el.getAttribute('src') ?? ''),
    ...root
      .querySelectorAll('style')
      .flatMap((style) => [...style.textContent.matchAll(/url\(([^)]+)\)/g)])
      .map((match) => (match[1] ?? '').replace(/['"]/g, '')),
  ];
  for (const reference of new Set(references)) {
    const target = toDistPath(reference);
    if (target && !existsSync(target)) fail(name, `broken internal reference ${reference}`);
  }

  if (!indexable) continue;
  indexablePages.push(name.replace(/index\.html$/, ''));

  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  if (!canonical.startsWith(SITE)) fail(name, `canonical "${canonical}" is not under ${SITE}`);
  if (canonical && !existsSync(toDistPath(canonical) ?? '')) fail(name, 'canonical target missing');

  const alternates = new Map(
    root
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
  );
  for (const [locale, path] of Object.entries(LOCALES)) {
    if (alternates.get(locale) !== `${SITE}${path}${page}`)
      fail(name, `hreflang "${locale}" missing/wrong`);
  }
  if (alternates.get('x-default') !== `${SITE}${page}`)
    fail(name, 'hreflang x-default missing/wrong');
  if (![...alternates.values()].includes(canonical)) fail(name, 'canonical not among hreflang set');

  for (const property of [
    'og:title',
    'og:description',
    'og:url',
    'og:image',
    'og:type',
    'og:locale',
  ]) {
    if (!meta(`meta[property="${property}"]`)) fail(name, `missing ${property}`);
  }
  for (const card of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!meta(`meta[name="${card}"]`)) fail(name, `missing ${card}`);
  }
  const ogImage = meta('meta[property="og:image"]');
  if (!existsSync(toDistPath(ogImage) ?? '')) fail(name, `og:image ${ogImage} not found in dist`);

  const types = new Set();
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent);
      for (const node of data['@graph'] ?? [data]) types.add(node['@type']);
    } catch (error) {
      fail(name, `invalid JSON-LD: ${error.message}`);
    }
  }
  const required =
    page === ''
      ? ['Organization', 'WebSite', 'WebPage', 'Product', 'FAQPage']
      : ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList'];
  for (const type of required) {
    if (!types.has(type)) fail(name, `JSON-LD lacks ${type}`);
  }
}

// Crawl infrastructure.
const robotsTxt = existsSync(join(DIST, 'robots.txt'))
  ? readFileSync(join(DIST, 'robots.txt'), 'utf8')
  : '';
if (!robotsTxt.includes(`Sitemap: ${SITE}sitemap-index.xml`))
  fail('robots.txt', 'missing Sitemap line');
if (!existsSync(join(DIST, 'sitemap-index.xml'))) fail('sitemap-index.xml', 'missing');

const sitemapFiles = readdirSync(DIST).filter((file) => /^sitemap-\d+\.xml$/.test(file));
const sitemap = sitemapFiles.map((file) => readFileSync(join(DIST, file), 'utf8')).join('\n');
for (const path of indexablePages) {
  if (!sitemap.includes(`<loc>${SITE}${path}</loc>`)) fail('sitemap', `missing ${SITE}${path}`);
}
if (!sitemap.includes('hreflang="hu"')) fail('sitemap', 'missing xhtml:link alternates');
if (sitemap.includes('404')) fail('sitemap', '404 page must not be listed');

try {
  const manifest = JSON.parse(readFileSync(join(DIST, 'manifest.webmanifest'), 'utf8'));
  for (const icon of manifest.icons ?? []) {
    if (!existsSync(toDistPath(icon.src) ?? '')) fail('manifest', `icon ${icon.src} missing`);
  }
} catch (error) {
  fail('manifest.webmanifest', error.message);
}

if (!existsSync(join(DIST, '.nojekyll')))
  fail('.nojekyll', 'missing (GitHub Pages would hide _astro/)');

if (errors.length > 0) {
  console.error(`\n✖ SEO audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

console.warn(`✓ SEO audit passed for ${htmlFiles.length} page(s).`);
