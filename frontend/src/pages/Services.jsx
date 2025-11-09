import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiTool, 
  FiShield, 
  FiSettings, 
  FiBook,
  FiTruck,
  FiClock,
  FiArrowRight,
  FiCheck,
  FiUsers,
  FiAward
} from 'react-icons/fi';
import UnderConstruction from '../components/common/UnderConstruction';

const ServicesPage = () => {
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="Services Page Under Construction"
        subtitle="We're detailing our comprehensive service offerings!"
        description="Our Services page is currently being enhanced with detailed service descriptions, pricing information, and process workflows. We're working hard to provide you with comprehensive information about our professional scaffolding services and solutions."
        showContactInfo={true}
      />
    );
  }

  const services = [
    {
      id: 'scaffolding-delivery',
      title: 'Scaffolding Delivery',
      description: 'On-time delivery and pickup of scaffolding systems across UAE with careful handling and scheduling.',
      icon: FiTruck,
      image: 'delivery',
      features: [
        'UAE-wide logistics network',
        'Scheduled delivery windows',
        'Careful loading and unloading',
        'Pickup on completion',
        'Real-time coordination'
      ],
      process: [
        'Confirm address and access details',
        'Schedule time window',
        'Secure transport and handling',
        'Drop-off verification',
        'Pickup upon project completion'
      ],
      pricing: 'Distance and load-based pricing',
      duration: 'Same-day or scheduled'
    },
    {
      id: 'aluminium-scaffolding',
      title: 'Aluminium Scaffolding',
      description: 'Lightweight aluminium scaffolding supply, rental, and setup for safe and efficient access.',
      icon: FiTool,
      image: 'aluminium',
      features: [
        'Lightweight high-strength frames',
        'Quick assembly systems',
        'Multiple height options',
        'Safety guardrails and platforms',
        'Compliant with standards'
      ],
      process: [
        'Requirement assessment',
        'Package selection/quote',
        'Delivery and optional setup',
        'On-call support',
        'Pickup or after-sales support'
      ],
      pricing: 'Rental or purchase options',
      duration: 'Flexible terms'
    },
    {
      id: 'warehouse-ladder',
      title: 'Warehouse Ladder',
      description: 'Industrial warehouse ladders for safe picking and access with stable platforms and guardrails.',
      icon: FiTool,
      image: 'warehouse-ladder',
      features: [
        'Stable platform designs',
        'Anti-slip steps',
        'Guardrails and handrails',
        'Heavy-duty wheels',
        'Custom heights available'
      ],
      process: [
        'Use-case assessment',
        'Model selection',
        'Delivery and instructions',
        'Periodic maintenance options',
        'Support and parts'
      ],
      pricing: 'Model-based pricing',
      duration: 'Stock or made-to-order'
    },
    {
      id: 'fiberglass-ladder',
      title: 'Fiberglass Ladder',
      description: 'Non-conductive fiberglass ladders ideal for electrical environments and outdoor use.',
      icon: FiTool,
      image: 'fiberglass-ladder',
      features: [
        'Non-conductive material',
        'Weather resistant',
        'Wide step options',
        'Lightweight yet sturdy',
        'Safety compliant'
      ],
      process: [
        'Requirement capture',
        'Size/type recommendation',
        'Delivery or pickup',
        'Usage guidance',
        'After-sales support'
      ],
      pricing: 'Competitive per model',
      duration: 'Immediate for stocked sizes'
    },
    {
      id: 'a-type-ladder',
      title: 'A Type Ladder',
      description: 'Versatile A-type ladders for maintenance and access with secure locking and anti-slip feet.',
      icon: FiTool,
      image: 'a-type-ladder',
      features: [
        'Durable hinge and locks',
        'Anti-slip feet and steps',
        'Multiple heights',
        'Lightweight portability',
        'Indoor and outdoor use'
      ],
      process: [
        'Height selection',
        'Order confirmation',
        'Dispatch and delivery',
        'Verification on receipt',
        'Support as needed'
      ],
      pricing: 'Per height/model',
      duration: 'Same-day dispatch (stock)'
    },
    {
      id: 'ladder-manufacturers',
      title: 'Ladder Manufacturers',
      description: 'Custom ladder manufacturing and bulk supply for projects and businesses with documentation.',
      icon: FiTool,
      image: 'ladder-manufacturers',
      features: [
        'Custom sizes and materials',
        'Bulk order pricing',
        'Compliance certificates',
        'Branding options',
        'After-sales support'
      ],
      process: [
        'BOQ/spec review',
        'Design recommendation',
        'Production and QA',
        'Dispatch and delivery',
        'Documentation and support'
      ],
      pricing: 'Quotation based on BOQ',
      duration: 'Lead times per order size'
    },
    {
      id: 'single-width-mobile-towers',
      title: 'Single Width Mobile Towers',
      description: 'Compact single width mobile towers available for sale and hire, perfect for confined spaces and indoor applications.',
      icon: FiTool,
      image: 'single-width-mobile',
      features: [
        'Compact footprint design',
        'Easy maneuverability',
        'Quick assembly system',
        'Ideal for narrow spaces',
        'Sale and hire options'
      ],
      process: [
        'Site requirement assessment',
        'Tower specification selection',
        'Delivery or pickup arrangement',
        'Assembly guidance provided',
        'Ongoing support during rental'
      ],
      pricing: 'Competitive hire and sale rates',
      duration: 'Daily/weekly/monthly hire or purchase'
    },
    {
      id: 'double-width-mobile-towers',
      title: 'Double Width Mobile Towers',
      description: 'Heavy-duty double width mobile towers for sale and hire, offering enhanced stability and larger working platforms.',
      icon: FiTool,
      image: 'double-width-mobile',
      features: [
        'Enhanced stability',
        'Higher load capacity',
        'Wider working platform',
        'Suitable for heavy-duty work',
        'Multiple height configurations'
      ],
      process: [
        'Load and height requirement review',
        'Tower configuration selection',
        'Delivery and optional setup',
        'Safety briefing and inspection',
        'Flexible rental or purchase terms'
      ],
      pricing: 'Project-based quotation',
      duration: 'Flexible hire periods or outright purchase'
    },
    {
      id: 'bridgeway-mobile-towers',
      title: 'Bridgeway Mobile Towers',
      description: 'Specialized bridgeway mobile towers designed for safe access between two elevated points with secure crossing platforms.',
      icon: FiTool,
      image: 'bridgeway-mobile',
      features: [
        'Dual access point design',
        'Safe crossing platform',
        'Adjustable height settings',
        'Secure locking mechanism',
        'Compliance certified'
      ],
      process: [
        'Span and height assessment',
        'Configuration planning',
        'Delivery and assembly',
        'Safety inspection and approval',
        'Usage training and support'
      ],
      pricing: 'Custom quotation based on span',
      duration: 'Available for hire or purchase'
    },
    {
      id: 'folding-mobile-towers',
      title: 'Folding Mobile Towers',
      description: 'Innovative folding mobile towers featuring compact folding design for easy transportation, storage, and rapid deployment.',
      icon: FiTool,
      image: 'folding-mobile',
      features: [
        'Compact folding mechanism',
        'Space-saving storage',
        'Easy transportation',
        'Quick setup and deployment',
        'Lightweight aluminum construction'
      ],
      process: [
        'Requirement and usage assessment',
        'Model selection and demo',
        'Delivery with folding instructions',
        'Setup training provided',
        'Maintenance and support'
      ],
      pricing: 'Competitive pricing for hire/sale',
      duration: 'Immediate availability from stock'
    },
    {
      id: 'stairway-mobile-towers',
      title: 'Stairway Mobile Towers',
      description: 'Mobile towers with integrated internal stairway access for enhanced safety, eliminating ladder climbing.',
      icon: FiTool,
      image: 'stairway-mobile',
      features: [
        'Internal stairway access',
        'Enhanced worker safety',
        'Easy and safe climbing',
        'Handrails and guardrails',
        'Suitable for all heights'
      ],
      process: [
        'Height and access requirements',
        'Tower selection and planning',
        'Delivery and professional setup',
        'Safety inspection and handover',
        'Flexible hire or purchase'
      ],
      pricing: 'Premium pricing for enhanced safety',
      duration: 'Daily to long-term rental or sale'
    },
    {
      id: 'steel-cup-lock-scaffolding',
      title: 'Steel Cup Lock Scaffolding',
      description: 'Robust steel cup lock scaffolding system ideal for heavy-duty construction applications with quick assembly features.',
      icon: FiTool,
      image: 'cup-lock',
      features: [
        'High load-bearing capacity',
        'Quick cup lock assembly',
        'Versatile configurations',
        'Suitable for complex structures',
        'Certified and compliant'
      ],
      process: [
        'Project scope and BOQ review',
        'System design and planning',
        'Supply or rental arrangement',
        'Installation support available',
        'Quality checks and certification'
      ],
      pricing: 'Project-based quotation',
      duration: 'Flexible rental terms or purchase'
    },
    {
      id: 'ms-rent',
      title: 'MS Scaffolding Rent',
      description: 'Short-term and long-term MS scaffolding rental with fast delivery, setup assistance, and compliant equipment across UAE.',
      icon: FiTruck,
      image: 'ms-rent',
      features: [
        'Daily/weekly/monthly rental terms',
        'Rapid delivery and pickup',
        'Erection & dismantling support',
        'Certified, well-maintained stock',
        'Safety-compliant accessories'
      ],
      process: [
        'Requirement assessment & quote',
        'Scheduling and delivery',
        'Optional setup assistance',
        'On-call support during rental',
        'Pickup at project completion'
      ],
      pricing: 'Competitive project-based pricing',
      duration: 'Flexible: daily to long-term contracts'
    },
    {
      id: 'ms-sale',
      title: 'MS Scaffolding Sale',
      description: 'Supply of new MS scaffolding systems and components with expert guidance, documentation, and after-sales support.',
      icon: FiTool,
      image: 'ms-sale',
      features: [
        'Full system packages & components',
        'Compliance certificates provided',
        'Bulk order and project pricing',
        'Delivery across UAE',
        'After-sales technical support'
      ],
      process: [
        'Bill of quantity (BOQ) review',
        'Recommendation & quotation',
        'Order confirmation & dispatch',
        'Delivery and verification',
        'After-sales support'
      ],
      pricing: 'Custom quotes based on BOQ',
      duration: 'Lead times based on stock & order size'
    },
    {
      id: 'installation-setup',
      title: 'Installation & Setup',
      description: 'Expert scaffolding installation and setup services for projects of all sizes, from residential to large-scale commercial developments.',
      icon: FiTool,
      image: 'installation',
      features: [
        'Certified installation teams',
        'Same-day service available',
        'Comprehensive safety checks',
        'Equipment quality guarantee',
        'Project timeline adherence'
      ],
      process: [
        'Site assessment and planning',
        'Safety briefing and preparation',
        'Professional installation',
        'Quality inspection and handover'
      ],
      pricing: 'Starting from $150/day',
      duration: '2-6 hours depending on complexity'
    },
    {
      id: 'installation-disassembly',
      title: 'Installation/Disassembly',
      description: 'Certified teams for safe scaffolding erection and dismantling per plan and safety standards.',
      icon: FiTool,
      image: 'installation-disassembly',
      features: [
        'Certified professional crews',
        'Method statements and tagging',
        'Site safety briefing',
        'Quality checks and handover',
        'Safe dismantling and clearance'
      ],
      process: [
        'Site assessment and planning',
        'Safety briefing and setup',
        'Erection as per plan',
        'Inspection and tagging',
        'Dismantling and site cleanup'
      ],
      pricing: 'Project-based quotation',
      duration: 'Depends on scope'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Regular maintenance and repair services to keep your scaffolding equipment in optimal condition and extend its lifespan.',
      icon: FiSettings,
      image: 'maintenance',
      features: [
        'Scheduled maintenance programs',
        'Emergency repair services',
        'Component replacement',
        'Performance optimization',
        'Extended equipment life'
      ],
      process: [
        'Equipment assessment',
        'Maintenance schedule planning',
        'Preventive maintenance work',
        'Performance monitoring'
      ],
      pricing: 'From $120/hour',
      duration: 'Scheduled or on-demand'
    },
    {
      id: 'safety-inspections',
      title: 'Safety Inspections',
      description: 'Comprehensive safety inspections and compliance checks to ensure your scaffolding meets all UAE regulations.',
      icon: FiShield,
      image: 'safety',
      features: [
        'Daily inspection reports',
        'Compliance certification',
        'Risk assessment included',
        'Digital documentation',
        'Emergency response protocols'
      ],
      process: [
        'Initial safety assessment',
        'Detailed inspection checklist',
        'Compliance report generation',
        'Certification and recommendations'
      ],
      pricing: 'From $85 per inspection',
      duration: '1-2 hours per inspection'
    },
    {
      id: 'training',
      title: 'Training',
      description: 'Professional training courses covering scaffolding safety, installation procedures, and maintenance protocols.',
      icon: FiBook,
      image: 'training',
      features: [
        'Industry-certified courses',
        'Group and individual sessions',
        'Hands-on practical training',
        'Certification upon completion',
        'Ongoing support resources'
      ],
      process: [
        'Training needs assessment',
        'Customized course design',
        'Practical and theoretical training',
        'Assessment and certification'
      ],
      pricing: 'From $195 per person',
      duration: 'Half-day to 3-day programs'
    }
  ];

  const benefits = [
    {
      icon: FiUsers,
      title: 'Expert Team',
      description: 'Certified professionals with years of experience'
    },
    {
      icon: FiShield,
      title: 'Safety First',
      description: 'Compliant with all UAE safety standards'
    },
    {
      icon: FiAward,
      title: 'Quality Guaranteed',
      description: 'Premium equipment and professional service'
    },
    {
      icon: FiClock,
      title: 'Reliable Service',
      description: 'On-time delivery and project completion'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Professional 
              <span className="text-gradient"> Scaffolding Services</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              From installation to maintenance, we provide comprehensive scaffolding 
              services designed to meet your project needs and exceed safety standards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="btn-primary">
                Get Service Quote
              </Link>
              <a href="tel:+971581375601" className="btn-secondary">
                Call +971 58 137 5601
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-surface-light dark:bg-surface-dark transition-theme">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-aluminum-50 dark:bg-surface-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Comprehensive Service Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We offer a complete range of scaffolding services to support your project 
              from planning to completion.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-4 sm:p-6 hover:shadow-2xl transition-all duration-300"
              >
                {/* Service Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Service Features</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Process */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Our Process</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    {service.process.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing and Duration */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Pricing</h5>
                      <p className="text-primary-600 dark:text-primary-400 font-bold">{service.pricing}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Duration</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{service.duration}</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Link 
                    to={`/contact-us?service=${service.id}`}
                    className="btn-primary flex-1"
                  >
                    Get Quote
                  </Link>
                  <Link 
                    to={`/services/${service.id}`}
                    className="btn-secondary flex-1"
                  >
                    Learn More
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support CTA */}
      <section className="bg-red-600 text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FiClock className="w-16 h-16 mx-auto mb-4 text-red-200" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              24/7 Emergency Support
            </h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
              Urgent scaffolding needs or safety concerns? Our emergency response 
              team is available around the clock to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+971581375601" className="btn-secondary bg-white text-red-600 hover:bg-gray-100 border-white">
                <FiClock className="w-4 h-4 mr-2" />
                Emergency Hotline
              </a>
              <Link to="/contact-us?urgent=true" className="btn-secondary border-white text-white hover:bg-white/10">
                Emergency Contact Form
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-aluminum-50 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact our expert team today for a free consultation and customized 
            service solution for your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us" className="btn-primary">
              Get Free Consultation
            </Link>
            <Link to="/projects" className="btn-secondary">
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
