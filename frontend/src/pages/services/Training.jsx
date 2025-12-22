import React from 'react';
import { Link } from 'react-router-dom';
import trainingImg from '../../assets/DSC_4753-copy-200x300.jpg';

const Training = () => {
  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            Training Programs
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark">
            Hands-on and theoretical training for scaffolding safety, erection, and maintenance best practices.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us?service=training" className="btn-primary">Enroll / Request Session</Link>
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
                src={trainingImg} 
                alt="Training" 
                className="w-full h-64 sm:h-96 object-contain bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900"
              />
            </div>
          </div>

          <div className="lg:col-span-2 card">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Courses</h2>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Scaffolding Safety Awareness</li>
              <li>Erection & Dismantling Practical</li>
              <li>Inspection & Tagging Procedures</li>
              <li>Maintenance & Care</li>
              <li>Custom corporate programs</li>
            </ul>
            <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3">Outcomes</h3>
            <ul className="list-disc pl-6 space-y-2 text-text-secondary dark:text-text-secondary-dark">
              <li>Industry-aligned competencies</li>
              <li>Certificates upon completion</li>
              <li>Ongoing support resources</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Quick Details</h3>
            <div className="space-y-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <div className="flex justify-between"><span>Format</span><span>On-site / Classroom</span></div>
              <div className="flex justify-between"><span>Group Size</span><span>Individuals / Teams</span></div>
              <div className="flex justify-between"><span>Certification</span><span>Provided</span></div>
              <div className="flex justify-between"><span>Pricing</span><span>Per person / Group</span></div>
            </div>
            <Link to="/contact-us?service=training" className="btn-primary mt-6 w-full text-center">Request Schedule</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Training;


