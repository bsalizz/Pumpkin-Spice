import { gsap } from 'gsap';

import { scrollState } from '../state.ts';

/** Scroll progress readout in the corner. */
export function initProgress(): void {
  const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
  const value = document.querySelector<HTMLElement>('[data-progress-value]');
  if (!bar || !value) return;

  let last = -1;
  gsap.ticker.add(() => {
    const percent = Math.round(scrollState.progress * 100);
    if (percent === last) return;
    last = percent;
    bar.style.setProperty('--progress', String(scrollState.progress));
    value.textContent = String(percent).padStart(3, '0');
  });
}

/** Slowly spinning seal ring, accelerating with scroll. */
export function initSpinners(reducedMotion: boolean): void {
  if (reducedMotion) return;
  gsap.utils.toArray<SVGElement>('[data-spin]').forEach((element) => {
    let angle = 0;
    gsap.ticker.add((_time, deltaTime) => {
      angle += (deltaTime / 1000) * (8 + Math.abs(scrollState.velocity) * 4);
      element.style.transform = `rotate(${angle % 360}deg)`;
    });
  });
}

/** Web Share API with a clipboard fallback. */
export function initShare(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-share]');
  const status = document.querySelector<HTMLElement>('[data-share-status]');
  const label = button?.querySelector<HTMLElement>('[data-share-label]');
  if (!button || !label) return;

  const original = label.textContent ?? '';
  button.addEventListener('click', async () => {
    const data = {
      title: document.title,
      text: button.dataset['shareText'] ?? '',
      url: location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      const done = button.dataset['sharedLabel'] ?? '';
      label.textContent = done;
      if (status) status.textContent = done;
      window.setTimeout(() => {
        label.textContent = original;
      }, 2400);
    } catch {
      // The user dismissed the share sheet — nothing to do.
    }
  });
}
