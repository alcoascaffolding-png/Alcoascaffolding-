export const arabicPages = {
  home: {
    path: '/ar',
    enPath: '/',
    title: 'تأجير سقالات دبي | Alcoa Scaffolding الإمارات',
    description:
      'تأجير وبيع السقالات في دبي وأبوظبي والمصفح. أبراج ألومنيوم من 35 درهم/يوم. توصيل سريع في جميع أنحاء الإمارات.',
    h1: 'تأجير السقالات في دبي وأبوظبي',
    intro:
      'Alcoa Aluminium Scaffolding شركة إماراتية متخصصة في تأجير وبيع السقالات الألومنيوم، أبراج الجوال، السقالات الفولاذية كuplock، والسلالم. مقرنا في المصفح — أبوظبي — مع توصيل يومي إلى دبي والشارقة. أسعار الشفافية من 35 درهم إماراتي في اليوم.',
    cta: 'احصل على عرض سعر',
    call: 'اتصل الآن',
  },
  products: {
    path: '/ar/products',
    enPath: '/products',
    title: 'منتجات السقالات | ألومنيوم وفولاذ | Alcoa',
    description: 'سقالات ألومنيوم، سلالم، ونظام cuplock فولاذي — للتأجير والبيع في الإمارات.',
    h1: 'منتجات السقالات',
    intro:
      'نوفر سقالات ألومنيوم خفيفة الوزن، سلالم ألومنيوم وفايبر جلاس، ومكونات cuplock فولاذية، بالإضافة إلى مشابك و couplers كاملة. جميع المنتجات متوفرة للتأجير أو الشراء.',
    items: [
      { title: 'سقالات ألومنيوم', path: '/products/aluminium-scaffolding' },
      { title: 'سلالم', path: '/products/ladders' },
      { title: 'سقالات cuplock فولاذية', path: '/products/steel-cuplock-scaffolding' },
      { title: 'مشابك و couplers', path: '/products/couplers' },
    ],
  },
  contact: {
    path: '/ar/contact-us',
    enPath: '/contact-us',
    title: 'اتصل بنا | Alcoa Scaffolding الإمارات',
    description: 'تواصل مع Alcoa للحصول على عرض سعر سقالات في دبي وأبوظبي. +971 58 137 5601',
    h1: 'تواصل معنا',
    intro:
      'للحصول على عرض سعر سريع، اتصل أو راسلنا عبر واتساب. فريقنا يرد خلال 30 دقيقة في ساعات العمل. المصفح، أبوظبي — توصيل في جميع الإمارات.',
    phone: '+971 58 137 5601',
    email: 'Sales@alcoascaffolding.com',
  },
  services: {
    path: '/ar/services',
    enPath: '/services',
    title: 'خدمات السقالات | Alcoa الإمارات',
    description: 'تأجير، توصيل، تركيب، وفحص سقالات في دبي وأبوظبي والمصفح.',
    h1: 'خدمات السقالات',
    intro:
      'نقدم تأجير السقالات، التوصيل 24/7، التركيب والفك، فحص السلامة، والتدريب. خدمة Musaffah warehouse مع توصيل إلى دبي وجميع مناطق الإمارات.',
    links: [
      { title: 'تأجير دبي', path: '/scaffolding-rental-dubai' },
      { title: 'تأجير أبوظبي', path: '/scaffolding-rental-abu-dhabi' },
      { title: 'سقالات ألومنيوم', path: '/services/aluminium-scaffolding' },
      { title: 'توصيل السقالات', path: '/services/scaffolding-delivery' },
    ],
  },
};

export const hreflangPairs = {
  '/': { en: 'https://alcoascaffolding.com/', ar: 'https://alcoascaffolding.com/ar' },
  '/products': {
    en: 'https://alcoascaffolding.com/products',
    ar: 'https://alcoascaffolding.com/ar/products',
  },
  '/contact-us': {
    en: 'https://alcoascaffolding.com/contact-us',
    ar: 'https://alcoascaffolding.com/ar/contact-us',
  },
  '/services': {
    en: 'https://alcoascaffolding.com/services',
    ar: 'https://alcoascaffolding.com/ar/services',
  },
};

export const getHreflangForPath = (pathname) => {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return hreflangPairs[normalized] ?? null;
};
