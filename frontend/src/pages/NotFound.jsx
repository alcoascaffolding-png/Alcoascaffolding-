import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <SEOHead
      title="Page Not Found"
      description="The page you are looking for does not exist on Alcoa Scaffolding UAE."
      canonical="/404"
      noindex
    />
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  </div>
);

export default NotFound;
