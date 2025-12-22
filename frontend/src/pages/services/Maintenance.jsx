import React from 'react';
import { Link } from 'react-router-dom';
import maintenanceImg from '../../assets/DSC_4730-2-scaled.jpg';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            Maintenance Services
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">
            Preventive and corrective maintenance to keep your scaffolding safe and performance-ready.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us?service=maintenance" className="btn-primary">Book Maintenance</Link>
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
                src={maintenanceImg} 
                alt="Maintenance" 
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
              />
            </div>
          </div>

          <div className="lg:col-span-2 card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Services Offered</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Component inspection and replacement</li>
              <li>Fasteners and couplers check</li>
              <li>Structural alignment and stability tuning</li>
              <li>Cleaning and corrosion prevention</li>
              <li>Performance optimization</li>
            </ul>
            <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3">Scheduling</h3>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>On-demand maintenance</li>
              <li>Periodic preventive programs</li>
              <li>Aligned to project phases</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Quick Details</h3>
            <div className="space-y-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex justify-between"><span>Mode</span><span>On-demand / Scheduled</span></div>
              <div className="flex justify-between"><span>Coverage</span><span>UAE-wide</span></div>
              <div className="flex justify-between"><span>Response</span><span>Rapid</span></div>
              <div className="flex justify-between"><span>Pricing</span><span>Hourly / Project</span></div>
            </div>
            <Link to="/contact-us?service=maintenance" className="btn-primary mt-6 w-full text-center">Request Service</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Maintenance;


