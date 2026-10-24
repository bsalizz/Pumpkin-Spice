export type SplitMode = 'chars' | 'words';

/**
 * Splits the text of `element` into word (and optionally char) spans for animation.
 * The original text stays available to assistive technology through a visually hidden
 * copy, while the animated fragments are hidden from it.
 * Idempotent: an element is split at most once.
 */
export function splitText(element: HTMLElement, mode: SplitMode): HTMLElement[] {
  if (element.dataset['splitDone'] === 'true') {
    return Array.from(
      element.querySelectorAll<HTMLElement>(`.split-${mode === 'chars' ? 'char' : 'word'}`),
    );
  }

  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ');
  const fragment = document.createDocumentFragment();
  const targets: HTMLElement[] = [];

  words.forEach((word, index) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'split-word';
    wordEl.setAttribute('aria-hidden', 'true');

    if (mode === 'chars') {
      for (const char of Array.from(word)) {
        const charEl = document.createElement('span');
        charEl.className = 'split-char';
        charEl.textContent = char;
        wordEl.append(charEl);
        targets.push(charEl);
      }
    } else {
      wordEl.textContent = word;
      targets.push(wordEl);
    }

    fragment.append(wordEl);
    if (index < words.length - 1) fragment.append(document.createTextNode(' '));
  });

  const accessible = document.createElement('span');
  accessible.className = 'visually-hidden';
  accessible.textContent = text;
  element.replaceChildren(accessible, fragment);
  element.dataset['splitDone'] = 'true';
  return targets;
}
