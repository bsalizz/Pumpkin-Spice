import { gsap } from 'gsap';

import { pointerState } from '../state.ts';

/** Tracks the pointer for WebGL parallax (works for mouse and touch). */
export function trackPointer(): void {
  const update = (x: number, y: number): void => {
    pointerState.x = (x / window.innerWidth) * 2 - 1;
    pointerState.y = -((y / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', (event) => update(event.clientX, event.clientY), {
    passive: true,
  });
}

/** Custom cursor with a trailing ring that swells over interactive elements. */
export function initCursor(): void {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor) return;
  const dot = cursor.querySelector<HTMLElement>('.cursor__dot');
  const ring = cursor.querySelector<HTMLElement>('.cursor__ring');
  if (!dot || !ring) return;

  document.documentElement.classList.add('has-cursor');
  gsap.set([dot, ring], { x: -100, y: -100 });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (event) => {
      document.documentElement.classList.add('cursor-active');
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    },
    { passive: true },
  );

  const interactive = 'a, button, summary, [data-magnetic]';
  document.addEventListener('pointerover', (event) => {
    const target = event.target as Element | null;
    document.documentElement.classList.toggle(
      'cursor-hover',
      Boolean(target?.closest(interactive)),
    );
  });
}

/** Elements that lean towards the cursor. */
export function initMagnetic(): void {
  gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((element) => {
    const toX = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const toY = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      toX((event.clientX - rect.left - rect.width / 2) * 0.35);
      toY((event.clientY - rect.top - rect.height / 2) * 0.35);
    });
    element.addEventListener('pointerleave', () => {
      toX(0);
      toY(0);
    });
  });
}

/** Cards that tilt in 3D under the cursor. */
export function initTilt(): void {
  gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((element) => {
    gsap.set(element, { transformPerspective: 900 });
    const rotX = gsap.quickTo(element, 'rotationX', { duration: 0.8, ease: 'power3' });
    const rotY = gsap.quickTo(element, 'rotationY', { duration: 0.8, ease: 'power3' });
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      rotY(((event.clientX - rect.left) / rect.width - 0.5) * 14);
      rotX(-((event.clientY - rect.top) / rect.height - 0.5) * 14);
    });
    element.addEventListener('pointerleave', () => {
      rotX(0);
      rotY(0);
    });
  });
}
