import React from 'react';
import { Link } from 'react-router-dom';
import foldingTower from '../../assets/FOLDING-TOWER.png';

const FoldingMobileTowers = () => {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-3xl sm:max-w-4xl mx-auto px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">Folding Mobile Towers</h1>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">Innovative folding mobile towers featuring compact folding design for easy transportation, storage, and rapid deployment.</p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/contact-us?service=folding-mobile-towers" className="btn-primary">Get Quote</Link>
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
                src={foldingTower} 
                alt="Folding Mobile Towers" 
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
              />
            </div>
          </div>

          <div className="lg:col-span-2 card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Highlights</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Compact folding mechanism for space-saving storage</li>
              <li>Easy transportation in standard vehicles</li>
              <li>Quick setup and deployment in minutes</li>
              <li>Lightweight aluminum construction without compromising strength</li>
              <li>Perfect for contractors with multiple job sites</li>
              <li>Available for both sale and hire options</li>
            </ul>
            
            <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4">Our Process</h2>
            <ol className="list-decimal pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Requirement and usage assessment</li>
              <li>Model selection with demonstration available</li>
              <li>Delivery with comprehensive folding instructions</li>
              <li>Setup training and safety guidance provided</li>
              <li>Maintenance support and spare parts availability</li>
            </ol>
          </div>
          <div className="card">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Quick Details</h3>
            <div className="space-y-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex items-center justify-between gap-4"><span>Options</span><span className="text-right">Sale & Hire</span></div>
              <div className="flex items-center justify-between gap-4"><span>Pricing</span><span className="text-right">Competitive</span></div>
              <div className="flex items-center justify-between gap-4"><span>Availability</span><span className="text-right">Stock available</span></div>
              <div className="flex items-center justify-between gap-4"><span>Material</span><span className="text-right">Aluminum</span></div>
              <div className="flex items-center justify-between gap-4"><span>Setup Time</span><span className="text-right">Minutes</span></div>
            </div>
            <Link to="/contact-us?service=folding-mobile-towers" className="btn-primary mt-6 w-full text-center">Request Quote</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FoldingMobileTowers;

