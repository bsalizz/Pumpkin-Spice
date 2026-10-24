/** Mutable, frame-shared state written by the DOM motion layer and read by WebGL / audio. */
export const scrollState = {
  /** 0..1 progress of the whole document. */
  progress: 0,
  /** Lenis velocity in px/frame (signed). */
  velocity: 0,
};

export const pointerState = {
  /** Normalized device coordinates, -1..1. */
  x: 0,
  y: 0,
};

export type Mood = 'october' | 'ember' | 'frost' | 'forever';

export const moodState: { current: Mood } = { current: 'october' };
