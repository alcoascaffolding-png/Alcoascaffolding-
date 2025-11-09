import React from 'react';
import { Link } from 'react-router-dom';
import combinedScaffolding from '../../assets/COMBINED-SCAFFOLDING.png';

const MsScaffoldingSale = () => {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            MS Scaffolding Sale
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">
            Purchase high-quality MS scaffolding systems and components with documentation and expert after-sales support.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us?service=ms-sale" className="btn-primary">Request a Quote</Link>
            <a href="tel:+971581375601" className="btn-secondary">Call Now</a>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Service Image */}
          <div className="lg:col-span-3 mb-6">
            <div className="card overflow-hidden">
              <img 
                src={combinedScaffolding} 
                alt="MS Scaffolding Sale" 
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
              />
            </div>
          </div>

          <div className="lg:col-span-2 card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Product Offering</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>New MS standards, ledgers, transoms, platforms</li>
              <li>Couplers, base jacks, adjustable props, guardrails</li>
              <li>Custom BOQ solutions for residential & industrial sites</li>
              <li>Compliance certificates and documentation provided</li>
              <li>Delivery across UAE with verification on receipt</li>
            </ul>
            <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3">Purchase Process</h3>
            <ol className="list-decimal pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Share BOQ/specs or project details for recommendation.</li>
              <li>Receive formal quotation and delivery timeline.</li>
              <li>Confirm order and schedule dispatch.</li>
              <li>Delivery with documentation; verify quantities and quality.</li>
              <li>Dedicated after-sales technical support.</li>
            </ol>
          </div>
          <div className="card">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Quick Details</h3>
            <div className="space-y-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex justify-between"><span>Availability</span><span>In-stock & scheduled</span></div>
              <div className="flex justify-between"><span>Documentation</span><span>Compliance certificates</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>UAE-wide</span></div>
              <div className="flex justify-between"><span>Pricing</span><span>BOQ-based</span></div>
            </div>
            <Link to="/contact-us?service=ms-sale" className="btn-primary mt-6 w-full text-center">Get Quote</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MsScaffoldingSale;


