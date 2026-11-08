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
  LOGO_URL,
  ISO_CERT,
  MAPS_SEARCH_URL,
  postalAddressSchema,
  geoSchema,
  openingHoursSchema,
} from '../data/businessFacts';

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const businessRef = { '@id': BUSINESS_ID };

const areaServedSchema = (areas = AREA_SERVED) =>
  areas.map((name) =>
    name === 'United Arab Emirates'
      ? { '@type': 'Country', name }
      : { '@type': 'Place', name }
  );

/**
 * The one local business entity. Emitted in full on home, about and contact only;
 * every other page references it by @id so the name and NAP never diverge.
 * No aggregateRating or priceRange until verified.
 */
export const buildLocalBusinessSchema = (overrides = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': BUSINESS_ID,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  alternateName: BRAND_ALIASES,
  description:
    'Aluminium scaffolding manufacturer, supplier and rental company in Musaffah 37, Abu Dhabi — mobile scaffolding towers, steel cuplock, ladders, installation and dismantling across the UAE.',
  image: DEFAULT_OG_IMAGE,
  logo: LOGO_URL,
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
  parentOrganization: { '@id': ORGANIZATION_ID },
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
    'Aluminium scaffolding',
    'Mobile scaffolding towers',
    'Steel cuplock scaffolding',
    'Aluminium ladders',
    'Scaffolding rental',
    'Scaffolding installation',
    'Scaffolding dismantling',
    'Scaffolding inspection',
    ISO_CERT.standard,
  ],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'certification',
    name: `${ISO_CERT.standard} — certificate ${ISO_CERT.number}`,
    recognizedBy: { '@type': 'Organization', name: ISO_CERT.issuer },
  },
  ...overrides,
});

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  alternateName: BRAND_ALIASES,
  url: SITE_URL,
  logo: LOGO_URL,
  email: EMAIL_SALES,
  telephone: PHONE_PRIMARY_E164,
  address: postalAddressSchema(),
  sameAs: Object.values(SOCIAL).filter(Boolean),
});

/** WebSite schema — no fake SearchAction */
export const buildWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': ORGANIZATION_ID },
  inLanguage: ['en-AE', 'ar-AE'],
});

export const buildWebPageSchema = ({ url, name, description, lang = 'en', type = 'WebPage', hasBreadcrumb }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${url}#webpage`,
  url,
  name,
  description,
  inLanguage: lang === 'ar' ? 'ar-AE' : 'en-AE',
  isPartOf: { '@id': WEBSITE_ID },
  about: businessRef,
  ...(hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
});

export const buildServiceSchema = ({
  name,
  description,
  url,
  serviceType = 'Scaffolding Rental Service',
  areaServed = ['Abu Dhabi', 'Musaffah', 'Dubai', 'United Arab Emirates'],
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url,
  serviceType,
  provider: businessRef,
  areaServed: areaServedSchema(areaServed),
});

export const buildBlogPostingSchema = ({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline,
  description,
  url,
  mainEntityOfPage: { '@id': `${url}#webpage` },
  image: image || DEFAULT_OG_IMAGE,
  datePublished,
  dateModified: dateModified || datePublished,
  inLanguage: 'en-AE',
  author: { '@id': ORGANIZATION_ID, '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  publisher: {
    '@id': ORGANIZATION_ID,
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
  },
  about: businessRef,
});

export const buildBreadcrumbSchema = (breadcrumbs = [], url) => {
  if (!breadcrumbs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(url ? { '@id': `${url}#breadcrumb` } : {}),
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path === '/' ? '' : crumb.path}`,
    })),
  };
};

/** Only pass FAQs that are visibly rendered on the same page. */
export const buildFaqSchema = (faq = []) => {
  if (!faq?.length) return null;
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

/** Full JSON-LD set for a page; shared by SEOHead and the build-time prerender. */
export const buildPageSchemas = ({
  canonicalUrl,
  title,
  description,
  lang,
  pageType,
  jsonLd,
  breadcrumbs,
  faq,
  noindex,
}) => {
  if (noindex) return [];
  const hasBreadcrumb = Boolean(breadcrumbs?.length);
  return [
    buildWebPageSchema({ url: canonicalUrl, name: title, description, lang, type: pageType, hasBreadcrumb }),
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
    hasBreadcrumb ? buildBreadcrumbSchema(breadcrumbs, canonicalUrl) : null,
    buildFaqSchema(faq),
  ].filter(Boolean);
};
