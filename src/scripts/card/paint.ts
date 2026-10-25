import type { CardTheme } from './themes.ts';

/**
 * A printed face of the card: what the eye sees (`color`) and how the stock
 * responds to light (`surface`: green = roughness, blue = metalness, as three.js
 * reads them). Foil is drawn into both, so it shines where it is printed.
 */
export interface Face {
  readonly color: HTMLCanvasElement;
  readonly surface: HTMLCanvasElement;
}

/** Card faces are 1 : 1.4, like a folded A6. */
export const CARD_ASPECT = 1.4;

const MATTE = 'rgb(0, 232, 0)';
const GLOSS = 'rgb(0, 96, 0)';
const FOIL = 'rgb(0, 72, 210)';

const SERIF = '"Cormorant Garamond", Garamond, "Times New Roman", serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = 'Anton, Impact, "Arial Narrow", sans-serif';

/** The fonts the painters use; wait for them before the first paint. */
export const CARD_FONTS = [
  `italic 500 64px ${SERIF}`,
  `italic 300 64px ${SERIF}`,
  `32px ${MONO}`,
  `48px ${DISPLAY}`,
];

type Context = CanvasRenderingContext2D;

/** Paints on the colour and the surface canvas at once. */
class Sheet {
  readonly width: number;
  readonly height: number;
  private readonly face: Face;
  private readonly color: Context;
  private readonly surface: Context;

  constructor(width: number, face?: Face) {
    this.width = width;
    this.height = Math.round(width * CARD_ASPECT);
    this.face = face ?? createFace(width);
    this.color = context(this.face.color);
    this.surface = context(this.face.surface);
  }

  get result(): Face {
    return this.face;
  }

  /** Runs `draw` on both canvases; `surface` is true on the light-response pass. */
  both(draw: (ctx: Context, surface: boolean) => void): void {
    for (const [ctx, surface] of [
      [this.color, false],
      [this.surface, true],
    ] as const) {
      ctx.save();
      // The surface map is stored at a lower resolution; draw in colour-map units.
      ctx.scale(ctx.canvas.width / this.width, ctx.canvas.height / this.height);
      draw(ctx, surface);
      ctx.restore();
    }
  }

  paper(theme: CardTheme, grain: HTMLCanvasElement): void {
    this.color.fillStyle = theme.paper;
    this.color.fillRect(0, 0, this.width, this.height);
    const pattern = this.color.createPattern(grain, 'repeat');
    if (pattern) {
      this.color.save();
      this.color.globalAlpha = 0.07;
      this.color.globalCompositeOperation = 'multiply';
      this.color.fillStyle = pattern;
      this.color.fillRect(0, 0, this.width, this.height);
      this.color.restore();
    }
    this.surface.fillStyle = MATTE;
    this.surface.fillRect(0, 0, this.surface.canvas.width, this.surface.canvas.height);
  }

  /** Draws a photograph into a path, cropped to cover it; printed on glossy stock. */
  photo(image: HTMLImageElement | null, theme: CardTheme, shape: (ctx: Context) => void): void {
    const { width, height } = this;
    this.both((ctx, surface) => {
      shape(ctx);
      ctx.clip();
      if (surface) {
        ctx.fillStyle = GLOSS;
        ctx.fillRect(0, 0, width, height);
        return;
      }
      ctx.fillStyle = theme.wash;
      ctx.fillRect(0, 0, width, height);
      if (image) drawCover(ctx, image, 0, 0, width, height);
    });
  }

  /**
   * Foil ink: gilded on the colour pass, metallic on the surface pass. `onPhoto` uses the
   * light foil with a soft shadow under it, so it reads on top of a photograph.
   */
  foil(theme: CardTheme, draw: (ctx: Context) => void, onPhoto = false): void {
    const base = onPhoto ? theme.foil : theme.print;
    const { width, height } = this;
    this.both((ctx, surface) => {
      if (surface) {
        ctx.fillStyle = FOIL;
        ctx.strokeStyle = FOIL;
      } else {
        if (onPhoto) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = width * 0.014;
          ctx.shadowOffsetY = width * 0.002;
        }
        const sheen = ctx.createLinearGradient(0, 0, width, height);
        sheen.addColorStop(0, shade(base, 1.18));
        sheen.addColorStop(0.5, base);
        sheen.addColorStop(1, shade(base, 0.78));
        ctx.fillStyle = sheen;
        ctx.strokeStyle = sheen;
      }
      draw(ctx);
    });
  }

  ink(draw: (ctx: Context) => void): void {
    this.color.save();
    draw(this.color);
    this.color.restore();
  }
}

/**
 * A blank face to paint into; repainting reuses its canvases. Roughness and metalness
 * vary slowly across the card, so their map is kept at half resolution.
 */
export function createFace(width: number): Face {
  const height = Math.round(width * CARD_ASPECT);
  return {
    color: canvas(width, height),
    surface: canvas(Math.round(width / 2), Math.round(height / 2)),
  };
}

function canvas(width: number, height: number): HTMLCanvasElement {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  return element;
}

function context(element: HTMLCanvasElement): Context {
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return ctx;
}

/** Scales a hex colour's brightness. */
function shade(hex: string, factor: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number): number =>
    Math.min(255, Math.round(((value >> shift) & 255) * factor));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function drawCover(
  ctx: Context,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h);
}

/** Writes in ink, with a hairline stroke so thin italics survive texture filtering. */
function write(ctx: Context, text: string, x: number, y: number, size: number): void {
  ctx.lineWidth = size * 0.022;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ctx.fillStyle;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function setSpacing(ctx: Context, em: number, size: number): void {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${em * size}px`;
}

/** Splits text into lines that fit `maxWidth`, honouring explicit line breaks. */
export function wrapText(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // A single word wider than the column is broken by characters.
      line = '';
      for (const char of Array.from(word)) {
        if (line && measure(line + char) > maxWidth) {
          lines.push(line);
          line = '';
        }
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Largest font size (down to `min`) at which the wrapped text fits the box. */
function fitText(
  ctx: Context,
  text: string,
  font: (size: number) => string,
  box: { width: number; height: number; size: number; min: number; leading: number },
): { size: number; lines: string[] } {
  let size = box.size;
  for (;;) {
    ctx.font = font(size);
    const lines = wrapText((value) => ctx.measureText(value).width, text, box.width);
    if (lines.length * size * box.leading <= box.height || size <= box.min) return { size, lines };
    size = Math.max(box.min, size * 0.93);
  }
}

function frame(ctx: Context, inset: number, width: number, height: number, line: number): void {
  ctx.lineWidth = line;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  // Small diamonds at the corners, like a letterpress border.
  const r = line * 3.2;
  for (const [x, y] of [
    [inset, inset],
    [width - inset, inset],
    [inset, height - inset],
    [width - inset, height - inset],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    ctx.fill();
  }
}

function rule(ctx: Context, cx: number, y: number, half: number, line: number): void {
  ctx.fillRect(cx - half, y - line / 2, half - line * 4, line);
  ctx.fillRect(cx + line * 4, y - line / 2, half - line * 4, line);
  ctx.beginPath();
  ctx.moveTo(cx, y - line * 2.4);
  ctx.lineTo(cx + line * 2.4, y);
  ctx.lineTo(cx, y + line * 2.4);
  ctx.lineTo(cx - line * 2.4, y);
  ctx.closePath();
  ctx.fill();
}

/** A pumpkin drawn in a few strokes, used as the brand mark. */
function pumpkinMark(ctx: Context, cx: number, cy: number, size: number): void {
  ctx.lineWidth = size * 0.045;
  for (const [offset, radius] of [
    [0, 0.34],
    [-0.2, 0.26],
    [0.2, 0.26],
  ] as const) {
    ctx.beginPath();
    ctx.ellipse(cx + offset * size, cy, radius * size, 0.3 * size, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy - 0.3 * size);
  ctx.quadraticCurveTo(cx + 0.02 * size, cy - 0.46 * size, cx + 0.12 * size, cy - 0.52 * size);
  ctx.stroke();
}

export interface CoverInput {
  readonly theme: CardTheme;
  readonly photo: HTMLImageElement | null;
  readonly headline: string;
  readonly to: string;
  readonly brand: string;
  readonly product: string;
}

export function paintCover(width: number, input: CoverInput, face?: Face): Face {
  const sheet = new Sheet(width, face);
  const { width: w, height: h } = sheet;
  const { theme } = input;

  sheet.paper(theme, grainCanvas());
  sheet.photo(input.photo, theme, (ctx) => ctx.rect(0, 0, w, h));
  sheet.ink((ctx) => {
    const wash = ctx.createLinearGradient(0, h, 0, 0);
    wash.addColorStop(0, theme.wash);
    wash.addColorStop(0.5, theme.wash.replace(/[\d.]+\)$/, '0.35)'));
    wash.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
    wash.addColorStop(1, theme.wash.replace(/[\d.]+\)$/, '0.45)'));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
  });

  sheet.foil(
    theme,
    (ctx) => {
      frame(ctx, w * 0.05, w, h, w * 0.0035);

      const brandSize = w * 0.032;
      ctx.font = `${brandSize}px ${MONO}`;
      setSpacing(ctx, 0.5, brandSize);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(input.brand.toUpperCase(), w / 2, h * 0.1);

      const lines = input.headline.split('\n');
      setSpacing(ctx, 0, 0);
      let size = w * 0.13;
      ctx.font = `italic 500 ${size}px ${SERIF}`;
      const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
      size *= Math.min(1, (w * 0.8) / widest);
      ctx.font = `italic 500 ${size}px ${SERIF}`;
      const leading = size * 0.98;
      const top = h * 0.79 - leading * (lines.length - 1);
      lines.forEach((line, index) => ctx.fillText(line, w / 2, top + index * leading));

      if (input.to) {
        const nameSize = w * 0.036;
        ctx.font = `${nameSize}px ${MONO}`;
        setSpacing(ctx, 0.35, nameSize);
        ctx.fillText(`— ${input.to.toUpperCase()} —`, w / 2, h * 0.865);
      }

      const productSize = w * 0.04;
      ctx.font = `${productSize}px ${DISPLAY}`;
      setSpacing(ctx, 0.2, productSize);
      ctx.fillText(input.product.toUpperCase(), w / 2, h * 0.925);
    },
    true,
  );
  return sheet.result;
}

export interface InsideInput {
  readonly theme: CardTheme;
  readonly photo: HTMLImageElement | null;
  readonly quote: string;
  readonly caption: string;
}

/** The inside of the cover: the photograph in an arched window above a quote. */
export function paintInside(width: number, input: InsideInput, face?: Face): Face {
  const sheet = new Sheet(width, face);
  const { width: w, height: h } = sheet;
  const { theme } = input;
  const left = w * 0.17;
  const right = w * 0.83;
  const top = h * 0.11;
  const bottom = h * 0.62;
  const radius = (right - left) / 2;
  const arch = (ctx: Context, grow = 0): void => {
    ctx.beginPath();
    ctx.moveTo(left - grow, bottom + grow);
    ctx.lineTo(left - grow, top + radius);
    ctx.arc(w / 2, top + radius, radius + grow, Math.PI, 0);
    ctx.lineTo(right + grow, bottom + grow);
    ctx.closePath();
  };

  sheet.paper(theme, grainCanvas());
  sheet.photo(input.photo, theme, (ctx) => arch(ctx));
  sheet.foil(theme, (ctx) => {
    ctx.lineWidth = w * 0.004;
    arch(ctx, w * 0.022);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const captionSize = w * 0.026;
    ctx.font = `${captionSize}px ${MONO}`;
    setSpacing(ctx, 0.4, captionSize);
    ctx.fillText(input.caption.toUpperCase(), w / 2, h * 0.93);
  });
  sheet.ink((ctx) => {
    ctx.fillStyle = theme.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const font = (size: number): string => `italic 500 ${size}px ${SERIF}`;
    const { size, lines } = fitText(ctx, input.quote, font, {
      width: w * 0.7,
      height: h * 0.2,
      size: w * 0.06,
      min: w * 0.035,
      leading: 1.25,
    });
    const leading = size * 1.25;
    const start = h * 0.76 - ((lines.length - 1) * leading) / 2;
    ctx.globalAlpha = 0.85;
    lines.forEach((line, index) => write(ctx, line, w / 2, start + index * leading, size));
  });
  return sheet.result;
}

export interface MessageInput {
  readonly theme: CardTheme;
  readonly greeting: string;
  readonly message: string;
  readonly closing: string;
  readonly signature: string;
  readonly brand: string;
}

/** The handwritten page: greeting, message and signature, sized to fit. */
export function paintMessage(width: number, input: MessageInput, face?: Face): Face {
  const sheet = new Sheet(width, face);
  const { width: w, height: h } = sheet;
  const { theme } = input;
  const margin = w * 0.12;

  sheet.paper(theme, grainCanvas());
  sheet.foil(theme, (ctx) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const brandSize = w * 0.026;
    ctx.font = `${brandSize}px ${MONO}`;
    setSpacing(ctx, 0.5, brandSize);
    ctx.fillText(input.brand.toUpperCase(), w / 2, h * 0.07);
    rule(ctx, w / 2, h * 0.105, w * 0.16, w * 0.003);
  });

  sheet.ink((ctx) => {
    ctx.fillStyle = theme.ink;
    ctx.textBaseline = 'alphabetic';
    let cursor = h * 0.2;
    if (input.greeting) {
      ctx.font = `italic 500 ${w * 0.078}px ${SERIF}`;
      write(ctx, input.greeting, margin, cursor, w * 0.078);
      cursor += w * 0.1;
    }

    const bodyTop = cursor;
    const bodyBottom = h * 0.78;
    const font = (size: number): string => `italic 500 ${size}px ${SERIF}`;
    const leading = 1.3;
    const { size, lines } = fitText(ctx, input.message, font, {
      width: w - margin * 2,
      height: bodyBottom - bodyTop,
      size: w * 0.066,
      min: w * 0.034,
      leading,
    });
    lines.forEach((line, index) =>
      write(ctx, line, margin, bodyTop + size + index * size * leading, size),
    );

    ctx.textAlign = 'right';
    ctx.font = `italic 500 ${w * 0.054}px ${SERIF}`;
    ctx.globalAlpha = 0.8;
    write(ctx, input.closing, w - margin, h * 0.84, w * 0.054);
    ctx.globalAlpha = 1;
    if (input.signature) {
      let signatureSize = w * 0.09;
      ctx.font = `italic 500 ${signatureSize}px ${SERIF}`;
      signatureSize *= Math.min(1, (w - margin * 2) / ctx.measureText(input.signature).width);
      ctx.font = `italic 500 ${signatureSize}px ${SERIF}`;
      write(ctx, input.signature, w - margin, h * 0.92, signatureSize);
    }
  });
  return sheet.result;
}

export interface BackInput {
  readonly theme: CardTheme;
  readonly brand: string;
  readonly product: string;
  readonly motto: string;
  readonly address: string;
}

export function paintBack(width: number, input: BackInput, face?: Face): Face {
  const sheet = new Sheet(width, face);
  const { width: w, height: h } = sheet;
  const { theme } = input;

  sheet.paper(theme, grainCanvas());
  sheet.foil(theme, (ctx) => {
    pumpkinMark(ctx, w / 2, h * 0.42, w * 0.26);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const brandSize = w * 0.04;
    ctx.font = `${brandSize}px ${MONO}`;
    setSpacing(ctx, 0.55, brandSize);
    ctx.fillText(input.brand.toUpperCase(), w / 2, h * 0.56);
    rule(ctx, w / 2, h * 0.6, w * 0.12, w * 0.003);
  });
  sheet.ink((ctx) => {
    ctx.fillStyle = theme.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic 500 ${w * 0.05}px ${SERIF}`;
    write(ctx, input.motto, w / 2, h * 0.65, w * 0.05);
    ctx.globalAlpha = 0.6;
    const small = w * 0.022;
    ctx.font = `${small}px ${MONO}`;
    setSpacing(ctx, 0.3, small);
    ctx.fillText(input.product.toUpperCase(), w / 2, h * 0.9);
    ctx.fillText(input.address, w / 2, h * 0.93);
  });
  return sheet.result;
}

let grain: HTMLCanvasElement | undefined;

/** Tileable paper fibre noise, shared by every face and used as the bump map. */
export function grainCanvas(): HTMLCanvasElement {
  if (grain) return grain;
  const size = 256;
  grain = canvas(size, size);
  const ctx = context(grain);
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i += 1) {
    // Short horizontal fibres over fine noise.
    const fibre = Math.sin(i * 0.37) * Math.sin(Math.floor(i / size) * 1.7) * 18;
    const value = 200 + (Math.random() - 0.5) * 70 + fibre;
    image.data.set([value, value, value, 255], i * 4);
  }
  ctx.putImageData(image, 0, 0);
  return grain;
}
