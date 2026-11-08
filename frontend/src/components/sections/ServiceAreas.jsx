import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const AREAS = [
  { label: 'Abu Dhabi', path: '/scaffolding-rental-abu-dhabi' },
  { label: 'Musaffah', path: '/scaffolding-rental-musaffah' },
  { label: 'KIZAD', path: '/scaffolding-rental-kizad' },
  { label: 'Yas Island', path: '/scaffolding-hire-yas-island' },
  { label: 'Dubai', path: '/scaffolding-rental-dubai' },
  { label: 'All UAE', path: '/scaffolding-rental-uae' },
];

const ServiceAreas = () => (
  <section className="bg-gray-50 py-14 dark:bg-gray-900 sm:py-16">
    <div className="container-custom text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Service Areas</h2>
      <p className="mx-auto mt-2 max-w-xl text-gray-600 dark:text-gray-300">
        One warehouse in Musaffah 37, delivering across the UAE.
      </p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {AREAS.map((area) => (
          <li key={area.path}>
            <Link
              to={area.path}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-blue-500 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:text-blue-300"
            >
              <FiMapPin className="h-4 w-4" aria-hidden="true" />
              {area.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ServiceAreas;
