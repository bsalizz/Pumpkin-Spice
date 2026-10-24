import { gsap } from 'gsap';

import { scrollState } from '../state.ts';

/** Infinite marquee rows whose speed and direction react to scroll velocity. */
export function initMarquee(reducedMotion: boolean): void {
  const rows = gsap.utils.toArray<HTMLElement>('[data-marquee]');
  if (rows.length === 0 || reducedMotion) return;

  const BASE_SPEED = 0.045; // percent of one group per frame

  rows.forEach((row) => {
    const direction = Number(row.dataset['marquee'] ?? '1');
    let offset = direction > 0 ? 0 : -50;

    gsap.ticker.add((_time, deltaTime) => {
      const frames = deltaTime / (1000 / 60);
      const boost = 1 + Math.min(Math.abs(scrollState.velocity) * 0.35, 10);
      const sign = scrollState.velocity < 0 ? -1 : 1;
      offset -= BASE_SPEED * boost * direction * sign * frames;
      // Each row holds two identical groups, so wrapping at -50% is seamless.
      offset = gsap.utils.wrap(-50, 0, offset);
      row.style.transform = `translate3d(${offset}%, 0, 0)`;
    });
  });
}
