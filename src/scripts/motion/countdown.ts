import { nextRelease, remaining, type Remaining } from '../../lib/release.ts';

/** Live countdown to the next release, ticking once per second. */
export function initCountdown(): void {
  const root = document.querySelector<HTMLElement>('[data-countdown]');
  if (!root) return;

  const cells = new Map<keyof Remaining, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-unit]').forEach((cell) => {
    const unit = cell.dataset['unit'] as keyof Remaining;
    cells.set(unit, cell);
  });

  const render = (): void => {
    const now = new Date();
    const left = remaining(nextRelease(now), now);
    cells.forEach((cell, unit) => {
      const text = String(left[unit]).padStart(2, '0');
      if (cell.textContent !== text) cell.textContent = text;
    });
  };

  render();
  window.setInterval(render, 1000);
}
