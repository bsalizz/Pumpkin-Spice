export interface Chapter {
  readonly numeral: string;
  readonly title: string;
  readonly line: string;
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
    readonly notes: readonly Note[];
  };
  readonly marquee: readonly string[];
  readonly stats: readonly Stat[];
  readonly ritual: {
    readonly label: string;
    readonly title: string;
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
  readonly notFound: {
    readonly title: string;
    readonly text: string;
    readonly back: string;
  };
}
