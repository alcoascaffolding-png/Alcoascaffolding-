import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { servicesData } from '../../data/servicesData';
import { FiCheck, FiPhone, FiMail } from 'react-icons/fi';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];

  // If service doesn't exist, redirect to 404
  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-3xl sm:max-w-4xl mx-auto px-4">
          {/* Category Badge */}
          <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            {service.category}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
            {service.title}
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">
            {service.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to={`/contact-us?service=${serviceId}`} 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiMail className="mr-2" />
              Get Quote
            </Link>
            <a 
              href="tel:+971581375601" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiPhone className="mr-2" />
              Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding py-12 sm:py-16">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6"
              />
            </div>

            {/* Highlights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Key Features & Highlights
              </h2>
              <ul className="space-y-3">
                {service.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Why Choose ALCOA?
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>At ALCOA Aluminium Scaffolding, we provide top-quality scaffolding solutions with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>UAE-wide delivery and logistics support</li>
                  <li>Professional installation and setup services</li>
                  <li>Compliance with international safety standards</li>
                  <li>Flexible rental and purchase options</li>
                  <li>Expert technical support and consultation</li>
                  <li>Quality-certified products</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md sticky top-24">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Quick Details
              </h3>
              <div className="space-y-3 text-sm">
                {Object.entries(service.quickDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{key}</span>
                    <span className="text-gray-900 dark:text-white text-right font-semibold">{value}</span>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-6 space-y-3">
                <Link 
                  to={`/contact-us?service=${serviceId}`}
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Quote
                </Link>
                <a 
                  href="tel:+971581375601"
                  className="block w-full text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Call: +971 58 137 5601
                </a>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-sm mb-4 text-blue-100">Our team is ready to assist you with any questions or requirements.</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <FiPhone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div>+971 58 137 5601</div>
                    <div>+971 50 926 8038</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiMail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>Sales@alcoascaffolding.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Services */}
      <section className="pb-12 sm:pb-16">
        <div className="container-custom text-center">
          <Link 
            to="/services"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
          >
            ← Back to All Services
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;

