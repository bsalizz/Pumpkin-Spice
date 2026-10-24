/**
 * Single source of truth for deployment and brand constants.
 * Imported by `astro.config.mjs`, so it must stay free of Astro-only imports.
 */
export const SITE = {
  /** Origin of the GitHub Pages host (no trailing slash). */
  origin: 'https://bsalizz.github.io',
  /** Repository sub-path the site is served from (no trailing slash). */
  base: '/Pumpkin-Spice',
  brand: 'Vesperine',
  product: 'Pumpkin Spice Nº 31',
  themeColor: '#0b0705',
  twitter: '@vesperine',
  repository: 'https://github.com/bsalizz/Pumpkin-Spice',
  price: { amount: '310.00', currency: 'EUR' },
  edition: 1031,
} as const;

export const LOCALES = ['en', 'hu'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Absolute URL of the site root, always ending with a slash. */
export const SITE_URL = `${SITE.origin}${SITE.base}/`;

/** Path (relative to the site root, no leading slash) of each localized home page. */
export const LOCALE_PATH: Record<Locale, string> = {
  en: '',
  hu: 'hu/',
};

export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  hu: 'hu_HU',
};
