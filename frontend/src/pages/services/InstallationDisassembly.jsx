import React from 'react';
import { Link } from 'react-router-dom';
import cantileverScaffolding from '../../assets/CANTILEVER SCAFFOLDING.png';

const InstallationDisassembly = () => {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-3xl sm:max-w-4xl mx-auto px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">Installation / Disassembly</h1>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">Certified erection and dismantling services with tagging, safety briefings, and quality checks.</p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/contact-us?service=installation-disassembly" className="btn-primary">Get Quote</Link>
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
                src={cantileverScaffolding} 
                alt="Installation/Disassembly" 
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
              />
            </div>
          </div>

          <div className="lg:col-span-2 card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Scope</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Method statements, tagging, and barricading</li>
              <li>On-site safety briefing and supervision</li>
              <li>Professional erection with quality checks</li>
              <li>Final inspection and handover</li>
              <li>Safe dismantling and site clearance</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Quick Details</h3>
            <div className="space-y-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex items-center justify-between gap-4"><span>Teams</span><span className="text-right">Certified crews</span></div>
              <div className="flex items-center justify-between gap-4"><span>Compliance</span><span className="text-right">UAE standards</span></div>
              <div className="flex items-center justify-between gap-4"><span>Pricing</span><span className="text-right">Project-based</span></div>
            </div>
            <Link to="/contact-us?service=installation-disassembly" className="btn-primary mt-6 w-full text-center">Request Quote</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstallationDisassembly;



