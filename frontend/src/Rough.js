  
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