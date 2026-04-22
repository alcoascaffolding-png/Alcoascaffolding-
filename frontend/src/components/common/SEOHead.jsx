import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Alcoa Aluminium Scaffolding';
const DEFAULT_IMAGE = 'https://alcoascaffolding.com/logo.jpeg';
const BASE_URL = 'https://alcoascaffolding.com';

const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  jsonLd,
  breadcrumbs,
}) => {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `Scaffolding Rental & Sale Dubai, Abu Dhabi, Musaffah | ${SITE_NAME}`;

  const canonicalUrl = canonical
    ? `${BASE_URL}${canonical}`
    : BASE_URL;

  // Build BreadcrumbList JSON-LD if provided
  const breadcrumbSchema = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${BASE_URL}${crumb.path}`,
        })),
      }
    : null;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_AE" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD: custom schema */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {/* JSON-LD: breadcrumbs */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
