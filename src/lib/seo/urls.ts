import { DEFAULT_LOCALE, LOCALE_PATH, LOCALES, SITE_URL, type Locale } from '../../config/site.ts';

/** Resolves a site-relative path (no leading slash) into an absolute URL. */
export function absoluteUrl(path = ''): string {
  return new URL(path.replace(/^\/+/, ''), SITE_URL).href;
}

/**
 * Canonical URL of a localized page. `page` is relative to the locale root and ends
 * with a slash (`card/`); empty for the home page.
 */
export function localeUrl(locale: Locale, page = ''): string {
  return absoluteUrl(`${LOCALE_PATH[locale]}${page}`);
}

export interface Alternate {
  readonly hreflang: string;
  readonly href: string;
}

/** `hreflang` alternates of a page for every locale plus `x-default`. */
export function alternates(page = ''): Alternate[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale, href: localeUrl(locale, page) })),
    { hreflang: 'x-default', href: localeUrl(DEFAULT_LOCALE, page) },
  ];
}
