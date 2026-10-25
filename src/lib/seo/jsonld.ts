import { SITE, type Locale } from '../../config/site.ts';
import type { Dictionary } from '../../i18n/types.ts';
import { nextRelease } from '../release.ts';
import { absoluteUrl, localeUrl } from './urls.ts';

type JsonLdNode = Record<string, unknown>;

export interface JsonLdInput {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly ogImage: string;
  /** Reference date used to compute the next release; injectable for tests. */
  readonly now?: Date;
}

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Builds the schema.org graph of the home page: organization, website, page,
 * product with its offer, and the FAQ.
 */
export function buildJsonLd({ locale, dict, ogImage, now = new Date() }: JsonLdInput): JsonLdNode {
  const pageUrl = localeUrl(locale);
  const orgId = absoluteUrl('#organization');
  const siteId = absoluteUrl('#website');
  const productId = absoluteUrl('#product');
  const release = nextRelease(now);
  const logo = absoluteUrl('icons/icon-512.png');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE.brand,
        url: absoluteUrl(),
        logo: { '@type': 'ImageObject', url: logo, width: 512, height: 512 },
        sameAs: [SITE.repository],
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: absoluteUrl(),
        name: `${SITE.product} — ${SITE.brand}`,
        publisher: { '@id': orgId },
        inLanguage: ['en', 'hu'],
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: dict.meta.title,
        description: dict.meta.description,
        inLanguage: locale,
        isPartOf: { '@id': siteId },
        about: { '@id': productId },
        primaryImageOfPage: { '@type': 'ImageObject', url: ogImage, width: 1200, height: 630 },
      },
      {
        '@type': 'Product',
        '@id': productId,
        name: SITE.product,
        description: dict.meta.description,
        image: [ogImage],
        sku: 'VSP-PS-N31',
        category: 'Food & Beverages > Spices & Seasonings',
        brand: { '@type': 'Brand', name: SITE.brand },
        manufacturer: { '@id': orgId },
        material: dict.elixir.notes.map((note) => note.name).join(', '),
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Edition', value: SITE.edition },
          { '@type': 'PropertyValue', name: 'Volume', value: '50 ml' },
        ],
        offers: {
          '@type': 'Offer',
          url: `${pageUrl}#reserve`,
          price: SITE.price.amount,
          priceCurrency: SITE.price.currency,
          availability: 'https://schema.org/PreOrder',
          availabilityStarts: release.toISOString(),
          priceValidUntil: isoDate(release),
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': orgId },
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        inLanguage: locale,
        mainEntity: dict.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export interface PageJsonLdInput {
  readonly locale: Locale;
  /** Page path relative to the locale root, e.g. `card/`. */
  readonly page: string;
  readonly name: string;
  readonly description: string;
  readonly ogImage: string;
  /** Label of the home crumb. */
  readonly home: string;
}

/**
 * Builds the graph of a secondary page: a web page inside the site, published by the
 * organization, with a breadcrumb back to the home page.
 */
export function buildPageJsonLd({
  locale,
  page,
  name,
  description,
  ogImage,
  home,
}: PageJsonLdInput): JsonLdNode {
  const pageUrl = localeUrl(locale, page);
  const orgId = absoluteUrl('#organization');
  const siteId = absoluteUrl('#website');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE.brand,
        url: absoluteUrl(),
        logo: absoluteUrl('icons/icon-512.png'),
      },
      { '@type': 'WebSite', '@id': siteId, url: absoluteUrl(), name: SITE.brand },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name,
        description,
        inLanguage: locale,
        isPartOf: { '@id': siteId },
        publisher: { '@id': orgId },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        primaryImageOfPage: { '@type': 'ImageObject', url: ogImage, width: 1200, height: 630 },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: home, item: localeUrl(locale) },
          { '@type': 'ListItem', position: 2, name, item: pageUrl },
        ],
      },
    ],
  };
}

/** Serializes JSON-LD safely for inlining inside a `<script>` element. */
export function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node).replace(/</g, '\\u003c');
}
