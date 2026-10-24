import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { clamp } from './env.ts';
import { splitText } from './split.ts';
import { moodState, type Mood } from '../state.ts';

interface ChapterParts {
  readonly root: HTMLElement;
  readonly mood: Mood;
  readonly numeral: HTMLElement | null;
  readonly chars: HTMLElement[];
  readonly words: HTMLElement[];
  readonly art: NodeListOf<SVGPathElement>;
}

function collect(root: HTMLElement): ChapterParts {
  const title = root.querySelector<HTMLElement>('.chapter__title [data-split="chars"]');
  const line = root.querySelector<HTMLElement>('.chapter__line [data-split="words"]');
  return {
    root,
    mood: (root.dataset['mood'] ?? 'october') as Mood,
    numeral: root.querySelector<HTMLElement>('.chapter__numeral'),
    chars: title ? splitText(title, 'chars') : [],
    words: line ? splitText(line, 'words') : [],
    art: root.querySelectorAll<SVGPathElement>('.chapter__art path'),
  };
}

function enter(chapter: ChapterParts, direction: 1 | -1, reducedMotion: boolean): void {
  gsap.killTweensOf([
    chapter.root,
    chapter.numeral,
    ...chapter.chars,
    ...chapter.words,
    ...chapter.art,
  ]);
  gsap.set(chapter.root, { visibility: 'visible', autoAlpha: 1 });

  if (reducedMotion) {
    gsap.set([...chapter.chars, ...chapter.words], { clearProps: 'all' });
    gsap.set(chapter.art, { strokeDashoffset: 0 });
    return;
  }

  const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });
  timeline
    .fromTo(
      chapter.numeral,
      { autoAlpha: 0, scale: 1.25, yPercent: 8 * direction },
      { autoAlpha: 1, scale: 1, yPercent: 0, duration: 2.2 },
      0,
    )
    .fromTo(
      chapter.art,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.12 },
      0.1,
    )
    .fromTo(
      chapter.chars,
      { yPercent: 115 * direction, rotate: 5 * direction },
      { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.035 },
      0.15,
    )
    .fromTo(
      chapter.words,
      { autoAlpha: 0, y: 24 * direction, filter: 'blur(10px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.4, stagger: 0.06 },
      0.45,
    );
}

function leave(chapter: ChapterParts, direction: 1 | -1, reducedMotion: boolean): void {
  gsap.killTweensOf([
    chapter.root,
    chapter.numeral,
    ...chapter.chars,
    ...chapter.words,
    ...chapter.art,
  ]);
  if (reducedMotion) {
    gsap.set(chapter.root, { autoAlpha: 0, visibility: 'hidden' });
    return;
  }
  gsap.to(chapter.root, {
    autoAlpha: 0,
    y: -40 * direction,
    duration: 0.7,
    ease: 'power2.in',
    onComplete: () => {
      gsap.set(chapter.root, { y: 0, visibility: 'hidden' });
    },
  });
}

/** Pinned four-chapter love story: one chapter per viewport of scroll. */
export function initStory(reducedMotion: boolean): void {
  const track = document.querySelector<HTMLElement>('[data-story]');
  if (!track) return;

  const chapters = Array.from(track.querySelectorAll<HTMLElement>('[data-chapter]')).map(collect);
  const dots = Array.from(track.querySelectorAll<HTMLElement>('.story__dots span'));
  if (chapters.length === 0) return;

  let active = -1;
  const show = (index: number): void => {
    if (index === active) return;
    const direction: 1 | -1 = index > active ? 1 : -1;
    const previous = chapters[active];
    const next = chapters[index];
    if (previous) leave(previous, direction, reducedMotion);
    if (next) {
      enter(next, direction, reducedMotion);
      moodState.current = next.mood;
      document.documentElement.dataset['mood'] = next.mood;
    }
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    active = index;
  };

  ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const index = Math.floor(clamp(self.progress, 0, 0.9999) * chapters.length);
      show(index);
    },
    onLeaveBack: () => {
      moodState.current = 'october';
      delete document.documentElement.dataset['mood'];
    },
  });

  show(0);
}
