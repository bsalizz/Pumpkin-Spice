import type { APIRoute } from 'astro';

import { SITE } from '../config/site.ts';
import { en } from '../i18n/en.ts';

export const GET: APIRoute = () => {
  const base = `${SITE.base}/`;
  const manifest = {
    name: `${SITE.product} — ${SITE.brand}`,
    short_name: SITE.product,
    description: en.meta.description,
    lang: 'en',
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'portrait',
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `${base}icons/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
