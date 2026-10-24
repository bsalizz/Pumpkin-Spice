import { Experience } from './experience.ts';

function supportsWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Boots the 3D scene. Returns `null` when WebGL is unavailable; the CSS
 * fallback gradient then remains as the backdrop.
 */
export async function mountExperience(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): Promise<Experience | null> {
  if (!supportsWebGL2()) return null;

  const experience = new Experience({ canvas, reducedMotion });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    canvas.classList.remove('is-ready');
    experience.dispose();
  });

  await experience.warmUp();
  experience.start();
  canvas.classList.add('is-ready');
  return experience;
}
