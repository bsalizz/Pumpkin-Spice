import {
  CARD_HASH_KEY,
  CARD_LIMITS,
  type CardData,
  type CardTemplate,
  decodeCard,
  encodeCard,
  sanitizeCard,
  tokenFromHash,
} from '../../lib/card/payload.ts';
import type { CardDesign, Dictionary } from '../../i18n/types.ts';
import { readEnv } from '../motion/env.ts';
import type { CardContent, CardStage } from './stage.ts';

/** The slice of the dictionary the client needs, inlined into the page as JSON. */
export interface CardCopy {
  readonly card: Dictionary['card'];
  readonly brand: string;
  readonly product: string;
  readonly address: string;
}

type Mode = 'compose' | 'view';

const $ = <T extends Element>(root: ParentNode, selector: string): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`[card] missing ${selector}`);
  return element;
};

function supportsWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/** Resolves a card into what is printed on it, filling the blanks from its design. */
export function contentFor(card: CardData, copy: CardCopy): CardContent {
  const designs = copy.card.designs;
  const design: CardDesign =
    designs.find((item) => item.id === card.template) ?? (designs[0] as CardDesign);
  const { letter } = copy.card;
  return {
    template: design.id,
    headline: design.cover,
    quote: design.quote,
    caption: `Nº 31 · ${design.name}`,
    to: card.to,
    greeting: card.to ? `${letter.dear} ${card.to},` : '',
    message: card.message || design.message,
    closing: letter.closing,
    signature: card.from,
    brand: copy.brand,
    product: copy.product,
    motto: letter.back,
    address: copy.address,
  };
}

/** Wires the greeting-card page: the composer, the shared-card view and the 3D stage. */
export async function bootCard(): Promise<void> {
  const root = $<HTMLElement>(document, '[data-card-page]');
  const copy = JSON.parse($<HTMLScriptElement>(root, '[data-card-copy]').textContent) as CardCopy;
  const photos = JSON.parse(root.dataset['photos'] ?? '{}') as Record<CardTemplate, string>;
  const env = readEnv();
  const { form: formCopy, stage: stageCopy, view: viewCopy } = copy.card;

  const ui = {
    title: $<HTMLElement>(root, '[data-card-title]'),
    canvas: $<HTMLCanvasElement>(root, '[data-card-canvas]'),
    hint: $<HTMLElement>(root, '[data-card-hint]'),
    toggle: $<HTMLButtonElement>(root, '[data-card-toggle]'),
    letter: {
      headline: $<HTMLElement>(root, '[data-letter-headline]'),
      greeting: $<HTMLElement>(root, '[data-letter-greeting]'),
      message: $<HTMLElement>(root, '[data-letter-message]'),
      closing: $<HTMLElement>(root, '[data-letter-closing]'),
      signature: $<HTMLElement>(root, '[data-letter-signature]'),
    },
    form: $<HTMLFormElement>(root, '[data-card-form]'),
    message: $<HTMLTextAreaElement>(root, 'textarea[name="message"]'),
    counter: $<HTMLElement>(root, '[data-card-counter]'),
    result: $<HTMLElement>(root, '[data-card-result]'),
    link: $<HTMLInputElement>(root, '[data-card-link]'),
    copy: $<HTMLButtonElement>(root, '[data-card-copy-link]'),
    share: $<HTMLButtonElement>(root, '[data-card-share]'),
    preview: $<HTMLAnchorElement>(root, '[data-card-preview]'),
    status: $<HTMLElement>(root, '[data-card-status]'),
    broken: $<HTMLElement>(root, '[data-card-broken]'),
    reply: $<HTMLAnchorElement>(root, '[data-card-reply]'),
    langs: root.querySelectorAll<HTMLAnchorElement>('[data-card-lang]'),
  };
  const composeTitle = ui.title.textContent;
  const pageTitle = document.title;
  const pageUrl = `${location.origin}${location.pathname}`;

  let stage: CardStage | null = null;
  let card: CardData = readForm();
  let mode: Mode = 'compose';
  let pending = 0;

  function readForm(): CardData {
    const data = new FormData(ui.form);
    return sanitizeCard({
      template: data.get('template'),
      to: data.get('to'),
      from: data.get('from'),
      message: data.get('message'),
    });
  }

  function writeForm(next: CardData): void {
    const fields = ui.form.elements;
    const radio = fields.namedItem('template');
    if (radio instanceof RadioNodeList) radio.value = next.template;
    for (const name of ['to', 'from', 'message'] as const) {
      const field = fields.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.value = next[name];
      }
    }
  }

  /** Mirrors the card as plain text: for screen readers, and as the no-WebGL card. */
  function renderLetter(content: CardContent): void {
    ui.letter.headline.textContent = content.headline.replace(/\n/g, ' ');
    ui.letter.greeting.textContent = content.greeting;
    ui.letter.message.textContent = content.message;
    ui.letter.closing.textContent = content.closing;
    ui.letter.signature.textContent = content.signature;
  }

  function render(): void {
    const content = contentFor(card, copy);
    root.dataset['template'] = card.template;
    renderLetter(content);
    const design = copy.card.designs.find((item) => item.id === card.template);
    if (design) ui.message.placeholder = design.message;
    const left = CARD_LIMITS.message - Array.from(ui.message.value).length;
    ui.counter.textContent = `${Math.max(0, left)} ${formCopy.remaining}`;
    // Coalesce keystrokes into one repaint per frame.
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => stage?.setContent(content));
  }

  function setMode(next: Mode): void {
    mode = next;
    root.dataset['mode'] = next;
    if (next === 'view') {
      ui.title.textContent = viewCopy.title;
      document.title = card.to ? `${viewCopy.for} ${card.to} · ${copy.brand}` : pageTitle;
      const reply = new URLSearchParams({ to: card.from, from: card.to });
      ui.reply.href = `${pageUrl}#${reply.toString()}`;
    } else {
      ui.title.textContent = composeTitle;
      document.title = pageTitle;
    }
    // Language links keep the card, so a recipient can read the page in their language.
    for (const link of ui.langs) link.hash = location.hash;
  }

  /** Reads the URL fragment: a shared card, a reply prefill, or nothing. */
  async function route(): Promise<void> {
    const token = tokenFromHash(location.hash);
    ui.broken.hidden = true;
    if (token) {
      const shared = await decodeCard(token);
      if (shared) {
        card = shared;
        writeForm(shared);
        setMode('view');
        render();
        stage?.replay();
        scheduleAutoOpen();
        return;
      }
      ui.broken.hidden = false;
    } else {
      const params = new URLSearchParams(location.hash.slice(1));
      if (params.has('to') || params.has('from')) {
        writeForm(sanitizeCard({ ...card, to: params.get('to'), from: params.get('from') }));
      }
    }
    card = readForm();
    setMode('compose');
    render();
  }

  let autoOpen = 0;
  function scheduleAutoOpen(): void {
    window.clearTimeout(autoOpen);
    // Recipients who do not discover the tap still get to read their card.
    autoOpen = window.setTimeout(() => {
      if (mode === 'view' && stage && !stage.isOpen) stage.setOpen(true);
    }, 4200);
  }

  function linkFor(token: string): string {
    return `${pageUrl}#${CARD_HASH_KEY}=${token}`;
  }

  function announce(message: string): void {
    ui.status.textContent = '';
    window.setTimeout(() => (ui.status.textContent = message), 50);
  }

  ui.form.addEventListener('input', () => {
    card = readForm();
    ui.result.hidden = true;
    render();
  });

  ui.form.addEventListener('focusin', (event) => {
    const name = (event.target as HTMLInputElement | null)?.name;
    if (name === 'message' || name === 'from') stage?.setOpen(true);
    if (name === 'to' || name === 'template') stage?.setOpen(false);
  });

  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    void (async () => {
      const token = await encodeCard({ ...card, message: contentFor(card, copy).message });
      const url = linkFor(token);
      ui.link.value = url;
      ui.preview.href = url;
      ui.share.hidden = typeof navigator.share !== 'function';
      ui.result.hidden = false;
      announce(formCopy.ready);
      ui.result.scrollIntoView({
        behavior: env.reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      ui.link.focus({ preventScroll: true });
      ui.link.select();
    })();
  });

  ui.copy.addEventListener('click', () => {
    const done = (): void => {
      ui.copy.textContent = formCopy.copied;
      announce(formCopy.copied);
      window.setTimeout(() => (ui.copy.textContent = formCopy.copy), 2200);
    };
    navigator.clipboard.writeText(ui.link.value).then(done, () => {
      // Clipboard refused (insecure context, permissions): leave the link selected to copy by hand.
      ui.link.focus();
      ui.link.select();
    });
  });

  ui.share.addEventListener('click', () => {
    navigator
      .share({ title: copy.card.meta.title, text: viewCopy.shareText, url: ui.link.value })
      .catch(() => undefined);
  });

  ui.toggle.addEventListener('click', () => stage?.toggle());

  window.addEventListener('hashchange', () => void route());

  await route();

  if (!supportsWebGL2()) {
    root.classList.add('is-flat');
    return;
  }

  const { CardStage: Stage } = await import('./stage.ts');
  stage = new Stage({
    canvas: ui.canvas,
    focus: $<HTMLElement>(root, '[data-card-focus]'),
    photos,
    reducedMotion: env.reducedMotion,
    margin: 1.06,
    onOpenChange: (open) => {
      ui.toggle.textContent = open ? stageCopy.close : stageCopy.open;
      ui.toggle.setAttribute('aria-pressed', String(open));
      window.clearTimeout(autoOpen);
    },
  });
  ui.canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stage?.dispose();
    stage = null;
    root.classList.add('is-flat');
  });

  let tiltAsked = false;
  ui.canvas.addEventListener('pointerup', () => {
    ui.hint.classList.add('is-gone');
    window.clearTimeout(autoOpen);
    if (!tiltAsked && !env.finePointer) {
      tiltAsked = true;
      void stage?.enableTilt();
    }
  });

  await stage.prepare(contentFor(card, copy));
  stage.start();
  root.classList.add('is-live');
  if (root.dataset['mode'] === 'view') scheduleAutoOpen();
}
