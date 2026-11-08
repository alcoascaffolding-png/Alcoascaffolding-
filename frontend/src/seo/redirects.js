/**
 * Duplicate / alias service URLs consolidated to one canonical page.
 * Mirrored as permanent redirects in vercel.json and excluded from the sitemap.
 */
export const SERVICE_REDIRECTS = {
  'aluminium-scaffolding': '/products/aluminium-scaffolding',
  'safety-inspections': '/services/inspections',
  'installation-setup': '/services/installation',
  'steel-cup-lock-scaffolding': '/products/steel-cuplock-scaffolding',
  'single-width-mobile-towers': '/services/single-width-scaffolding',
  'double-width-mobile-towers': '/services/double-width-scaffolding',
  'bridgeway-mobile-towers': '/services/bridge-scaffolding',
  'folding-mobile-towers': '/services/folding-tower',
  'stairway-mobile-towers': '/services/stairway-scaffolding',
};

/** Resolves an internal service path to its final URL so links never hop through a redirect. */
export const serviceHref = (serviceId) =>
  SERVICE_REDIRECTS[serviceId] || `/services/${serviceId}`;
