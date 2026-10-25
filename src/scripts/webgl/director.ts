import { Color } from 'three';

import { PALETTES, type PaletteName } from './palette.ts';

/**
 * Everything the 3D scene needs to know about "where we are in the film".
 * Positions use `x` as a fraction of the visible half-width so layouts adapt
 * to portrait phones and ultra-wide screens alike.
 */
export interface SceneState {
  flacon: { x: number; y: number; z: number; scale: number; tilt: number };
  pumpkin: { x: number; y: number; z: number; scale: number; frost: number };
  palette: PaletteName;
  /** 0 = no ingredients, 1 = star anise and cinnamon orbiting the flacon. */
  spices: number;
  /** 0 = no field, 1 = every heirloom pumpkin of the patch risen. */
  patch: number;
  /** Leaf fall speed multiplier. */
  fall: number;
  /** 0 = autumn leaves, 1 = frozen leaves. */
  frost: number;
  /** 0 = rising embers, 1 = falling snow. */
  snow: number;
  /** Overall light / bloom intensity. */
  glow: number;
  cameraZ: number;
}

type Partial2<T> = { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] };

const BASE: SceneState = {
  flacon: { x: 0, y: -0.05, z: 0, scale: 1, tilt: 0 },
  pumpkin: { x: 0, y: -3.6, z: -1, scale: 0, frost: 0 },
  palette: 'amber',
  spices: 0,
  patch: 0,
  fall: 1,
  frost: 0,
  snow: 0,
  glow: 1,
  cameraZ: 7,
};

const HIDDEN_FLACON = { x: 0.2, y: -4.2, z: -2, scale: 0.4, tilt: 0.4 };

const define = (patch: Partial2<SceneState>): SceneState => ({
  ...BASE,
  ...patch,
  flacon: { ...BASE.flacon, ...patch.flacon },
  pumpkin: { ...BASE.pumpkin, ...patch.pumpkin },
});

/** Keyframes addressed by the `data-scene` attribute of DOM anchors. */
export const SCENES: Record<string, SceneState> = {
  hero: define({
    flacon: { x: 0, y: -0.05, z: 0, scale: 1.1, tilt: 0 },
    spices: 1,
    patch: 0.35,
  }),
  manifesto: define({
    flacon: { x: 0.55, y: 0.1, z: -1.2, scale: 0.85, tilt: 0.28 },
    palette: 'dusk',
    spices: 0.5,
    glow: 0.85,
  }),
  'story-intro': define({
    flacon: HIDDEN_FLACON,
    pumpkin: { x: -0.35, y: -2.2, z: -1, scale: 0.55 },
    palette: 'dusk',
    patch: 0.6,
  }),
  october: define({
    flacon: HIDDEN_FLACON,
    pumpkin: { x: 0, y: -0.62, z: 0, scale: 0.95 },
    palette: 'amber',
    patch: 1,
    fall: 1.3,
    cameraZ: 6.6,
  }),
  ember: define({
    flacon: HIDDEN_FLACON,
    pumpkin: { x: 0, y: -0.6, z: 0.6, scale: 1.05 },
    palette: 'ember',
    patch: 1,
    fall: 0.9,
    glow: 1.45,
    cameraZ: 6.2,
  }),
  frost: define({
    flacon: HIDDEN_FLACON,
    pumpkin: { x: 0, y: -0.66, z: -0.4, scale: 0.9, frost: 1 },
    palette: 'frost',
    patch: 1,
    fall: 0.22,
    frost: 1,
    snow: 1,
    glow: 0.55,
    cameraZ: 7.4,
  }),
  forever: define({
    flacon: { x: 0.6, y: -0.1, z: 0.2, scale: 0.72, tilt: 0 },
    pumpkin: { x: -0.6, y: -0.45, z: 0, scale: 0.72, frost: 0.25 },
    palette: 'gold',
    patch: 0.7,
    fall: 0.75,
    frost: 0.15,
    snow: 0.15,
    glow: 1.2,
  }),
  epilogue: define({
    flacon: { x: 0, y: 0, z: -0.5, scale: 0.9 },
    pumpkin: { x: -1.1, y: -1.6, z: -2, scale: 0.5 },
    palette: 'gold',
    patch: 0.5,
    fall: 0.9,
  }),
  elixir: define({
    flacon: { x: 0, y: -0.22, z: 0.4, scale: 0.9 },
    palette: 'amber',
    spices: 1,
    glow: 1.3,
  }),
  marquee: define({
    flacon: { x: -0.55, y: 0.1, z: -0.5, scale: 0.85, tilt: -0.3 },
    palette: 'ember',
    spices: 0.7,
  }),
  stats: define({ flacon: { x: 0.6, y: 0.15, z: -1.4, scale: 0.75, tilt: 0.2 }, palette: 'noir' }),
  ritual: define({
    flacon: { x: -0.62, y: 0.2, z: -1.6, scale: 0.7, tilt: -0.2 },
    palette: 'dusk',
  }),
  reserve: define({
    flacon: { x: 0.62, y: -0.1, z: -1.2, scale: 0.8, tilt: 0.15 },
    palette: 'gold',
    spices: 0.6,
  }),
  faq: define({
    flacon: { x: -0.7, y: 0, z: -2.2, scale: 0.6, tilt: -0.25 },
    palette: 'noir',
    glow: 0.8,
  }),
  footer: define({
    flacon: { x: 0.32, y: -0.1, z: 0.3, scale: 0.8 },
    pumpkin: { x: -0.36, y: -0.5, z: 0, scale: 0.72 },
    palette: 'amber',
    spices: 1,
    patch: 1,
    glow: 1.2,
  }),
};

interface Anchor {
  readonly center: number;
  readonly state: SceneState;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Interpolates between two states; colours are blended separately by the caller. */
export function blendStates(a: SceneState, b: SceneState, t: number): SceneState {
  const pick = <T extends Record<string, number>>(x: T, y: T): T => {
    const out = { ...x };
    for (const key of Object.keys(x) as (keyof T)[]) {
      out[key] = mix(x[key] as number, y[key] as number, t) as T[keyof T];
    }
    return out;
  };
  return {
    flacon: pick(a.flacon, b.flacon),
    pumpkin: pick(a.pumpkin, b.pumpkin),
    palette: t < 0.5 ? a.palette : b.palette,
    spices: mix(a.spices, b.spices, t),
    patch: mix(a.patch, b.patch, t),
    fall: mix(a.fall, b.fall, t),
    frost: mix(a.frost, b.frost, t),
    snow: mix(a.snow, b.snow, t),
    glow: mix(a.glow, b.glow, t),
    cameraZ: mix(a.cameraZ, b.cameraZ, t),
  };
}

/**
 * Maps the scroll position onto the keyframe timeline defined by DOM anchors.
 * Each anchor "owns" the moment its centre crosses the middle of the viewport.
 */
export class Director {
  private anchors: Anchor[] = [];
  readonly deep = new Color();
  readonly mid = new Color();
  readonly glowColor = new Color();

  measure(): void {
    const scrollY = window.scrollY;
    this.anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const state = SCENES[element.dataset['scene'] ?? ''];
        return state ? { center: rect.top + scrollY + rect.height / 2, state } : null;
      })
      .filter((anchor): anchor is Anchor => anchor !== null)
      .sort((a, b) => a.center - b.center);
  }

  /** Resolves the blended state for the current scroll position. */
  resolve(scrollY: number, viewport: number): SceneState {
    const position = scrollY + viewport / 2;
    const first = this.anchors[0];
    if (!first) return BASE;

    let from = first;
    let to = first;
    for (const anchor of this.anchors) {
      if (anchor.center <= position) from = anchor;
      if (anchor.center > position) {
        to = anchor;
        break;
      }
      to = anchor;
    }

    const span = to.center - from.center;
    const raw = span > 0 ? (position - from.center) / span : 0;
    // Hold each keyframe briefly, then glide to the next.
    const t = smooth(Math.min(1, Math.max(0, (raw - 0.15) / 0.7)));

    const pa = PALETTES[from.state.palette];
    const pb = PALETTES[to.state.palette];
    this.deep.copy(pa.deep).lerp(pb.deep, t);
    this.mid.copy(pa.mid).lerp(pb.mid, t);
    this.glowColor.copy(pa.glow).lerp(pb.glow, t);

    return blendStates(from.state, to.state, t);
  }
}
