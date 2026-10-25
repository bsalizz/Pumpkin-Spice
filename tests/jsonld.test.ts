import { describe, expect, it } from 'vitest';

import { getDictionary } from '../src/i18n/index.ts';
import { buildJsonLd, buildPageJsonLd, serializeJsonLd } from '../src/lib/seo/jsonld.ts';

const now = new Date('2026-10-25T00:00:00Z');
const ogImage = 'https://bsalizz.github.io/Pumpkin-Spice/og/og-en.jpg';

type Node = Record<string, unknown>;
const graphOf = (locale: 'en' | 'hu'): Node[] =>
  buildJsonLd({ locale, dict: getDictionary(locale), ogImage, now })['@graph'] as Node[];
const byType = (graph: Node[], type: string): Node | undefined =>
  graph.find((node) => node['@type'] === type);

describe('buildJsonLd', () => {
  it('describes the organization, site, page, product and FAQ', () => {
    const types = graphOf('en').map((node) => node['@type']);
    expect(types).toEqual(['Organization', 'WebSite', 'WebPage', 'Product', 'FAQPage']);
  });

  it('offers the product as a pre-order until the next release', () => {
    const offer = byType(graphOf('en'), 'Product')?.['offers'] as Node;
    expect(offer).toMatchObject({
      price: '310.00',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/PreOrder',
      priceValidUntil: '2026-10-31',
    });
  });

  it('localizes the page and FAQ', () => {
    const graph = graphOf('hu');
    expect(byType(graph, 'WebPage')).toMatchObject({
      url: 'https://bsalizz.github.io/Pumpkin-Spice/hu/',
      inLanguage: 'hu',
    });
    const faq = byType(graph, 'FAQPage')?.['mainEntity'] as Node[];
    expect(faq).toHaveLength(getDictionary('hu').faq.items.length);
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so the payload cannot close its script element', () => {
    expect(serializeJsonLd({ text: '</script><script>' })).not.toContain('<');
  });
});

describe('buildPageJsonLd', () => {
  it('places a sub-page inside the site with a breadcrumb home', () => {
    const graph = buildPageJsonLd({
      locale: 'hu',
      page: 'card/',
      name: 'Kártya',
      description: 'Leírás',
      ogImage,
      home: 'Vesperine',
    })['@graph'] as Node[];
    expect(graph.map((node) => node['@type'])).toEqual([
      'Organization',
      'WebSite',
      'WebPage',
      'BreadcrumbList',
    ]);
    expect(byType(graph, 'WebPage')?.['url']).toBe(
      'https://bsalizz.github.io/Pumpkin-Spice/hu/card/',
    );
    const crumbs = byType(graph, 'BreadcrumbList')?.['itemListElement'] as Node[];
    expect(crumbs.map((crumb) => crumb['item'])).toEqual([
      'https://bsalizz.github.io/Pumpkin-Spice/hu/',
      'https://bsalizz.github.io/Pumpkin-Spice/hu/card/',
    ]);
  });
});
