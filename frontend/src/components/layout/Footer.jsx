import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock,
  FiFacebook,
  FiLinkedin,
  FiInstagram,
  FiTwitter,
  FiArrowUp
} from 'react-icons/fi';
import { motion } from 'framer-motion';
  import logo from '../../assets/logo.jpeg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about-us' },
        { name: 'Our Team', path: '/about-us#team' },
        { name: 'Careers', path: '/careers' },
        { name: 'News & Updates', path: '/news' },
        { name: 'Testimonials', path: '/testimonials' },
      ]
    },
    services: {
      title: 'Services',
      links: [
        { name: 'Scaffolding Installation', path: '/services/installation' },
        { name: 'Equipment Rental', path: '/services/rental' },
        { name: 'Safety Inspections', path: '/services/inspections' },
        { name: 'Training Programs', path: '/services/training' },
        { name: 'Maintenance', path: '/services/maintenance' },
      ]
    },
    products: {
      title: 'Products',
      links: [
        { name: 'Standard Scaffolding', path: '/products/standard' },
        { name: 'Mobile Towers', path: '/products/mobile-towers' },
        { name: 'Suspended Platforms', path: '/products/suspended' },
        { name: 'Temporary Roofing', path: '/products/roofing' },
        { name: 'Safety Equipment', path: '/products/safety' },
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'Safety Standards', path: '/safety' },
        { name: 'Project Gallery', path: '/projects' },
        { name: 'Technical Specs', path: '/resources/specs' },
        { name: 'Installation Guides', path: '/resources/guides' },
        { name: 'FAQs', path: '/resources/faq' },
      ]
    }
  };

  const contactInfo = [
    {
      icon: FiPhone,
      title: 'Phone',
      details: ['+971 58 137 5601'],
      link: 'tel:+971581375601'
    },
    {
      icon: FiMail,
      title: 'Email',
      details: ['Sales@alcoascaffolding.com'],
      link: 'mailto:Sales@alcoascaffolding.com'
    },
    {
      icon: FiMapPin,
      title: 'Address',
      details: ['Musaffah', 'Abu Dhabi, UAE'],
      link: 'https://maps.google.com'
    },
    {
      icon: FiClock,
      title: 'Business Hours',
      details: ['Monday-Saturday, 8am-6pm'],
      link: null
    }
  ];

  const socialLinks = [
    { icon: FiFacebook, url: 'https://www.facebook.com/share/1BM1JAj1mr/?mibextid=wwXIfr', label: 'Facebook' },
    { icon: FiInstagram, url: 'https://www.instagram.com/alcoa_aluminium_scaffolding?igsh=ODBrdTRiZDFib3g3', label: 'Instagram' },
    { icon: FiLinkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FiTwitter, url: 'https://twitter.com', label: 'Twitter' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container-custom py-16 relative z-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <img 
                src={logo} 
                alt="Alcoa Aluminium Scaffolding" 
                className="h-12 w-auto"
              />
              {/* <div>
                <h1 className="text-xl font-bold text-brand-primary-800 dark:text-brand-primary-200">
                  Alcoa 
                </h1>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Scaffolding Solutions</p>
              </div> */}
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 leading-relaxed text-justify max-w-sm">
              Professional scaffolding solutions in Abu Dhabi, UAE. We deliver safe, reliable, and efficient services for all your construction needs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Quick Links</h4>
              <div className="space-y-3">
                <Link to="/" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Home</Link>
                <Link to="/about-us" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">About Us</Link>
                <Link to="/services" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Services</Link>
                <Link to="/products" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Products</Link>
                <Link to="/projects" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Projects</Link>
                <Link to="/branches" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Branches</Link>
                <Link to="/safety" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Safety</Link>
                <Link to="/contact-us" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200 hover:translate-x-2">Contact Us</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Contact</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiPhone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <a href="tel:+971581375601" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                    +971 58 137 5601
                  </a>
                  <a href="tel:+971509268038" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                    +971 50 926 8038
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monday-Saturday, 8am-6pm</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <a href="mailto:Sales@alcoascaffolding.com" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium break-all">
                    Sales@alcoascaffolding.com
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">24/7 Response</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiMapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Musaffah, Abu Dhabi</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">UAE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                © {currentYear} Alcoa Aluminium Scaffolding. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
