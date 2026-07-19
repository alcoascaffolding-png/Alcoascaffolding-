import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEOHead
        title="Page Not Found | Alcoa Aluminium Scaffolding"
        description="The page you are looking for does not exist on Alcoa Scaffolding UAE."
        canonical={location.pathname === '/404' ? '/404' : location.pathname}
        noindex
      />
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Return Home
          </Link>
          <Link to="/contact-us" className="btn-secondary">
            Contact Us
          </Link>
          <Link to="/faq" className="text-blue-600 hover:underline self-center">
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
