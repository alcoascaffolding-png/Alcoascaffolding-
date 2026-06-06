import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
        <li>
          <Link
            to="/"
            className="inline-flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FiHome className="w-4 h-4 mr-1" />
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1">
            <FiChevronRight className="w-4 h-4 text-gray-400" aria-hidden />
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900 dark:text-white" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
