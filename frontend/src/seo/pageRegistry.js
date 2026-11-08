/**
 * Build-time registry of every indexable URL with the same title, description, H1,
 * FAQ and JSON-LD the React pages render. Consumed by scripts/inject-prerender-meta.mjs
 * (via Vite ssrLoadModule) to write static HTML and sitemap.xml.
 */
import { SITE_URL } from '../data/businessFacts';
import { ROUTE_META, PROJECT_TITLES, PROJECT_DETAILS_NOINDEX, getProjectMeta } from '../data/routeMeta';
import { servicesData } from '../data/servicesData';
import { productCategories } from '../data/productCategories';
import { seoLandingPages } from '../data/seoLandingPages';
import { locationPages } from '../data/locationPages';
import { blogPosts } from '../data/blogPosts';
import { arabicPages, hreflangPairs } from '../data/arabicContent';
import { SERVICE_REDIRECTS, serviceHref } from './redirects';
import { getServiceSeo, getServiceQuickAnswer } from './serviceSeo';
import { getProductSeo } from './productSeo';
import { formatTitle } from './formatTitle';
import {
  getServiceIntro,
  getServiceFaq,
  getServicePricing,
  buildEnhancedServiceSchema,
} from '../utils/serviceRichContent';
import { getRelatedServices, getRelatedProductCategory } from '../utils/serviceRelatedLinks';
import {
  buildPageSchemas,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildServiceSchema,
  buildBlogPostingSchema,
} from '../utils/schemaBuilders';

const url = (path) => `${SITE_URL}${path === '/' ? '' : path}`;

const enArAlternates = (enPath, arPath) => [
  { hrefLang: 'en-AE', href: `${SITE_URL}${enPath === '/' ? '/' : enPath}` },
  { hrefLang: 'ar-AE', href: `${SITE_URL}${arPath}` },
  { hrefLang: 'x-default', href: `${SITE_URL}${enPath === '/' ? '/' : enPath}` },
];

const alternatesFor = (path) => {
  const pair = hreflangPairs[path];
  if (!pair) return [];
  return [
    { hrefLang: 'en-AE', href: pair.en },
    { hrefLang: 'ar-AE', href: pair.ar },
    { hrefLang: 'x-default', href: pair.en },
  ];
};

const finalize = (model) => {
  const title = formatTitle(model.title);
  const canonicalUrl = url(model.path);
  const lang = model.lang || 'en';
  return {
    ...model,
    lang,
    title,
    canonicalUrl,
    alternates: model.alternates || [],
    schemas: buildPageSchemas({
      canonicalUrl,
      title,
      description: model.description,
      lang,
      pageType: model.pageType,
      jsonLd: model.jsonLd,
      breadcrumbs: model.breadcrumbs,
      faq: model.faq,
      noindex: model.noindex,
    }),
  };
};

const staticModels = () => {
  const extraJsonLd = {
    '/': [buildOrganizationSchema(), buildLocalBusinessSchema(), buildWebSiteSchema()],
    '/about-us': [buildLocalBusinessSchema()],
    '/contact-us': [buildLocalBusinessSchema()],
    '/construction-scaffolding-uae': [
      buildServiceSchema({
        name: ROUTE_META['/construction-scaffolding-uae'].h1,
        description: ROUTE_META['/construction-scaffolding-uae'].description,
        url: url('/construction-scaffolding-uae'),
        serviceType: 'Industrial and construction scaffolding',
      }),
    ],
  };
  const breadcrumbs = {
    '/about-us': [{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about-us' }],
    '/contact-us': [{ name: 'Home', path: '/' }, { name: 'Contact Us', path: '/contact-us' }],
    '/construction-scaffolding-uae': [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/construction-scaffolding-uae' },
    ],
    '/aluminum-scaffolding-abu-dhabi': [
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/aluminum-scaffolding-abu-dhabi' },
    ],
    '/branches': [{ name: 'Home', path: '/' }, { name: 'Location', path: '/branches' }],
  };
  const pageTypes = {
    '/about-us': 'AboutPage',
    '/contact-us': 'ContactPage',
    '/aluminum-scaffolding-abu-dhabi': 'CollectionPage',
    '/projects': 'CollectionPage',
    '/blog': 'CollectionPage',
  };

  return Object.entries(ROUTE_META).map(([path, meta]) => ({
    path,
    kind: 'static',
    title: meta.title,
    description: meta.description,
    h1: meta.h1,
    primaryKeyword: meta.primaryKeyword,
    money: meta.money,
    noindex: meta.noindex,
    quickAnswer: meta.quickAnswer,
    sections: meta.sections || [],
    faq: meta.faq || [],
    alternates: meta.alternates?.ar ? enArAlternates(path, meta.alternates.ar) : [],
    jsonLd: extraJsonLd[path] || [],
    breadcrumbs: breadcrumbs[path],
    pageType: pageTypes[path],
    links:
      path === '/blog'
        ? blogPosts.map((p) => ({ label: p.title, path: `/blog/${p.slug}` }))
        : path === '/aluminum-scaffolding-abu-dhabi'
          ? []
          : undefined,
  }));
};

const projectModels = () =>
  Object.keys(PROJECT_TITLES).map((id) => {
    const meta = getProjectMeta(id);
    const path = `/project-details/${id}`;
    return {
      path,
      kind: 'project',
      noindex: PROJECT_DETAILS_NOINDEX,
      ...meta,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: meta.h1, path },
      ],
      links: [{ label: 'All projects', path: '/projects' }],
    };
  });

const serviceModels = () =>
  Object.entries(servicesData)
    .filter(([id]) => !SERVICE_REDIRECTS[id])
    .map(([id, service]) => {
      const seo = getServiceSeo(id, service);
      const path = `/services/${id}`;
      const pricing = getServicePricing(service);
      return {
        path,
        kind: 'service',
        title: seo.title,
        description: seo.description,
        h1: seo.h1,
        primaryKeyword: seo.primaryKeyword,
        money: seo.money,
        quickAnswer: getServiceQuickAnswer(id, service),
        intro: [service.description],
        sections: [
          { h2: `About ${service.title}`, paragraphs: [getServiceIntro(id, service)] },
          { h2: 'Key Features & Highlights', bullets: service.highlights || [] },
          {
            h2: 'Specifications',
            bullets: Object.entries(service.quickDetails || {}).map(([k, v]) => `${k}: ${v}`),
          },
          {
            h2: 'Rental & Sale Pricing (AED)',
            paragraphs: [`Quoted per ${pricing.unit}. ${pricing.note}`],
          },
          {
            h2: `Related ${service.category}`,
            links: [
              ...getRelatedServices(id).map((r) => ({ label: r.title, path: r.path })),
              { label: `All ${service.category} products`, path: getRelatedProductCategory(service.category) },
            ],
          },
        ],
        faq: getServiceFaq(id, service),
        alternates: alternatesFor(path),
        jsonLd: [buildEnhancedServiceSchema(id, service, seo.h1)],
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/construction-scaffolding-uae' },
          { name: service.title, path },
        ],
      };
    });

const productModels = () =>
  Object.entries(productCategories).map(([id, category]) => {
    const seo = getProductSeo(id, category);
    const path = `/products/${id}`;
    const items = category.serviceKeys
      .filter((key) => servicesData[key])
      .map((key) => ({ label: servicesData[key].title, path: serviceHref(key) }));
    return {
      path,
      kind: 'product',
      title: seo.title,
      description: seo.description,
      h1: seo.h1,
      primaryKeyword: seo.primaryKeyword,
      money: seo.money,
      quickAnswer: seo.quickAnswer,
      intro: [category.description],
      sections: [{ h2: `${category.title} range`, links: items }, ...(seo.sections || [])],
      faq: seo.faq || [],
      alternates: alternatesFor(path),
      jsonLd: [
        buildServiceSchema({
          name: seo.h1,
          description: seo.description,
          url: url(path),
          serviceType: `${category.category} Rental and Sale`,
        }),
      ],
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/aluminum-scaffolding-abu-dhabi' },
        { name: category.title, path },
      ],
    };
  });

const landingModels = () =>
  Object.entries(seoLandingPages).map(([key, page]) => {
    const path = `/${page.slug}`;
    return {
      path,
      kind: 'landing',
      title: page.title,
      description: page.description,
      h1: page.h1,
      primaryKeyword: page.primaryKeyword,
      money: page.money,
      quickAnswer: page.quickAnswer,
      intro: [page.intro],
      sections: [
        ...(page.sections || []),
        ...(page.zones?.length ? [{ h2: 'Coverage highlights', bullets: page.zones }] : []),
      ],
      faq: page.faq || [],
      alternates: alternatesFor(path),
      jsonLd:
        key === 'faq'
          ? []
          : [
              buildServiceSchema({
                name: page.h1,
                description: page.description,
                url: url(path),
                ...(page.areaServed ? { areaServed: page.areaServed } : {}),
              }),
            ],
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: page.h1, path },
      ],
    };
  });

const locationModels = () =>
  Object.values(locationPages).map((page) => {
    const path = `/${page.slug}`;
    return {
      path,
      kind: 'location',
      title: page.title,
      description: page.description,
      h1: page.h1,
      primaryKeyword: page.primaryKeyword,
      money: true,
      quickAnswer: page.quickAnswer,
      intro: [page.intro, ...(page.body || [])],
      sections: [
        { h2: `Service zones in ${page.city}`, bullets: page.zones },
        { h2: 'Delivery & pricing', paragraphs: [page.delivery] },
      ],
      faq: page.faq || [],
      alternates: alternatesFor(path),
      jsonLd: [
        buildServiceSchema({
          name: page.h1,
          description: page.description,
          url: url(path),
          areaServed: [page.city, 'United Arab Emirates'],
        }),
      ],
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: page.h1, path },
      ],
    };
  });

const blogModels = () =>
  blogPosts.map((post) => {
    const path = `/blog/${post.slug}`;
    const description = post.description || post.excerpt;
    return {
      path,
      kind: 'blog',
      title: post.seoTitle || post.title,
      description,
      h1: post.title,
      primaryKeyword: post.primaryKeyword,
      money: true,
      quickAnswer: post.quickAnswer,
      intro: [post.excerpt],
      sections: post.sections.map((s) => ({ h2: s.heading, paragraphs: s.body.split('\n').filter(Boolean) })),
      faq: post.faq || [],
      links: post.related,
      ogType: 'article',
      lastmod: post.updated || post.date,
      jsonLd: [
        buildBlogPostingSchema({
          headline: post.title,
          description,
          url: url(path),
          datePublished: post.date,
          dateModified: post.updated || post.date,
        }),
      ],
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
      ],
    };
  });

const arabicModels = () =>
  Object.values(arabicPages).map((page) => ({
    path: page.path,
    kind: 'arabic',
    lang: 'ar',
    title: page.title,
    description: page.description,
    h1: page.h1,
    quickAnswer: page.quickAnswer,
    intro: [page.intro],
    sections: [],
    links: [...(page.items || []), ...(page.links || [])].map((l) => ({ label: l.title, path: l.path })),
    faq: page.faq || [],
    alternates: enArAlternates(page.enPath, page.path),
  }));

export const getAllPageModels = () =>
  [
    ...staticModels(),
    ...projectModels(),
    ...serviceModels(),
    ...productModels(),
    ...landingModels(),
    ...locationModels(),
    ...blogModels(),
    ...arabicModels(),
  ].map(finalize);
