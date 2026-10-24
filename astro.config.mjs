// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { SITE } from './src/config/site.ts';

export default defineConfig({
  site: SITE.origin,
  base: SITE.base,
  trailingSlash: 'always',
  build: {
    // Critical CSS is small; inlining removes render-blocking requests.
    inlineStylesheets: 'always',
    format: 'directory',
    assets: '_astro',
  },
  compressHTML: true,
  prefetch: false,
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', hu: 'hu' },
      },
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
      priority: 1,
      lastmod: new Date(),
    }),
  ],
  vite: {
    build: {
      sourcemap: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 900,
    },
  },
});
