import type { Dictionary } from './types.ts';

export const en: Dictionary = {
  meta: {
    title: 'Pumpkin Spice Nº 31 — The Last October, Bottled | Vesperine',
    description:
      'Pumpkin Spice Nº 31 by Vesperine: a luxury pumpkin spice elixir of seven rare spices and roasted heirloom pumpkin, aged 31 days in oak. 1,031 numbered crystal flacons.',
    ogImageAlt:
      'A crystal flacon of amber Pumpkin Spice Nº 31 elixir with a gold stopper among falling autumn leaves.',
  },
  a11y: {
    skip: 'Skip to content',
    language: 'Language',
    soundOn: 'Turn sound on',
    soundOff: 'Turn sound off',
    menu: 'Primary',
    flacon3d: 'Animated 3D crystal flacon of Pumpkin Spice Nº 31 among falling leaves',
  },
  nav: {
    story: 'Story',
    elixir: 'Elixir',
    ritual: 'Ritual',
    reserve: 'Reserve',
  },
  preloader: 'Pouring October',
  hero: {
    eyebrow: "Vesperine — Extrait d'Automne",
    titleA: 'Pumpkin',
    titleB: 'Spice',
    number: 'Nº 31',
    tagline: 'The last October, bottled.',
    scroll: 'Scroll',
  },
  manifesto: 'Not a flavour. A season — sealed in crystal, crowned in gold.',
  story: {
    label: 'A love story in four leaves',
    title: 'Four leaves',
    chapters: [
      {
        numeral: 'I',
        title: 'October',
        line: 'They met where cinnamon curled into the cold.',
        mood: 'october',
      },
      {
        numeral: 'II',
        title: 'Ember',
        line: 'Every evening tasted of nutmeg and promise.',
        mood: 'ember',
      },
      { numeral: 'III', title: 'Frost', line: 'The first frost came. He did not.', mood: 'frost' },
      {
        numeral: 'IV',
        title: 'Forever',
        line: 'She still pours two cups. Every October.',
        mood: 'forever',
      },
    ],
    epilogue: 'Some seasons never end. They are only bottled.',
  },
  elixir: {
    label: 'The elixir',
    title: 'Seven spices. One heart.',
    lead: 'Roasted heirloom pumpkin and seven rare spices, rested thirty-one days in French oak.',
    notes: [
      { name: 'Cinnamon', origin: 'Ceylon' },
      { name: 'Nutmeg', origin: 'Grenada' },
      { name: 'Clove', origin: 'Zanzibar' },
      { name: 'Vanilla', origin: 'Madagascar' },
      { name: 'Ginger', origin: 'Kerala' },
      { name: 'Allspice', origin: 'Jamaica' },
      { name: 'Star anise', origin: 'Guangxi' },
    ],
  },
  marquee: [
    'Hand-blended',
    '1,031 numbered flacons',
    'Rested 31 days in oak',
    'Sealed in wax',
    'Released once a year',
  ],
  stats: [
    { value: 1031, label: 'Numbered flacons' },
    { value: 7, label: 'Rare spices' },
    { value: 31, label: 'Days in French oak' },
  ],
  ritual: {
    label: 'The ritual',
    title: 'Warm. Pour. Remember.',
    steps: [
      { title: 'Warm', text: 'Milk or espresso. Never boiling.' },
      { title: 'Pour', text: 'Two drops. A third for the heart.' },
      { title: 'Remember', text: 'Always prepare two cups.' },
    ],
  },
  reserve: {
    label: 'Allocation',
    title: 'Reserve your October',
    text: 'Released once a year, on the last night of October.',
    priceLabel: 'Flacon 50 ml',
    countdownLabel: 'Next release',
    units: { d: 'Days', h: 'Hours', m: 'Minutes', s: 'Seconds' },
    share: 'Send it to someone you love',
    shared: 'Link copied',
    shareText: 'Pumpkin Spice Nº 31 — the last October, bottled.',
  },
  faq: {
    label: 'Questions',
    title: 'Whispered questions',
    items: [
      {
        question: 'What is Pumpkin Spice Nº 31?',
        answer:
          'A concentrated pumpkin spice elixir: roasted heirloom pumpkin, Ceylon cinnamon, Grenada nutmeg, Zanzibar clove, Madagascar vanilla, ginger, allspice and star anise, rested 31 days in French oak.',
      },
      {
        question: 'How do I use it?',
        answer:
          'Add two or three drops to warm milk, espresso, a latte or a cocktail. One 50 ml flacon serves about one hundred rituals.',
      },
      {
        question: 'Why only 1,031 flacons?',
        answer:
          'Each edition is blended by hand from a single autumn harvest and numbered on the last night of October. When it is gone, it is gone until next year.',
      },
      {
        question: 'Is Vesperine a real house?',
        answer:
          'Vesperine is a fictional luxury house — this site is an artistic tribute to autumn and to pumpkin spice.',
      },
    ],
  },
  footer: {
    fiction: 'A fictional house. A real October.',
    rights: 'All seasons reserved.',
    top: 'Back to the first leaf',
  },
  notFound: {
    title: 'This leaf has fallen',
    text: 'The page you are looking for drifted away with the wind.',
    back: 'Return to October',
  },
};
