/** Runtime capabilities that shape how much motion we play. */
export interface MotionEnv {
  readonly reducedMotion: boolean;
  readonly finePointer: boolean;
  readonly mobile: boolean;
}

export function readEnv(): MotionEnv {
  const media = (query: string): boolean => window.matchMedia(query).matches;
  return {
    reducedMotion: media('(prefers-reduced-motion: reduce)'),
    finePointer: media('(hover: hover) and (pointer: fine)'),
    mobile: media('(max-width: 899px)'),
  };
}

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;
