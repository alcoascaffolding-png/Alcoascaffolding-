import React from 'react';
import { Link } from 'react-router-dom';
import {
  EMAIL_SALES,
  EMAIL_INFO,
  PHONE_PRIMARY,
  PHONE_PRIMARY_E164,
  PHONE_SECONDARY,
  PHONE_SECONDARY_E164,
  STREET_ADDRESS_SHORT,
  MAPS_SEARCH_URL,
  OPENING_HOURS_SUMMARY,
  SOCIAL,
} from '../../data/contactInfo';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiInstagram,
} from 'react-icons/fi';
import logo from '../../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about-us' },
        { name: 'Branches', path: '/branches' },
        { name: 'Projects', path: '/projects' },
        { name: 'Safety', path: '/safety' },
        { name: 'Blog', path: '/blog' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Contact', path: '/contact-us' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Scaffolding Rental', path: '/services/rental' },
        { name: 'Scaffolding for Sale', path: '/scaffolding-for-sale' },
        { name: 'Installation', path: '/services/installation' },
        { name: 'Inspections', path: '/scaffolding-inspection-uae' },
        { name: 'Manpower Supply', path: '/scaffolding-manpower-supply' },
        { name: 'All Services', path: '/construction-scaffolding-uae' },
      ],
    },
    {
      title: 'Products',
      links: [
        { name: 'Aluminium Scaffolding', path: '/products/aluminium-scaffolding' },
        { name: 'Ladders', path: '/products/ladders' },
        { name: 'Steel Cuplock', path: '/products/steel-cuplock-scaffolding' },
        { name: 'Couplers', path: '/products/couplers' },
        { name: 'All Products', path: '/aluminum-scaffolding-abu-dhabi' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FiFacebook, url: SOCIAL.facebook, label: 'Facebook' },
    { icon: FiInstagram, url: SOCIAL.instagram, label: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <img
                src={logo}
                alt="Alcoa Aluminium Scaffolding logo — Musaffah, Abu Dhabi, UAE"
                className="h-12 w-auto"
                width={126}
                height={56}
                loading="lazy"
              />
            </Link>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Alcoa Aluminium Scaffolding provides ISO 9001:2015-certified scaffolding rental and sales solutions from Musaffah, Abu Dhabi, serving projects across Dubai and the UAE.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  {section.title}
                </h4>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.path + link.name}
                      to={link.path}
                      className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-sm">
          <div className="flex items-start space-x-3">
            <FiPhone className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <a href={`tel:${PHONE_PRIMARY_E164}`} className="font-medium hover:text-blue-600">
                {PHONE_PRIMARY}
              </a>
              <br />
              <a href={`tel:${PHONE_SECONDARY_E164}`} className="font-medium hover:text-blue-600">
                {PHONE_SECONDARY}
              </a>
              <p className="text-xs text-gray-500 mt-1">{OPENING_HOURS_SUMMARY}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FiMail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <a href={`mailto:${EMAIL_SALES}`} className="font-medium hover:text-blue-600 break-all">
                {EMAIL_SALES}
              </a>
              <br />
              <a href={`mailto:${EMAIL_INFO}`} className="font-medium hover:text-blue-600 break-all">
                {EMAIL_INFO}
              </a>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FiMapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <a
                href={MAPS_SEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-blue-600"
              >
                {STREET_ADDRESS_SHORT}
              </a>
              <p className="text-xs text-gray-500 mt-1">Musaffah, Abu Dhabi, UAE</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {currentYear} Alcoa Aluminium Scaffolding L.L.C - S.P.C. All rights reserved.</p>
          <p className="mt-2 break-words px-2 text-xs">
            NAP: Alcoa Aluminium Scaffolding LLC · Musaffah, Abu Dhabi, UAE · {PHONE_PRIMARY} · https://alcoascaffolding.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
