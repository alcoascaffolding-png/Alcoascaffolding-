import { servicesData } from '../data/servicesData';

const CATEGORY_PRODUCT_MAP = {
  'Aluminium Scaffolding': '/products/aluminium-scaffolding',
  Ladders: '/products/ladders',
  'Steel Cuplock Scaffolding': '/products/steel-cuplock-scaffolding',
  Couplers: '/products/steel-cuplock-scaffolding',
  Services: '/services',
};

export const getRelatedServices = (serviceId, limit = 4) => {
  const current = servicesData[serviceId];
  if (!current) return [];

  return Object.entries(servicesData)
    .filter(
      ([id, s]) =>
        id !== serviceId &&
        s.category === current.category &&
        s.title
    )
    .slice(0, limit)
    .map(([id, s]) => ({ id, title: s.title, path: `/services/${id}` }));
};

export const getRelatedProductCategory = (category) =>
  CATEGORY_PRODUCT_MAP[category] ?? '/products';
