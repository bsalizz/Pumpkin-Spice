export type Tier = 'high' | 'medium' | 'low' | 'software';

export interface Quality {
  readonly tier: Tier;
  readonly maxDpr: number;
  readonly bloom: boolean;
  readonly leaves: number;
  readonly dust: number;
}

const TIERS: Record<Tier, Omit<Quality, 'tier'>> = {
  high: { maxDpr: 1.75, bloom: true, leaves: 190, dust: 1600 },
  medium: { maxDpr: 1.5, bloom: true, leaves: 90, dust: 700 },
  low: { maxDpr: 1, bloom: false, leaves: 55, dust: 350 },
  software: { maxDpr: 0.75, bloom: false, leaves: 40, dust: 200 },
};

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/** True when WebGL is emulated on the CPU, where every pixel costs main-thread time. */
function isSoftwareRenderer(): boolean {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return SOFTWARE_RENDERER.test(renderer);
}

function isTier(value: string | null): value is Tier {
  return value !== null && value in TIERS;
}

function pickTier(): Tier {
  // `?quality=high` forces a tier — used for OG captures and debugging.
  const forced = new URLSearchParams(window.location.search).get('quality');
  if (isTier(forced)) return forced;
  if (isSoftwareRenderer()) return 'software';

  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency || 4) <= 4 || (nav.deviceMemory ?? 4) <= 2) return 'low';
  return window.matchMedia('(max-width: 899px)').matches ? 'medium' : 'high';
}

/** Picks a rendering budget from cheap, synchronous device hints. */
export function detectQuality(): Quality {
  const tier = pickTier();
  const budget = TIERS[tier];
  return {
    tier,
    ...budget,
    maxDpr: Math.min(budget.maxDpr, Math.max(window.devicePixelRatio || 1, 0.75)),
  };
}
