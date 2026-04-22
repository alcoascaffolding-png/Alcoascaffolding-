import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { servicesData } from '../../data/servicesData';
import { FiCheck, FiPhone, FiMail, FiTool } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];

  // If service doesn't exist, redirect to 404
  if (!service) {
    return <Navigate to="/services" replace />;
  }

  // Build Service JSON-LD schema for this specific service
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Alcoa Aluminium Scaffolding',
      url: 'https://alcoascaffolding.com',
      telephone: '+971581375601',
    },
    areaServed: ['Dubai', 'Abu Dhabi', 'Musaffah', 'UAE'],
    serviceType: service.category,
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <SEOHead
        title={`${service.title} in UAE | Rental & Sale | Alcoa Scaffold`}
        description={`Buy or rent ${service.title} in Dubai & Abu Dhabi. High-quality scaffolding with fast UAE delivery. Contact us for a free quote!`}
        keywords={`${service.title} UAE, ${service.title} Dubai, ${service.title} Abu Dhabi, ${service.category} UAE, scaffolding ${service.title.toLowerCase()} Musaffah`}
        canonical={`/services/${serviceId}`}
        jsonLd={serviceJsonLd}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.title, path: `/services/${serviceId}` },
        ]}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme text-center">
        <div className="container-custom max-w-3xl sm:max-w-4xl mx-auto px-4">
          {/* Category Badge */}
          <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            {service.category}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
            {service.title} in <span className="text-gradient">Dubai & Abu Dhabi</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
            Leading provider of professional {service.title.toLowerCase()} solutions. 
            We offer high-quality, certified systems for sale and rental across the UAE.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us" className="btn-primary">
              Get Free Quote
            </Link>
            <a href="tel:+971581375601" className="btn-secondary">
              Call +971 58 137 5601
            </a>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding py-12 sm:py-16">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md flex items-center justify-center py-12">
               <div className="text-8xl sm:text-9xl bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full p-8">
                <FiTool className="w-24 h-24 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* What is Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md prose dark:prose-invert max-w-none">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What is {service.title}?
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {service.description} Our {service.title.toLowerCase()} systems are engineered for maximum safety 
                and efficiency, making them the ideal choice for construction, maintenance, and industrial 
                projects across UAE. Whether you're working on a high-rise building in Dubai or a 
                residential renovation in Abu Dhabi, our scaffolding provides the stability you need.
              </p>
            </div>

            {/* Highlights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Key Features & Highlights
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How We Work - Process */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Our Process: How We Deliver Excellence
              </h2>
              <div className="space-y-4">
                {service.process ? (
                  service.process.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">{step}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">
                    We follow a systematic approach from initial requirement capture to 
                    delivery and installation, ensuring every safety protocol is strictly 
                    adhered to for your peace of mind.
                  </p>
                )}
              </div>
            </div>

             {/* Why Choose ALCOA? */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Why Choose Alcoa Scaffolding?
              </h2>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>At Alcoa Aluminium Scaffolding, we provide top-quality scaffolding solutions with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>UAE-Wide Delivery:</strong> 24/7 logistics support across Dubai, Abu Dhabi, Musaffah, and Sharjah.</li>
                  <li><strong>Certified Safety:</strong> All our {service.title.toLowerCase()} systems meet international and UAE safety regulations.</li>
                  <li><strong>Expert Installation:</strong> Professional teams available for safe erection and dismantling.</li>
                  <li><strong>Flexible Options:</strong> Competitive rates for both scaffolding rental and sales.</li>
                  <li><strong>Technical Support:</strong> On-call consultation to help you choose the right equipment for your project.</li>
                </ul>
              </div>
            </div>

            {/* Pricing Section (Cost) */}
            <div className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Service Cost & Pricing in UAE
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our pricing for {service.title.toLowerCase()} is highly competitive and depends on various 
                factors including project duration, height requirements, and delivery location. 
                We offer the best value for money in the UAE scaffolding market.
              </p>
              <div className="flex items-center text-blue-700 dark:text-blue-300 font-semibold italic">
                 <FiCheck className="mr-2" /> Request a free, no-obligation quote today for the most accurate pricing.
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

