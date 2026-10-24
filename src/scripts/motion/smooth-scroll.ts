import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { scrollState } from '../state.ts';

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one clock. Falls back to native scrolling for reduced motion.
 */
export function initSmoothScroll(reducedMotion: boolean): Lenis | null {
  const updateState = (): void => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollState.progress = max > 0 ? window.scrollY / max : 0;
  };

  if (reducedMotion) {
    window.addEventListener('scroll', updateState, { passive: true });
    updateState();
    return null;
  }

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
    anchors: { offset: 0 },
  });

  lenis.on('scroll', (instance: Lenis) => {
    scrollState.velocity = instance.velocity;
    updateState();
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  updateState();
  return lenis;
}
