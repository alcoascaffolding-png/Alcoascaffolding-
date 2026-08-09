/**
 * Single source of truth for NAP, certifications, and publishable business facts.
 * Only VERIFIED fields should appear in schema markup and critical SEO claims.
 * UNCONFIRMED fields are documented for ops — do not emit as facts in schema.
 */

export const SITE_URL = 'https://alcoascaffolding.com';
export const SITE_NAME = 'Alcoa Aluminium Scaffolding';
export const LEGAL_NAME = 'ALCOA ALUMINIUM SCAFFOLDING - L.L.C - S.P.C';
export const BRAND_ALIASES = ['Alcoa Scaffold UAE', 'Alcoa Scaffolding Abu Dhabi', 'Alcoa Scaffolding'];

/** Verified contact */
export const PHONE_PRIMARY = '+971 58 137 5601';
export const PHONE_PRIMARY_E164 = '+971581375601';
export const PHONE_SECONDARY = '+971 50 926 8038';
export const PHONE_SECONDARY_E164 = '+971509268038';
export const PHONE_FAX = '+971 58 137 5602';
export const EMAIL_SALES = 'sales@alcoascaffolding.com';
export const EMAIL_INFO = 'info@alcoascaffolding.com';
export const WHATSAPP_NUMBER = '971581375601';
export const WHATSAPP_DEFAULT_MESSAGE =
  'Hello! I would like to inquire about your scaffolding services.';

/** Verified address (ISO certificate + quotation artwork) */
export const STREET_ADDRESS =
  "Ar Rahmah 4 St., Musaffah 37, Al Mantaqah As Sinai'yah 1 Street - Office number 11, 1st Floor";
export const STREET_ADDRESS_SHORT = 'Ar Rahmah 4 St., Musaffah 37, Office 11, 1st Floor';
export const ADDRESS_LOCALITY = 'Musaffah';
export const ADDRESS_REGION = 'Abu Dhabi';
export const ADDRESS_COUNTRY = 'AE';
export const ADDRESS_COUNTRY_NAME = 'United Arab Emirates';
export const FULL_ADDRESS = `${STREET_ADDRESS}, ${ADDRESS_LOCALITY}, ${ADDRESS_REGION}, ${ADDRESS_COUNTRY_NAME}`;

/**
 * Approximate warehouse coordinates used for geo meta / maps search.
 * UNCONFIRMED — confirm against live Google Business Profile pin before treating as exact.
 */
export const GEO = {
  latitude: 24.357,
  longitude: 54.508,
  confirmed: false,
};

export const MAPS_SEARCH_URL =
  'https://maps.google.com/?q=Alcoa+Aluminium+Scaffolding+Musaffah+37+Abu+Dhabi';
export const MAPS_EMBED_URL =
  'https://maps.google.com/maps?q=Alcoa+Aluminium+Scaffolding+Musaffah+37+Abu+Dhabi&output=embed';

/**
 * Published operating hours (UI-consistent Mon–Sat).
 * Friday reduced hours conflict removed until confirmed with operations.
 */
export const OPENING_HOURS = {
  monday: { opens: '08:00', closes: '18:00', label: '8am – 6pm' },
  tuesday: { opens: '08:00', closes: '18:00', label: '8am – 6pm' },
  wednesday: { opens: '08:00', closes: '18:00', label: '8am – 6pm' },
  thursday: { opens: '08:00', closes: '18:00', label: '8am – 6pm' },
  friday: { opens: '08:00', closes: '18:00', label: '8am – 6pm' },
  saturday: { opens: '08:00', closes: '18:00', label: '8am – 6pm' },
  sunday: { opens: null, closes: null, label: 'Emergency / by arrangement' },
};

export const OPENING_HOURS_SUMMARY = 'Mon–Sat 8am–6pm';

/** Verified ISO certification (certificate asset) */
export const ISO_CERT = {
  standard: 'ISO 9001:2015',
  number: '14143790',
  issuer: 'QA Certification',
  status: 'Full',
  certified: '2026-04-26',
  expires: '2029-04-26',
  surveillanceDue: '2027-04-26',
  scope:
    'Manufacturing, supply, erection, dismantling, rental and maintenance of aluminium/steel scaffolding and ladders',
};

/** Confirmed social profiles (footer). Placeholders omitted. */
export const SOCIAL = {
  facebook: 'https://www.facebook.com/share/1BM1JAj1mr/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/alcoa_aluminium_scaffolding?igsh=ODBrdTRiZDFib3g3',
};

export const AREA_SERVED = [
  'Abu Dhabi',
  'Musaffah',
  'Musaffah 37',
  'Yas Island',
  'KIZAD',
  'Dubai',
  'Sharjah',
  'United Arab Emirates',
];

export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.jpeg`;

/**
 * Fields that must NOT be published as facts until ops confirms.
 * Keep for docs / future enablement only.
 */
export const UNCONFIRMED = {
  foundingYear: '2008',
  aggregateRating: { ratingValue: '4.6', reviewCount: '5' },
  priceFromAedPerDay: 35,
  sameDayDelivery: true,
  linkedIn: 'https://www.linkedin.com/company/alcoa-scaffolding',
  twitter: null,
  staffCount: 45,
  warehouseSize: '5,000 sqm',
  projectsCompleted: '500+',
};

export const postalAddressSchema = () => ({
  '@type': 'PostalAddress',
  streetAddress: STREET_ADDRESS,
  addressLocality: ADDRESS_LOCALITY,
  addressRegion: ADDRESS_REGION,
  addressCountry: ADDRESS_COUNTRY,
});

export const geoSchema = () => ({
  '@type': 'GeoCoordinates',
  latitude: GEO.latitude,
  longitude: GEO.longitude,
});

export const openingHoursSchema = () =>
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: day,
    opens: '08:00',
    closes: '18:00',
  }));

export const whatsappUrl = (message = WHATSAPP_DEFAULT_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const telHref = (phone = PHONE_PRIMARY_E164) => `tel:${phone}`;
