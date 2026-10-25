/**
 * Greeting cards live entirely inside their link: the card is serialised, deflated and
 * base64url-encoded into the URL fragment. Fragments never reach a server, so nothing is
 * stored anywhere and GitHub Pages needs no backend.
 */

export const CARD_TEMPLATES = ['october', 'ember', 'frost', 'forever', 'ritual'] as const;
export type CardTemplate = (typeof CARD_TEMPLATES)[number];

export const CARD_LIMITS = { to: 40, from: 40, message: 360 } as const;

export interface CardData {
  readonly template: CardTemplate;
  readonly to: string;
  readonly from: string;
  readonly message: string;
}

/** URL fragment key that carries the card, as in `#c=<token>`. */
export const CARD_HASH_KEY = 'c';

const VERSION = 1;
/** Upper bound for a decoded card; refuses decompression bombs. */
const MAX_DECODED_BYTES = 8 * 1024;
const COMPRESSED = 'z';
const PLAIN = 'j';

interface Wire {
  v: number;
  t: string;
  o: string;
  f: string;
  m: string;
}

const isTemplate = (value: unknown): value is CardTemplate =>
  typeof value === 'string' && (CARD_TEMPLATES as readonly string[]).includes(value);

/** Trims to a number of characters without splitting emoji or accented letters. */
const clip = (text: string, max: number): string => Array.from(text).slice(0, max).join('');

function cleanLine(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  // Control characters (including newlines) have no place in a name.
  const text = value.normalize('NFC').replace(/\p{Cc}/gu, ' ');
  return clip(text.replace(/\s+/g, ' ').trim(), max);
}

function cleanMessage(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  const text = value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\P{Cc}\n]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return clip(text, max).trim();
}

/** Normalises untrusted input into a valid card. */
export function sanitizeCard(input: {
  readonly template?: unknown;
  readonly to?: unknown;
  readonly from?: unknown;
  readonly message?: unknown;
}): CardData {
  return {
    template: isTemplate(input.template) ? input.template : 'october',
    to: cleanLine(input.to, CARD_LIMITS.to),
    from: cleanLine(input.from, CARD_LIMITS.from),
    message: cleanMessage(input.message, CARD_LIMITS.message),
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  try {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

async function pipe(bytes: Uint8Array, transform: GenericTransformStream): Promise<Uint8Array> {
  const reader = new Blob([bytes as BlobPart]).stream().pipeThrough(transform).getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_DECODED_BYTES) {
      await reader.cancel();
      throw new RangeError('card payload too large');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

const canCompress = (): boolean =>
  typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

/** Serialises a card into a URL-safe token. */
export async function encodeCard(card: CardData): Promise<string> {
  const clean = sanitizeCard(card);
  const wire: Wire = {
    v: VERSION,
    t: clean.template,
    o: clean.to,
    f: clean.from,
    m: clean.message,
  };
  const json = new TextEncoder().encode(JSON.stringify(wire));
  if (!canCompress()) return PLAIN + toBase64Url(json);
  return COMPRESSED + toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
}

/** Restores a card from a token; `null` for anything malformed or tampered with. */
export async function decodeCard(token: string): Promise<CardData | null> {
  const kind = token.charAt(0);
  const bytes = fromBase64Url(token.slice(1));
  if (!bytes || bytes.byteLength > MAX_DECODED_BYTES) return null;
  try {
    let json: Uint8Array;
    if (kind === COMPRESSED && canCompress()) {
      json = await pipe(bytes, new DecompressionStream('deflate-raw'));
    } else if (kind === PLAIN) {
      json = bytes;
    } else {
      return null;
    }
    const wire = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(json)) as unknown;
    if (typeof wire !== 'object' || wire === null) return null;
    const { v, t, o, f, m } = wire as Partial<Wire>;
    if (v !== VERSION || !isTemplate(t)) return null;
    return sanitizeCard({ template: t, to: o, from: f, message: m });
  } catch {
    return null;
  }
}

/** Reads the card token from a URL fragment such as `#c=z…`. */
export function tokenFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const token = params.get(CARD_HASH_KEY);
  return token && token.length > 1 ? token : null;
}
