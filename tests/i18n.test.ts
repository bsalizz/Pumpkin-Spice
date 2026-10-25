import { describe, expect, it } from 'vitest';

import { LOCALES } from '../src/config/site.ts';
import { getDictionary, isLocale } from '../src/i18n/index.ts';
import { CARD_LIMITS, CARD_TEMPLATES } from '../src/lib/card/payload.ts';

/** Structural fingerprint: keys, array lengths and value types — not the copy itself. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]));
  }
  return typeof value;
}

describe('dictionaries', () => {
  const [reference, ...others] = LOCALES.map((locale) => getDictionary(locale));

  it('share exactly the same structure in every locale', () => {
    for (const dict of others) expect(shape(dict)).toEqual(shape(reference));
  });

  it('keep chapter moods in the same order so the 3D timeline matches', () => {
    const moods = LOCALES.map((locale) => getDictionary(locale).story.chapters.map((c) => c.mood));
    for (const list of moods) expect(list).toEqual(['october', 'ember', 'frost', 'forever']);
  });

  it('contain no empty strings', () => {
    for (const locale of LOCALES) {
      const strings = JSON.stringify(getDictionary(locale));
      expect(strings).not.toMatch(/""/);
    }
  });

  it('keep meta copy within search-result limits', () => {
    for (const locale of LOCALES) {
      const { title, description } = getDictionary(locale).meta;
      expect(title.length).toBeLessThanOrEqual(70);
      expect(description.length).toBeGreaterThanOrEqual(120);
      expect(description.length).toBeLessThanOrEqual(170);
    }
  });
});

describe('card copy', () => {
  it('offers every design in the same order as the payload templates', () => {
    for (const locale of LOCALES) {
      expect(getDictionary(locale).card.designs.map((design) => design.id)).toEqual([
        ...CARD_TEMPLATES,
      ]);
    }
  });

  it('keeps card meta copy within search-result limits', () => {
    for (const locale of LOCALES) {
      const { title, description } = getDictionary(locale).card.meta;
      expect(title.length).toBeLessThanOrEqual(70);
      expect(description.length).toBeGreaterThanOrEqual(120);
      expect(description.length).toBeLessThanOrEqual(170);
    }
  });

  it('keeps default messages within the message limit', () => {
    for (const locale of LOCALES) {
      for (const design of getDictionary(locale).card.designs) {
        expect(Array.from(design.message).length).toBeLessThanOrEqual(CARD_LIMITS.message);
      }
    }
  });
});

describe('isLocale', () => {
  it('accepts supported locales only', () => {
    expect(isLocale('hu')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
