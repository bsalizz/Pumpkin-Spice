import { CanvasTexture, SRGBColorSpace } from 'three';

/** Paints the flacon label (black lacquer, gold type) onto a canvas texture. */
export function createLabelTexture(): CanvasTexture {
  const width = 512;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  if (!ctx) return texture;

  const paint = (): void => {
    const gold = ctx.createLinearGradient(0, 0, width, height);
    gold.addColorStop(0, '#f6dc9c');
    gold.addColorStop(0.5, '#c9993f');
    gold.addColorStop(1, '#f1d38c');

    ctx.fillStyle = '#0d0907';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, width - 36, height - 36);
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.fillStyle = gold;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '400 26px "IBM Plex Mono", monospace';
    ctx.fillText('V E S P E R I N E', width / 2, 92);

    ctx.font = '400 128px Anton, Impact, sans-serif';
    ctx.fillText('PUMPKIN', width / 2, 236);
    ctx.fillText('SPICE', width / 2, 368);

    ctx.font = 'italic 300 70px "Cormorant Garamond", serif';
    ctx.fillText('Nº 31', width / 2, 470);

    ctx.font = '400 18px "IBM Plex Mono", monospace';
    ctx.fillText("EXTRAIT D'AUTOMNE · 50 ML", width / 2, 556);
    texture.needsUpdate = true;
  };

  paint();
  // Repaint once the web fonts are available so the label uses the brand faces.
  void document.fonts?.ready.then(paint);
  return texture;
}
