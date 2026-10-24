import { Color } from 'three';

/** Backdrop + light colours for each visual mood. */
export interface Palette {
  readonly deep: Color;
  readonly mid: Color;
  readonly glow: Color;
}

const make = (deep: string, mid: string, glow: string): Palette => ({
  deep: new Color(deep),
  mid: new Color(mid),
  glow: new Color(glow),
});

export const PALETTES = {
  amber: make('#0b0604', '#3d1707', '#d0601a'),
  dusk: make('#090504', '#2a0f07', '#9a3c12'),
  ember: make('#120403', '#520f05', '#ec4a1c'),
  frost: make('#03070c', '#132233', '#7c9db6'),
  gold: make('#0b0805', '#3a280c', '#e2ac45'),
  noir: make('#080504', '#1f0e08', '#7d3412'),
} as const;

export type PaletteName = keyof typeof PALETTES;
