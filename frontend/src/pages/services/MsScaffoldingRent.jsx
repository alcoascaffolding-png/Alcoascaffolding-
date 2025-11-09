import React from 'react';
import { Link } from 'react-router-dom';
import steelScaffolding from '../../assets/steel-transfom-img.jpg';

const MsScaffoldingRent = () => {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-3xl sm:max-w-4xl mx-auto px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
            MS Scaffolding Rent
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">
            Flexible rental terms, rapid delivery, and safety-compliant MS scaffolding solutions for projects across UAE.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <Link to="/contact-us?service=ms-rent" className="btn-primary">Get Rental Quote</Link>
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
                src={steelScaffolding} 
                alt="MS Scaffolding Rent" 
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
              />
            </div>
          </div>

          <div className="lg:col-span-2 card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">What is Included</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Certified MS pipes, ledgers, standards, and platforms</li>
              <li>Optional erection/dismantling by certified team</li>
              <li>Delivery and pickup scheduling that matches your timeline</li>
              <li>On-rent support and replacements if required</li>
              <li>Compliant accessories: base jacks, couplers, guardrails</li>
            </ul>
            <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3">How It Works</h3>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Share site details and duration to receive a tailored quote.</li>
              <li>Confirm schedule for delivery and optional setup.</li>
              <li>Use equipment with on-call support throughout the rental.</li>
              <li>We collect equipment on completion.</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Quick Details</h3>
            <div className="space-y-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex items-center justify-between gap-4"><span>Terms</span><span className="text-right">Daily / Weekly / Monthly</span></div>
              <div className="flex items-center justify-between gap-4"><span>Coverage</span><span className="text-right">UAE-wide</span></div>
              <div className="flex items-center justify-between gap-4"><span>Support</span><span className="text-right">On-call during rental</span></div>
              <div className="flex items-center justify-between gap-4"><span>Pricing</span><span className="text-right">Project-based</span></div>
            </div>
            <Link to="/contact-us?service=ms-rent" className="btn-primary mt-6 w-full text-center">Request Quote</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MsScaffoldingRent;


