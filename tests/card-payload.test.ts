import { describe, expect, it } from 'vitest';

import {
  CARD_LIMITS,
  decodeCard,
  encodeCard,
  sanitizeCard,
  tokenFromHash,
  type CardData,
} from '../src/lib/card/payload.ts';

const card: CardData = {
  template: 'frost',
  to: 'Anna',
  from: 'Bence',
  message: 'Még mindig két csészét töltök. 🍂\nMinden októberben.',
};

describe('card payload', () => {
  it('round-trips through a URL-safe token, accents and emoji included', async () => {
    const token = await encodeCard(card);
    expect(token).toMatch(/^[zj][A-Za-z0-9_-]+$/);
    expect(await decodeCard(token)).toEqual(card);
  });

  it('keeps a full-length message within a shareable link', async () => {
    const token = await encodeCard({ ...card, message: 'ő'.repeat(CARD_LIMITS.message) });
    expect(token.length).toBeLessThan(2000);
  });

  it('rejects tampered, foreign or empty tokens', async () => {
    const token = await encodeCard(card);
    expect(await decodeCard(`${token.slice(0, -4)}AAAA`)).toBeNull();
    expect(await decodeCard('x' + token.slice(1))).toBeNull();
    expect(await decodeCard('z<script>')).toBeNull();
    expect(await decodeCard('')).toBeNull();
  });

  it('refuses payloads that inflate beyond the size limit', async () => {
    const huge = new TextEncoder().encode(
      JSON.stringify({ v: 1, t: 'october', o: '', f: '', m: 'a'.repeat(20_000) }),
    );
    const stream = new Blob([huge]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    const token =
      'z' +
      btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    expect(await decodeCard(token.replace(/=+$/, ''))).toBeNull();
  });
});

describe('sanitizeCard', () => {
  it('falls back to a known template and strips control characters', () => {
    expect(
      sanitizeCard({ template: 'nope', to: ' A\u0000n\nna ', from: 42, message: 'a\r\n\n\n\nb' }),
    ).toEqual({ template: 'october', to: 'A n na', from: '', message: 'a\n\nb' });
  });

  it('clips by characters without splitting emoji', () => {
    const clipped = sanitizeCard({ to: '🎃'.repeat(CARD_LIMITS.to + 5) }).to;
    expect(Array.from(clipped)).toHaveLength(CARD_LIMITS.to);
  });
});

describe('tokenFromHash', () => {
  it('reads the token from the fragment', () => {
    expect(tokenFromHash('#c=zAbc')).toBe('zAbc');
    expect(tokenFromHash('#story')).toBeNull();
    expect(tokenFromHash('')).toBeNull();
  });
});
