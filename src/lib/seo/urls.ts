import { DEFAULT_LOCALE, LOCALE_PATH, LOCALES, SITE_URL, type Locale } from '../../config/site.ts';

/** Resolves a site-relative path (no leading slash) into an absolute URL. */
export function absoluteUrl(path = ''): string {
  return new URL(path.replace(/^\/+/, ''), SITE_URL).href;
}

/** Canonical URL of a localized home page. */
export function localeUrl(locale: Locale): string {
  return absoluteUrl(LOCALE_PATH[locale]);
}

export interface Alternate {
  readonly hreflang: string;
  readonly href: string;
}

/** `hreflang` alternates for every locale plus `x-default`. */
export function alternates(): Alternate[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale, href: localeUrl(locale) })),
    { hreflang: 'x-default', href: localeUrl(DEFAULT_LOCALE) },
  ];
}
