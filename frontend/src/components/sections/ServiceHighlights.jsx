import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiTool, FiShield, FiLayers, FiArrowRight } from 'react-icons/fi';

const SERVICES = [
  {
    icon: FiCalendar,
    title: 'Scaffolding Rental',
    text: 'Daily, weekly and monthly hire with delivery or warehouse pickup.',
    path: '/services/rental',
    cta: 'Rental options',
  },
  {
    icon: FiTool,
    title: 'Installation & Dismantling',
    text: 'Trained crews erect, modify and safely dismantle on site.',
    path: '/services/installation',
    cta: 'Installation service',
    extra: { label: 'Dismantling', path: '/services/installation-disassembly' },
  },
  {
    icon: FiShield,
    title: 'Scaffolding Inspection',
    text: 'Pre-use and periodic checks with written notes for HSE files.',
    path: '/scaffolding-inspection-uae',
    cta: 'Inspection service',
  },
  {
    icon: FiLayers,
    title: 'Industrial Scaffolding',
    text: 'Cuplock and tower packages for plant and construction sites.',
    path: '/construction-scaffolding-uae',
    cta: 'Industrial scaffolding',
  },
];

const ServiceHighlights = () => (
  <section className="bg-white py-14 dark:bg-surface-dark sm:py-16">
    <div className="container-custom">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Our Services</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          From supply to safe pack-down — one team for the whole job.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((service) => (
          <div
            key={service.path}
            className="flex flex-col rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <service.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              <Link to={service.path} className="hover:underline">
                {service.title}
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-300">{service.text}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <Link to={service.path} className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400">
                {service.cta}
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
              {service.extra && (
                <Link to={service.extra.path} className="text-blue-600 hover:underline dark:text-blue-400">
                  {service.extra.label}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServiceHighlights;
