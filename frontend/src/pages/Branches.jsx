import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiUsers, 
  FiSearch,
  FiFilter,
  FiStar,
  FiHome,
  FiTool,
  FiExternalLink
} from 'react-icons/fi';
import { branchesData, getBranchesWithService, getBranchesWithSpecialty } from '../data/branches';
import UnderConstruction from '../components/common/UnderConstruction';

const Branches = () => {
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="Branches Page Under Construction"
        subtitle="We're building a comprehensive branch locator for you!"
        description="Our branches page is currently being enhanced with advanced search, filtering, and location features. We're working hard to provide you with the best experience to find our nearest branches across UAE."
        showContactInfo={true}
      />
    );
  }

  // Get unique states for filter
  const states = useMemo(() => {
    const stateSet = new Set(branchesData.map(branch => branch.address.state));
    return Array.from(stateSet).sort();
  }, []);

  // Get unique services for filter
  const services = useMemo(() => {
    const serviceSet = new Set();
    branchesData.forEach(branch => {
      branch.services.forEach(service => serviceSet.add(service));
    });
    return Array.from(serviceSet).sort();
  }, []);

  // Filter branches based on search and filters
  const filteredBranches = useMemo(() => {
    return branchesData.filter(branch => {
      const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           branch.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = selectedState === 'all' || branch.address.state === selectedState;
      
      const matchesService = selectedService === 'all' || 
                            branch.services.includes(selectedService);

      return matchesSearch && matchesState && matchesService;
    });
  }, [searchTerm, selectedState, selectedService]);

  const formatHours = (hours) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Closed';
  };

  const getBranchTypeIcon = (type) => {
    return type === 'headquarters' ? FiStar : FiHome;
  };

  const BranchCard = ({ branch, isListView = false }) => {
    const Icon = getBranchTypeIcon(branch.type);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`card-interactive transition-theme ${
          isListView ? 'flex flex-col md:flex-row gap-6' : ''
        }`}
      >
        {/* Branch Header */}
        <div className={isListView ? 'flex-1' : ''}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                branch.type === 'headquarters' 
                  ? 'bg-brand-accent-100 dark:bg-brand-accent-900'
                  : 'bg-brand-primary-100 dark:bg-brand-primary-900'
              }`}>
                <Icon className={`w-6 h-6 ${
                  branch.type === 'headquarters'
                    ? 'text-brand-accent-600 dark:text-brand-accent-400'
                    : 'text-brand-primary-600 dark:text-brand-primary-400'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                  {branch.name}
                </h3>
                {branch.type === 'headquarters' && (
                  <span className="badge-primary text-xs">Headquarters</span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-text-muted dark:text-text-muted-dark">
                Est. {branch.established}
              </p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                {branch.staffCount} staff
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-3 mb-4">
            <FiMapPin className="w-4 h-4 text-brand-primary-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-text-secondary dark:text-text-secondary-dark">
                {branch.address.street}
              </p>
              <p className="text-text-secondary dark:text-text-secondary-dark">
                {branch.address.city}, {branch.address.state} {branch.address.postcode}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-3">
              <FiPhone className="w-4 h-4 text-brand-primary-500" />
              <div className="flex flex-col">
                <a 
                  href={`tel:${branch.contact.phone}`}
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600 transition-colors"
                >
                  {branch.contact.phone}
                </a>
                {branch.contact.phone2 && (
                  <a 
                    href={`tel:${branch.contact.phone2}`}
                    className="text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600 transition-colors"
                  >
                    {branch.contact.phone2}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FiMail className="w-4 h-4 text-brand-primary-500" />
              <a 
                href={`mailto:${branch.contact.email}`}
                className="text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary-600 transition-colors"
              >
                {branch.contact.email}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <FiClock className="w-4 h-4 text-brand-primary-500" />
              <span className="text-text-secondary dark:text-text-secondary-dark">
                Today: {formatHours(branch.hours)}
              </span>
            </div>
          </div>

          {/* Manager */}
          <div className="flex items-center space-x-3 mb-4">
            <FiUsers className="w-4 h-4 text-brand-primary-500" />
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                {branch.contact.manager}
              </p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                {branch.contact.managerTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Branch Details */}
        <div className={isListView ? 'min-w-0 md:w-80' : ''}>
          {/* Services */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              Services Available
            </h4>
            <div className="flex flex-wrap gap-1">
              {branch.services.slice(0, 4).map((service) => (
                <span key={service} className="badge bg-brand-primary-100 dark:bg-brand-primary-900 text-brand-primary-700 dark:text-brand-primary-300 text-xs">
                  {service}
                </span>
              ))}
              {branch.services.length > 4 && (
                <span className="badge bg-brand-secondary-100 dark:bg-brand-secondary-800 text-brand-secondary-700 dark:text-brand-secondary-300 text-xs">
                  +{branch.services.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              Specialties
            </h4>
            <div className="flex flex-wrap gap-1">
              {branch.specialties.map((specialty) => (
                <span key={specialty} className="badge bg-brand-accent-100 dark:bg-brand-accent-900 text-brand-accent-700 dark:text-brand-accent-300 text-xs">
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-surface-muted dark:bg-surface-muted-dark rounded-lg">
              <p className="text-lg font-bold text-brand-primary-600">
                {branch.warehouseSize}
              </p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                Warehouse
              </p>
            </div>
            <div className="text-center p-3 bg-surface-muted dark:bg-surface-muted-dark rounded-lg">
              <p className="text-lg font-bold text-brand-primary-600">
                {branch.serviceRadius}
              </p>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                Service Area
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="btn-primary flex-1 text-sm">
              <FiPhone className="w-4 h-4 mr-2" />
              Call
            </button>
            <button className="btn-secondary flex-1 text-sm">
              <FiMapPin className="w-4 h-4 mr-2" />
              Directions
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
   
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 section-padding-sm transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Our 
              <span className="text-gradient"> Branches</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              Find your nearest Alcoa Scaffolding branch across Abu Dhabi and UAE. 
              Professional service and expert support wherever you are.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-surface-light dark:bg-surface-muted-dark border-b border-border-light dark:border-border-dark transition-theme">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-text-muted-dark w-4 h-4" />
              <input
                type="text"
                placeholder="Search branches or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="form-input min-w-32"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="form-input min-w-48"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-border-light dark:border-border-dark">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-brand-primary-600 text-white'
                      : 'bg-surface-light dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-brand-primary-600 text-white'
                      : 'bg-surface-light dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-sm text-text-muted dark:text-text-muted-dark">
              Showing {filteredBranches.length} of {branchesData.length} branches
            </p>
          </div>
        </div>
      </section>

      {/* Branches Grid/List */}
      <section className="section-padding">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            {filteredBranches.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'
                    : 'space-y-6'
                }
              >
                {filteredBranches.map((branch) => (
                  <BranchCard 
                    key={branch.id} 
                    branch={branch} 
                    isListView={viewMode === 'list'}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FiMapPin className="w-16 h-16 text-text-muted dark:text-text-muted-dark mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
                  No branches found
                </h3>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
                  Try adjusting your search criteria or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedState('all');
                    setSelectedService('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-r from-brand-primary-600 to-brand-accent-600 text-white section-padding-sm">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Can't Find a Branch Near You?
            </h2>
            <p className="text-lg text-brand-primary-100 mb-8 max-w-2xl mx-auto">
              We're expanding across UAE. Contact us to discuss service 
              in your area or mobile scaffolding solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-secondary bg-white text-brand-primary-600 hover:bg-gray-50 border-white">
                <FiPhone className="w-4 h-4 mr-2" />
                Call Head Office
              </button>
              <button className="btn-secondary border-white text-white hover:bg-white/10">
                <FiMail className="w-4 h-4 mr-2" />
                Email Inquiry
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
     </>
  );
};

export default Branches;
