import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { arabicPages } from '../data/arabicContent';

const ArabicPage = ({ pageKey }) => {
  const page = arabicPages[pageKey];

  if (!page) return null;

  const alternates = [
    { hrefLang: 'en-AE', href: `https://alcoascaffolding.com${page.enPath}` },
    { hrefLang: 'ar-AE', href: `https://alcoascaffolding.com${page.path}` },
    { hrefLang: 'x-default', href: `https://alcoascaffolding.com${page.enPath}` },
  ];

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <SEOHead
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        canonical={page.path}
        alternates={alternates}
        ogLocale="ar_AE"
        htmlLang="ar"
        faq={page.faq}
      />
      <section className="section-padding py-12 sm:py-16">
        <div className="container-custom max-w-4xl">
          <Breadcrumbs items={[{ name: page.h1, path: page.path }]} />
          <Link
            to={page.enPath}
            className="inline-block mb-6 text-sm text-blue-600 hover:underline"
            hrefLang="en"
          >
            English version
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {page.h1}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {page.intro}
          </p>

          {page.items && (
            <ul className="space-y-3 mb-8">
              {page.items.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-blue-600 hover:underline text-lg">
                    {item.title} ←
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {page.links && (
            <ul className="space-y-3 mb-8">
              {page.links.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-blue-600 hover:underline text-lg">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {page.faq?.length > 0 && (
            <div className="mb-8 space-y-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">أسئلة شائعة</h2>
              {page.faq.map((item) => (
                <details
                  key={item.q}
                  className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                  <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{item.a}</p>
                </details>
              ))}
            </div>
          )}

          {(page.phone || page.email || page.cta) && (
            <div className="flex flex-wrap items-center gap-4">
              {page.cta && (
                <Link to="/ar/contact-us" className="btn-primary">
                  {page.cta}
                </Link>
              )}
              {page.phone && (
                <a href="tel:+971581375601" className="btn-secondary">
                  {page.call ?? page.phone}
                </a>
              )}
              {page.email && (
                <a href={`mailto:${page.email}`} className="text-blue-600 hover:underline">
                  {page.email}
                </a>
              )}
              {page.emailInfo && (
                <a href={`mailto:${page.emailInfo}`} className="text-blue-600 hover:underline">
                  {page.emailInfo}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArabicPage;
