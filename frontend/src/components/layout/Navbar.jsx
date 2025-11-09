import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiChevronDown 
} from 'react-icons/fi';
import { 
  toggleMobileMenu, 
  setMobileMenuOpen,
  selectMobileMenuOpen 
} from '../../redux/slices/navigationSlice';
import DarkModeToggle from '../common/DarkModeToggle';
import logo from '../../assets/logo.jpeg';

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobileMenuOpen = useSelector(selectMobileMenuOpen);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    setActiveDropdown(null);
  }, [location, dispatch]);

  const navigationItems = [
    { name: 'Home', path: '/', hasDropdown: false },
    { 
      name: 'Products', 
      path: '/products', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'Standard Scaffolding', path: '/products/standard' },
        { name: 'Mobile Towers', path: '/products/mobile-towers' },
        { name: 'Suspended Platforms', path: '/products/suspended' },
        { name: 'Temporary Roofing', path: '/products/roofing' },
      ]
    },
    { 
      name: 'Services', 
      path: '/services', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'Scaffolding Delivery', path: '/services/scaffolding-delivery' },
        { name: 'Aluminium Scaffolding', path: '/services/aluminium-scaffolding' },
        { name: 'Warehouse Ladder', path: '/services/warehouse-ladder' },
        { name: 'Fiberglass Ladder', path: '/services/fiberglass-ladder' },
        { name: 'A Type Ladder', path: '/services/a-type-ladder' },
        { name: 'Ladder Manufacturers', path: '/services/ladder-manufacturers' },
        { name: 'Single Width Mobile Towers', path: '/services/single-width-mobile-towers' },
        { name: 'Double Width Mobile Towers', path: '/services/double-width-mobile-towers' },
        { name: 'Bridgeway Mobile Towers', path: '/services/bridgeway-mobile-towers' },
        { name: 'Folding Mobile Towers', path: '/services/folding-mobile-towers' },
        { name: 'Stairway Mobile Towers', path: '/services/stairway-mobile-towers' },
        { name: 'Steel Cup Lock Scaffolding', path: '/services/steel-cup-lock-scaffolding' },
        { name: 'MS Scaffolding Rent', path: '/services/ms-rent' },
        { name: 'MS Scaffolding Sale', path: '/services/ms-sale' },
        { name: 'Installation & Setup', path: '/services/installation' },
        { name: 'Installation/Disassembly', path: '/services/installation-disassembly' },
        { name: 'Maintenance', path: '/services/maintenance' },
        { name: 'Safety Inspections', path: '/services/inspections' },
        { name: 'Training', path: '/services/training' },
      ]
    },
    { name: 'Projects', path: '/projects', hasDropdown: false },
    { name: 'Branches', path: '/branches', hasDropdown: false },
    { name: 'Safety', path: '/safety', hasDropdown: false },
    { name: 'About Us', path: '/about-us', hasDropdown: false },
    { name: 'Contact', path: '/contact-us', hasDropdown: false },
  ];

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleDropdownToggle = (itemName) => {
    if (activeDropdown === itemName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(itemName);
    }
  };

  return (
    <>
      {/* Top Contact Bar */}
      <div className="hidden md:block bg-brand-secondary-800 dark:bg-brand-secondary-900 text-white py-2 transition-theme">
        <div className="container-custom">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4" />
                <span>+971 58 137 5601 | +971 50 926 8038</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMail className="w-4 h-4" />
                <span>Sales@alcoascaffolding.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMapPin className="w-4 h-4" />
                <span>Abu Dhabi, UAE</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/contact-us" className="hover:text-brand-accent-400 transition-colors">
                Get a Quote
              </Link>
              <span className="text-brand-secondary-400">|</span>
              <Link to="/safety" className="hover:text-brand-accent-400 transition-colors">
                Safety Standards
              </Link>
              {/* <span className="text-brand-secondary-400">|</span> */}
              {/* <DarkModeToggle size="sm" /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-lg' 
          : 'bg-surface-light dark:bg-surface-dark shadow-md'
      } border-b border-border-light dark:border-border-dark`}>
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Alcoa Aluminium Scaffolding" 
                className="h-12 sm:h-14 w-auto"
              />
              <div className="hidden sm:block">
                {/* <h1 className="text-xl font-bold text-brand-primary-800 dark:text-brand-primary-200">
                  Alcoa 
                </h1> */}
                {/* <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Scaffolding Solutions</p> */}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div 
                  key={item.name} 
                  className="relative group"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-1 transition-colors font-medium ${
                      isActiveLink(item.path) 
                        ? 'nav-link-active text-brand-primary-600' 
                        : 'nav-link text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && (
                      <FiChevronDown className={`w-4 h-4 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute top-full left-0 mt-2 bg-surface-light dark:bg-surface-muted-dark rounded-lg shadow-xl border border-border-light dark:border-border-dark py-2 ${
                            item.dropdownItems.length > 8 
                              ? 'grid grid-cols-2 gap-x-4 w-[520px]' 
                              : 'w-64'
                          }`}
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              className="block px-4 py-2 text-text-secondary dark:text-text-secondary-dark hover:bg-brand-primary-50 dark:hover:bg-brand-primary-950 hover:text-brand-primary-600 transition-colors text-sm"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Button & Dark Mode Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              <DarkModeToggle size="md" />
              <Link to="/contact-us" className="btn-primary">
                Get Free Quote
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="md:hidden p-2 text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark"
            >
              <div className="container-custom py-4">
                <div className="space-y-4">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between">
                        <Link
                          to={item.path}
                          className={`transition-colors font-medium ${
                            isActiveLink(item.path) 
                              ? 'text-brand-primary-600' 
                              : 'text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600'
                          }`}
                        >
                          {item.name}
                        </Link>
                        {item.hasDropdown && (
                          <button
                            onClick={() => handleDropdownToggle(item.name)}
                            className="p-1 text-text-muted dark:text-text-muted-dark hover:text-brand-primary-600"
                          >
                            <FiChevronDown className={`w-4 h-4 transition-transform ${
                              activeDropdown === item.name ? 'rotate-180' : ''
                            }`} />
                          </button>
                        )}
                      </div>
                      
                      {/* Mobile Dropdown */}
                      {item.hasDropdown && activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="ml-4 mt-2 space-y-2"
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              className="block text-sm text-text-muted dark:text-text-muted-dark hover:text-brand-primary-600 transition-colors"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                        Theme
                      </span>
                      <DarkModeToggle size="md" />
                    </div>
                    <Link to="/contact-us" className="btn-primary w-full justify-center">
                      Get Free Quote
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
