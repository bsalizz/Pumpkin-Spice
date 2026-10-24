import { gsap } from 'gsap';

const MIN_DURATION = 1.1;

/**
 * Counts 000 → 100 and opens the curtain. Resolves as soon as the curtain starts
 * opening so the hero intro can overlap it. Never waits on WebGL: the scene fades
 * in on its own when ready, keeping LCP fast.
 */
export function runPreloader(reducedMotion: boolean): Promise<void> {
  const root = document.querySelector<HTMLElement>('[data-preloader]');
  const count = root?.querySelector<HTMLElement>('[data-preloader-count]');
  if (!root || !count) return Promise.resolve();

  if (reducedMotion) {
    root.remove();
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const counter = { value: 0 };
    const timeline = gsap.timeline({ onComplete: () => root.remove() });

    timeline
      .to(counter, {
        value: 100,
        duration: MIN_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => {
          count.textContent = String(Math.round(counter.value)).padStart(3, '0');
        },
      })
      .to(root.querySelector('.preloader__inner'), {
        autoAlpha: 0,
        y: -24,
        duration: 0.45,
        ease: 'power2.in',
      })
      .add(resolve)
      .to(
        root.querySelector('.preloader__panel--top'),
        { yPercent: -101, duration: 1.1, ease: 'expo.inOut' },
        '<',
      )
      .to(
        root.querySelector('.preloader__panel--bottom'),
        { yPercent: 101, duration: 1.1, ease: 'expo.inOut' },
        '<',
      );
  });
}
