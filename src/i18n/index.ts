import { DEFAULT_LOCALE, LOCALES, type Locale } from '../config/site.ts';
import { en } from './en.ts';
import { hu } from './hu.ts';
import type { Dictionary } from './types.ts';

const DICTIONARIES: Record<Locale, Dictionary> = { en, hu };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary } from './types.ts';
