import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { splitText } from './split.ts';

/**
 * Declarative scroll reveals:
 * - `[data-reveal]`        fade + rise once in view
 * - `[data-reveal-chars]`  characters rise from a clipped line
 * - `[data-scrub-words]`   words brighten as the reader scrolls through them
 * - `[data-draw]`          SVG line art draws itself
 */
export function initReveals(reducedMotion: boolean): void {
  const charTargets = gsap.utils.toArray<HTMLElement>('[data-reveal-chars]');
  const scrubTargets = gsap.utils.toArray<HTMLElement>('[data-scrub-words]');
  const charsByElement = new Map(charTargets.map((el) => [el, splitText(el, 'chars')]));
  const wordsByElement = new Map(scrubTargets.map((el) => [el, splitText(el, 'words')]));

  if (reducedMotion) {
    gsap.set('[data-reveal]', { autoAlpha: 1 });
    gsap.set('[data-draw] path', { strokeDashoffset: 0 });
    return;
  }

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 48 },
        { autoAlpha: 1, y: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, overwrite: true },
      ),
  });

  charsByElement.forEach((chars, element) => {
    gsap.from(chars, {
      yPercent: 115,
      rotate: 4,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.028,
      scrollTrigger: { trigger: element, start: 'top 90%', once: true },
    });
  });

  wordsByElement.forEach((words, element) => {
    gsap.fromTo(
      words,
      { opacity: 0.42, filter: 'blur(5px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: element, start: 'top 80%', end: 'bottom 45%', scrub: 0.8 },
      },
    );
  });

  gsap.utils.toArray<SVGElement>('[data-draw]').forEach((svg) => {
    if (svg.closest('[data-chapter]')) return; // chapters draw their own art
    gsap.to(svg.querySelectorAll('path'), {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: 'power2.inOut',
      stagger: 0.18,
      scrollTrigger: { trigger: svg, start: 'top 85%', once: true },
    });
  });
}
