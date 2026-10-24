import { describe, expect, it } from 'vitest';

import { absoluteUrl, alternates, localeUrl } from '../src/lib/seo/urls.ts';

describe('absoluteUrl', () => {
  it('resolves paths under the GitHub Pages base', () => {
    expect(absoluteUrl()).toBe('https://bsalizz.github.io/Pumpkin-Spice/');
    expect(absoluteUrl('og/og-en.jpg')).toBe(
      'https://bsalizz.github.io/Pumpkin-Spice/og/og-en.jpg',
    );
  });

  it('never escapes the base path through a leading slash', () => {
    expect(absoluteUrl('/hu/')).toBe('https://bsalizz.github.io/Pumpkin-Spice/hu/');
  });
});

describe('alternates', () => {
  it('lists every locale plus x-default pointing at English', () => {
    expect(alternates()).toEqual([
      { hreflang: 'en', href: localeUrl('en') },
      { hreflang: 'hu', href: 'https://bsalizz.github.io/Pumpkin-Spice/hu/' },
      { hreflang: 'x-default', href: 'https://bsalizz.github.io/Pumpkin-Spice/' },
    ]);
  });
});
