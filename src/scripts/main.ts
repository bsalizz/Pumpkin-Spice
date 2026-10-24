import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initSoundToggle } from './audio/ambient.ts';
import { initProgress, initShare, initSpinners } from './motion/chrome.ts';
import { initCountdown } from './motion/countdown.ts';
import { initCounters } from './motion/counters.ts';
import { readEnv } from './motion/env.ts';
import { initHero } from './motion/hero.ts';
import { initMarquee } from './motion/marquee.ts';
import { initCursor, initMagnetic, initTilt, trackPointer } from './motion/pointer.ts';
import { runPreloader } from './motion/preloader.ts';
import { initReveals } from './motion/reveals.ts';
import { initSmoothScroll } from './motion/smooth-scroll.ts';
import { initStory } from './motion/story.ts';

const whenIdle = (callback: () => void): void => {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout: 1200 });
  } else {
    setTimeout(callback, 200);
  }
};

/** Loads the WebGL layer off the critical path. */
function loadScene(reducedMotion: boolean, onReady: (measure: () => void) => void): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-webgl]');
  if (!canvas) return;
  whenIdle(() => {
    import('./webgl/index.ts')
      .then(({ mountExperience }) => mountExperience(canvas, reducedMotion))
      .then((experience) => {
        if (experience) onReady(() => experience.measure());
      })
      .catch((error: unknown) => console.error('[webgl] failed to start', error));
  });
}

/** Entry point of the client experience. */
export function boot(): void {
  const env = readEnv();
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const lenis = initSmoothScroll(env.reducedMotion);
  lenis?.stop();

  trackPointer();
  initSoundToggle();
  initProgress();
  initCountdown();
  initShare();

  // Prepare split text before the curtain opens so nothing flashes.
  initReveals(env.reducedMotion);
  initStory(env.reducedMotion);
  initCounters(env.reducedMotion);
  initMarquee(env.reducedMotion);
  initSpinners(env.reducedMotion);

  if (env.finePointer && !env.reducedMotion) {
    initCursor();
    initMagnetic();
    initTilt();
  }

  loadScene(env.reducedMotion, (measure) => {
    ScrollTrigger.addEventListener('refresh', measure);
    measure();
  });

  void runPreloader(env.reducedMotion).then(() => {
    lenis?.start();
    initHero(env.reducedMotion);
    ScrollTrigger.refresh();
  });

  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
