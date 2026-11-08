import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '../../data/businessFacts';
import { formatTitle } from '../../seo/formatTitle';
import { buildPageSchemas } from '../../utils/schemaBuilders';

export const canonicalUrlFor = (path) => `${SITE_URL}${!path || path === '/' ? '' : path}`;

const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  ogLocale = 'en_AE',
  htmlLang,
  pageType,
  jsonLd,
  jsonLdExtra = [],
  breadcrumbs,
  faq,
  alternates = [],
  noindex = false,
}) => {
  const location = useLocation();

  const fullTitle = formatTitle(title);
  const canonicalUrl = canonicalUrlFor(canonical ?? location.pathname);
  const resolvedLang = htmlLang || (location.pathname.startsWith('/ar') ? 'ar' : 'en');

  const schemas = buildPageSchemas({
    canonicalUrl,
    title: fullTitle,
    description,
    lang: resolvedLang,
    pageType,
    jsonLd: [
      ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
      ...(Array.isArray(jsonLdExtra) ? jsonLdExtra : []),
    ],
    breadcrumbs,
    faq,
    noindex,
  });

  return (
    <Helmet>
      <html lang={resolvedLang} dir={resolvedLang === 'ar' ? 'rtl' : 'ltr'} />
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
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
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
