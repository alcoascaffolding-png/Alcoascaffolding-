import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EMAIL_SALES, EMAIL_INFO } from '../../data/contactInfo';
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
import logo from '../../assets/logo.png';

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobileMenuOpen = useSelector(selectMobileMenuOpen);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    setActiveDropdown(null);
  }, [location, dispatch]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        dispatch(setMobileMenuOpen(false));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen, dispatch]);

  const navigationItems = [
    { name: 'Home', path: '/', hasDropdown: false },
    {
      name: 'Products',
      path: '/aluminum-scaffolding-abu-dhabi',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Aluminium Scaffolding', path: '/products/aluminium-scaffolding' },
        { name: 'Ladders', path: '/products/ladders' },
        { name: 'Steel Cuplock Scaffolding', path: '/products/steel-cuplock-scaffolding' },
        { name: 'Couplers & Clamps', path: '/products/couplers' },
        { name: 'Scaffolding for Sale', path: '/scaffolding-for-sale' },
      ]
    },
    {
      name: 'Services',
      path: '/construction-scaffolding-uae',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Scaffolding Rental', path: '/services/rental' },
        { name: 'Scaffolding Delivery', path: '/services/scaffolding-delivery' },
        { name: 'Aluminium Scaffolding', path: '/products/aluminium-scaffolding' },
        { name: 'Cantilever Scaffolding', path: '/services/cantilever-scaffolding' },
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
        { name: 'Inspection UAE', path: '/scaffolding-inspection-uae' },
        { name: 'Manpower Supply', path: '/scaffolding-manpower-supply' },
        { name: 'Training', path: '/services/training' },
      ]
    },
    { name: 'Projects', path: '/projects', hasDropdown: false },
    {
      name: 'Resources',
      path: '/blog',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Blog & Guides', path: '/blog' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Safety Standards', path: '/safety' },
        { name: 'Branches', path: '/branches' },
      ]
    },
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
      <div className="hidden 2xl:block bg-brand-secondary-800 dark:bg-brand-secondary-900 text-white py-2 transition-theme">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1">
              <div className="flex items-center space-x-2">
                <FiPhone className="h-4 w-4 shrink-0" />
                <span>+971 58 137 5601 | +971 50 926 8038</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${EMAIL_SALES}`} className="hover:text-brand-accent-400 transition-colors">
                  {EMAIL_SALES}
                </a>
                <span className="text-brand-secondary-400">|</span>
                <a href={`mailto:${EMAIL_INFO}`} className="hover:text-brand-accent-400 transition-colors">
                  {EMAIL_INFO}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <FiMapPin className="h-4 w-4 shrink-0" />
                <span>Musaffah, Abu Dhabi, UAE</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center space-x-4">
              <Link to="/contact-us" className="hover:text-brand-accent-400 transition-colors">
                Get a Quote
              </Link>
              <span className="text-brand-secondary-400">|</span>
              <Link to="/safety" className="hover:text-brand-accent-400 transition-colors">
                Safety Standards
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-lg'
        : 'bg-surface-light dark:bg-surface-dark shadow-md'
        } border-b border-border-light dark:border-border-dark`}>
        <div className="container-custom">
          <div className="flex min-h-16 items-center justify-between gap-3 py-2 lg:min-h-20">
            <Link to="/" className="flex shrink-0 items-center" aria-label="Alcoa Scaffolding home">
              <img
                src={logo}
                alt="Alcoa Scaffolding UAE - scaffolding rental Abu Dhabi"
                className="h-11 w-auto sm:h-12 xl:h-14"
                width="126"
                height="56"
                fetchPriority="high"
              />
            </Link>

            <div className="hidden 2xl:flex min-w-0 items-center justify-center gap-5">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="group relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center gap-1 whitespace-nowrap text-sm font-medium transition-colors ${isActiveLink(item.path)
                      ? 'nav-link-active text-brand-primary-600'
                      : 'nav-link text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600'
                      }`}
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && (
                      <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
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
                          className={`absolute left-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-border-light bg-surface-light py-2 shadow-xl dark:border-border-dark dark:bg-surface-muted-dark ${
                            item.name === 'Services'
                              ? 'grid w-[min(42rem,90vw)] grid-cols-2 gap-x-2'
                              : 'w-64'
                          }`}
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.path}
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

            <div className="hidden shrink-0 items-center gap-3 2xl:flex">
              <DarkModeToggle size="sm" />
              <Link to="/contact-us" className="btn-primary whitespace-nowrap px-5 py-2 text-sm">
                Get Free Quote
              </Link>
            </div>

            <div className="flex items-center gap-2 2xl:hidden">
              <DarkModeToggle size="sm" />
              <button
                type="button"
                onClick={() => dispatch(toggleMobileMenu())}
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-brand-primary-50 hover:text-brand-primary-600 dark:text-text-secondary-dark dark:hover:bg-brand-primary-950"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark 2xl:hidden"
            >
              <div className="container-custom py-3">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.name} className="border-b border-border-light/70 py-1 last:border-0 dark:border-border-dark/70">
                      <div className="flex min-h-11 items-center justify-between gap-2">
                        <Link
                          to={item.path}
                          className={`flex-1 rounded-md px-2 py-2 font-medium transition-colors ${isActiveLink(item.path)
                            ? 'text-brand-primary-600'
                            : 'text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600'
                            }`}
                        >
                          {item.name}
                        </Link>
                        {item.hasDropdown && (
                          <button
                            type="button"
                            onClick={() => handleDropdownToggle(item.name)}
                            className="rounded-md p-3 text-text-muted hover:bg-brand-primary-50 hover:text-brand-primary-600 dark:text-text-muted-dark dark:hover:bg-brand-primary-950"
                            aria-label={`${activeDropdown === item.name ? 'Collapse' : 'Expand'} ${item.name}`}
                            aria-expanded={activeDropdown === item.name}
                          >
                            <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                              }`} />
                          </button>
                        )}
                      </div>

                      {item.hasDropdown && activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-2 ml-3 grid gap-1 border-l-2 border-brand-primary-100 pl-3 dark:border-brand-primary-900 sm:grid-cols-2"
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              className="block rounded-md px-2 py-2 text-sm text-text-muted transition-colors hover:bg-brand-primary-50 hover:text-brand-primary-600 dark:text-text-muted-dark dark:hover:bg-brand-primary-950"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}

                  <div className="space-y-3 pt-3">
                    <a href="tel:+971581375601" className="btn-secondary w-full justify-center px-3 py-2 text-sm">
                      Call Us
                    </a>
                    <Link to="/contact-us" className="btn-primary w-full justify-center px-4 py-3">
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
