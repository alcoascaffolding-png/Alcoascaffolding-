import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '../../data/businessFacts';

const brandAlreadyInTitle = (title) =>
  /alcoa/i.test(title || '') || new RegExp(SITE_NAME, 'i').test(title || '');

const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  ogLocale = 'en_AE',
  htmlLang,
  jsonLd,
  jsonLdExtra = [],
  breadcrumbs,
  faq,
  alternates = [],
  noindex = false,
}) => {
  const location = useLocation();

  const fullTitle = title
    ? brandAlreadyInTitle(title)
      ? title
      : `${title} | ${SITE_NAME}`
    : `Scaffolding Rental Abu Dhabi & Dubai | ${SITE_NAME}`;

  const canonicalPath = canonical ?? location.pathname;
  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;

  const breadcrumbSchema = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.path}`,
        })),
      }
    : null;

  const faqSchema =
    faq?.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }
      : null;

  const schemas = [
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
    breadcrumbSchema,
    faqSchema,
    ...(Array.isArray(jsonLdExtra) ? jsonLdExtra : []),
  ].filter(Boolean);

  const resolvedLang = htmlLang || (location.pathname.startsWith('/ar') ? 'ar' : 'en');

  return (
    <Helmet>
      <html lang={resolvedLang} />
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {alternates.map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        }
      />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
