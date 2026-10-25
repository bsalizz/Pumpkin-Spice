import type { CardTemplate } from '../../lib/card/payload.ts';

export type Weather = 'leaves' | 'embers' | 'snow' | 'gold' | 'steam';

/** Print and stage styling of one card design. */
export interface CardTheme {
  /** Paper stock of the inside and the back. */
  readonly paper: string;
  readonly ink: string;
  /** Foil printed over the cover photograph. */
  readonly foil: string;
  /** The same foil on bare paper, deep enough to read against the stock. */
  readonly print: string;
  /** Wash laid over the cover photograph, bottom to top. */
  readonly wash: string;
  /** Colour of the key light grazing the card. */
  readonly light: string;
  /** Rim light from behind, tinting the card's edges. */
  readonly rim: string;
  /** Night sky behind the card; distant leaves fade into it. */
  readonly night: string;
  readonly weather: Weather;
  /** 0 = ripe autumn, 1 = frosted: drives the floating pumpkin. */
  readonly frost: number;
}

export const THEMES: Record<CardTemplate, CardTheme> = {
  october: {
    paper: '#f3e6d0',
    ink: '#3a1d0e',
    foil: '#d9ae5a',
    print: '#9c6f28',
    wash: 'rgba(40, 14, 4, 0.82)',
    light: '#ffe0b0',
    rim: '#ff7a2a',
    night: '#1a0b05',
    weather: 'leaves',
    frost: 0,
  },
  ember: {
    paper: '#f1dfc9',
    ink: '#3b120a',
    foil: '#e6a24a',
    print: '#a5652a',
    wash: 'rgba(48, 8, 2, 0.84)',
    light: '#ffc58a',
    rim: '#ff4a12',
    night: '#1c0603',
    weather: 'embers',
    frost: 0,
  },
  frost: {
    paper: '#e7eaeb',
    ink: '#1d2a36',
    foil: '#c9d4dc',
    print: '#56708a',
    wash: 'rgba(8, 18, 30, 0.82)',
    light: '#dbe8ff',
    rim: '#7fb2e6',
    night: '#0a121b',
    weather: 'snow',
    frost: 1,
  },
  forever: {
    paper: '#f6ead6',
    ink: '#33200f',
    foil: '#e8c372',
    print: '#a37a2c',
    wash: 'rgba(36, 20, 6, 0.8)',
    light: '#fff0c8',
    rim: '#f0b850',
    night: '#170e05',
    weather: 'gold',
    frost: 0,
  },
  ritual: {
    paper: '#f2e3cc',
    ink: '#36190c',
    foil: '#d79a52',
    print: '#9d6229',
    wash: 'rgba(30, 12, 4, 0.82)',
    light: '#ffd6a0',
    rim: '#e8742c',
    night: '#160a05',
    weather: 'steam',
    frost: 0,
  },
};
