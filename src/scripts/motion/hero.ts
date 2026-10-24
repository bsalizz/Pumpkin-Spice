import { gsap } from 'gsap';

import { splitText } from './split.ts';

/** Intro choreography for the hero, then scroll-scrubbed drift of the giant words. */
export function initHero(reducedMotion: boolean): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return;

  const fades = hero.querySelectorAll<HTMLElement>('[data-hero-fade]');
  const words = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-word]'));
  const chars = words.flatMap((word) => {
    const target = word.querySelector<HTMLElement>('[data-split="chars"]');
    return target ? splitText(target, 'chars') : [];
  });

  if (reducedMotion) return;

  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .from(chars, { yPercent: 110, rotate: 6, duration: 1.6, stagger: 0.045 })
    .from(fades, { autoAlpha: 0, y: 20, duration: 1.4, stagger: 0.12 }, '-=1.1');

  const [first, second] = words;
  const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } as const;
  if (first) gsap.to(first, { xPercent: -28, ease: 'none', scrollTrigger: scrub });
  if (second) gsap.to(second, { xPercent: 28, ease: 'none', scrollTrigger: scrub });
  gsap.to(fades, { autoAlpha: 0, ease: 'none', scrollTrigger: { ...scrub, end: '40% top' } });
}
