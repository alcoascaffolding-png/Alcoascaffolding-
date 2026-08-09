import {
  SITE_URL,
  SITE_NAME,
  LEGAL_NAME,
  BRAND_ALIASES,
  PHONE_PRIMARY_E164,
  EMAIL_SALES,
  EMAIL_INFO,
  SOCIAL,
  AREA_SERVED,
  DEFAULT_OG_IMAGE,
  ISO_CERT,
  MAPS_SEARCH_URL,
  postalAddressSchema,
  geoSchema,
  openingHoursSchema,
} from '../data/businessFacts';

const areaServedSchema = () =>
  AREA_SERVED.map((name) =>
    name === 'United Arab Emirates'
      ? { '@type': 'Country', name }
      : { '@type': 'Place', name }
  );

/**
 * LocalBusiness schema without unverified aggregateRating or invented priceRange.
 */
export const buildLocalBusinessSchema = (overrides = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  alternateName: BRAND_ALIASES,
  image: DEFAULT_OG_IMAGE,
  url: SITE_URL,
  telephone: PHONE_PRIMARY_E164,
  email: EMAIL_SALES,
  hasMap: MAPS_SEARCH_URL,
  currenciesAccepted: 'AED',
  paymentAccepted: 'Cash, Bank Transfer',
  address: postalAddressSchema(),
  geo: geoSchema(),
  openingHoursSpecification: openingHoursSchema(),
  areaServed: areaServedSchema(),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: EMAIL_SALES,
      telephone: PHONE_PRIMARY_E164,
      areaServed: 'AE',
      availableLanguage: ['English', 'Arabic'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: EMAIL_INFO,
      telephone: PHONE_PRIMARY_E164,
    },
  ],
  sameAs: Object.values(SOCIAL).filter(Boolean),
  knowsAbout: [
    'Aluminium scaffolding rental',
    'Steel cuplock scaffolding',
    'Scaffolding erection and dismantling',
    'Scaffolding inspection',
    ISO_CERT.standard,
  ],
  ...overrides,
});

export const buildOrganizationSchema = (overrides = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  alternateName: BRAND_ALIASES,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  email: EMAIL_SALES,
  telephone: PHONE_PRIMARY_E164,
  address: postalAddressSchema(),
  sameAs: Object.values(SOCIAL).filter(Boolean),
  ...overrides,
});

/** WebSite schema — no fake SearchAction */
export const buildWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: ['en-AE', 'ar-AE'],
});

export const buildServiceSchema = ({
  name,
  description,
  url,
  serviceType = 'Scaffolding Rental Service',
  areaServed = AREA_SERVED,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url,
  serviceType,
  provider: { '@id': `${SITE_URL}/#business` },
  areaServed: areaServed.map((n) => ({ '@type': 'Place', name: n })),
});

/**
 * Product schema without AggregateOffer prices (quote-based until price list confirmed).
 */
export const buildProductSchema = ({ name, description, url, image, category }) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  url,
  image: image || DEFAULT_OG_IMAGE,
  brand: { '@type': 'Brand', name: SITE_NAME },
  category,
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    priceCurrency: 'AED',
    url: url || `${SITE_URL}/contact-us`,
    description: 'Request a free quote for rental or sale pricing',
  },
});

export const buildArticleSchema = ({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  description,
  url,
  mainEntityOfPage: url,
  image: image || DEFAULT_OG_IMAGE,
  datePublished,
  dateModified: dateModified || datePublished,
  author: {
    '@type': 'Organization',
    name: SITE_NAME,
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: DEFAULT_OG_IMAGE,
    },
  },
});

export const buildFaqSchema = (faq = []) => {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
};
