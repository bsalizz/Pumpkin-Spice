import type { CardTemplate } from '../lib/card/payload.ts';

export interface Chapter {
  readonly numeral: string;
  readonly title: string;
  readonly line: string;
  /** Describes the chapter's photograph for screen readers and search. */
  readonly imageAlt: string;
  /** Visual mood consumed by the WebGL timeline. */
  readonly mood: 'october' | 'ember' | 'frost' | 'forever';
}

export interface Note {
  readonly name: string;
  readonly origin: string;
}

export interface Stat {
  readonly value: number;
  readonly label: string;
}

export interface Step {
  readonly title: string;
  readonly text: string;
}

export interface Faq {
  readonly question: string;
  readonly answer: string;
}

export interface CardDesign {
  readonly id: CardTemplate;
  /** Name shown on the picker. */
  readonly name: string;
  /** Gold-foiled headline on the cover; `\n` breaks the line. */
  readonly cover: string;
  /** Printed on the inside of the cover, opposite the message. */
  readonly quote: string;
  /** Used when the sender leaves the message empty. */
  readonly message: string;
}

export interface Dictionary {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly ogImageAlt: string;
  };
  readonly a11y: {
    readonly skip: string;
    readonly language: string;
    readonly soundOn: string;
    readonly soundOff: string;
    readonly menu: string;
    readonly flacon3d: string;
  };
  readonly nav: {
    readonly story: string;
    readonly elixir: string;
    readonly ritual: string;
    readonly reserve: string;
    readonly card: string;
  };
  readonly preloader: string;
  readonly hero: {
    readonly eyebrow: string;
    readonly titleA: string;
    readonly titleB: string;
    readonly number: string;
    readonly tagline: string;
    readonly scroll: string;
  };
  readonly manifesto: string;
  readonly story: {
    readonly label: string;
    readonly title: string;
    readonly chapters: readonly Chapter[];
    readonly epilogue: string;
  };
  readonly elixir: {
    readonly label: string;
    readonly title: string;
    readonly lead: string;
    readonly imageAlt: string;
    readonly notes: readonly Note[];
  };
  readonly marquee: readonly string[];
  readonly stats: readonly Stat[];
  readonly ritual: {
    readonly label: string;
    readonly title: string;
    readonly imageAlt: string;
    readonly steps: readonly Step[];
  };
  readonly reserve: {
    readonly label: string;
    readonly title: string;
    readonly text: string;
    readonly priceLabel: string;
    readonly countdownLabel: string;
    readonly units: {
      readonly d: string;
      readonly h: string;
      readonly m: string;
      readonly s: string;
    };
    readonly share: string;
    readonly shared: string;
    readonly shareText: string;
  };
  readonly faq: {
    readonly label: string;
    readonly title: string;
    readonly items: readonly Faq[];
  };
  readonly footer: {
    readonly fiction: string;
    readonly rights: string;
    readonly top: string;
  };
  readonly card: {
    readonly meta: {
      readonly title: string;
      readonly description: string;
      readonly ogImageAlt: string;
    };
    readonly label: string;
    readonly title: string;
    readonly lead: string;
    readonly invite: {
      readonly label: string;
      readonly title: string;
      readonly text: string;
      readonly cta: string;
    };
    readonly designs: readonly CardDesign[];
    readonly form: {
      readonly design: string;
      readonly to: string;
      readonly toPlaceholder: string;
      readonly message: string;
      readonly from: string;
      readonly fromPlaceholder: string;
      readonly remaining: string;
      readonly create: string;
      readonly ready: string;
      readonly link: string;
      readonly copy: string;
      readonly copied: string;
      readonly share: string;
      readonly preview: string;
      readonly privacy: string;
    };
    readonly stage: {
      readonly label: string;
      readonly hint: string;
      readonly open: string;
      readonly close: string;
      readonly loading: string;
    };
    readonly letter: {
      /** Salutation before the recipient's name, e.g. "Dear". */
      readonly dear: string;
      readonly closing: string;
      readonly back: string;
    };
    readonly view: {
      readonly title: string;
      /** Document title prefix: "A card for Anna". */
      readonly for: string;
      readonly reply: string;
      readonly own: string;
      readonly broken: string;
      readonly shareText: string;
    };
  };
  readonly notFound: {
    readonly title: string;
    readonly text: string;
    readonly back: string;
  };
}
