import { gsap } from 'gsap';

/** Rolls `[data-count]` numbers up from zero when they enter the viewport. */
export function initCounters(reducedMotion: boolean): void {
  if (reducedMotion) return;

  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((element) => {
    const target = Number(element.dataset['count']);
    const format = new Intl.NumberFormat(element.dataset['locale'] ?? 'en');
    const state = { value: 0 };
    element.textContent = format.format(0);

    gsap.to(state, {
      value: target,
      duration: 2.4,
      ease: 'expo.out',
      scrollTrigger: { trigger: element, start: 'top 85%', once: true },
      onUpdate: () => {
        element.textContent = format.format(Math.round(state.value));
      },
    });
  });
}
