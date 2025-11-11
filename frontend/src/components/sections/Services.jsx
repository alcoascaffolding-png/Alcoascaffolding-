import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiTool, 
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';

// Import service images - Aluminium Scaffolding Products
import singleWidthScaffolding from '../../assets/73-121-1659x2048.png';
import doubleWidthScaffolding from '../../assets/double-width-scaled-e1582796620310-ols0stmu1sfa9psr6uka5r5bi.jpg';
import stairwayScaffolding from '../../assets/STAIRWAY-681x1024.jpg';
import foldingTower from '../../assets/FOLDING-TOWER.png';
import combinationScaffolding from '../../assets/COMBINED-SCAFFOLDING.png';
import bridgeScaffolding from '../../assets/BRIDGE-SCAFFOLDING.png';
import cantileverScaffolding from '../../assets/CANTILEVER SCAFFOLDING.png';

// Ladders - All Types
import aluminiumATypeDual from '../../assets/aluminium a type dual purpose.jpg';
import aluminiumAType2Way from '../../assets/WARE-HOUSE-LADDER.png';
import aluminiumStraight from '../../assets/fiberglass-straight-scaled.jpg';
import aluminiumExtension from '../../assets/fiberglass-extension-200x300.jpg';
import aluminiumMultiPurpose from '../../assets/ALUMINIUM-PLATFORM-LADDER-.jpg';
import aluminiumCombination from '../../assets/ware house ladder.png';
import aluminiumRollingPlatform from '../../assets/WARE-HOUSE-LADDER.png';
import fiberglassATypeOneWay from '../../assets/fiberglassA-200x300.jpg';
import fiberglassATypeTwoWay from '../../assets/fiberglassA-200x300.jpg';

// Steel Cuplock Scaffolding Components
import steelStandard from '../../assets/STANDARD-1-scaled-e1582964173534-270x300.jpg';
import steelLedger from '../../assets/LEDGER-scaled-e1582976847712-768x511.jpg';
import intermediateTransom from '../../assets/DIAGONAL-BRACES-DW3-243x300.jpg';
import baseJacks from '../../assets/jacks-1.jpg';
import propJacks from '../../assets/propjack.png';
import steelPlanks from '../../assets/planks-2.jpg';
import latticeBeam from '../../assets/lattice-beam.jpg';
import woodenPlanks from '../../assets/planks-2.jpg';
import beamAluminium from '../../assets/beam-aluminium.jpg';

// Couplers - All Types
import doubleCoupler from '../../assets/double-coupler-2048x1363.jpg';
import doubleCouplerPressed from '../../assets/fixed-coupler-pressed-300x200.jpg';
import boardRetainingCoupler from '../../assets/board-retaining-clamp-2048x1363.jpg';
import swivelCoupler from '../../assets/swivel-coupler-300x200.jpg';
import swivelCouplerPressed from '../../assets/swivel-coupler-pressed-300x200.jpg';
import putlogCoupler from '../../assets/putlog-coupler-1536x1022.jpg';
import ladderClamp from '../../assets/ladder-clamp-scaled.jpg';
import beamCoupler from '../../assets/beam-coupler-2048x1363.jpg';
import toeBoardClamp from '../../assets/toe-board-clamp-300x200.jpg';
import universalClamp from '../../assets/universal-clamp-1024x681.jpg';
import sleeveCoupler from '../../assets/sleeve-coupler-200x300.jpg';
import spigotPin from '../../assets/spigot-pin-681x1024.jpg';
import jointPin from '../../assets/joint-pin-1-300x200.jpg';
import wingNut from '../../assets/wing-nut-300x200.jpg';
import rapidClamp from '../../assets/rapid-clamp-300x200.jpg';
import shutteringClamp from '../../assets/shuttering-clamp8-200x300.jpg';
import tieRod from '../../assets/tie-rod14-200x300.jpg';

const Services = () => {
  // Categorized Services
  const serviceCategories = [
    {
      category: 'Aluminium Scaffolding',
      icon: '🏗️',
      description: 'Lightweight, durable aluminium scaffolding and mobile tower solutions',
      services: [
        {
          title: 'Single Width Scaffolding',
          description: 'Tall, narrow scaffolding tower with working platform, wheels, and outriggers for stability.',
          features: ['Compact design', 'Mobile with wheels', 'Extended outriggers'],
          image: singleWidthScaffolding,
          link: '/services/single-width-scaffolding'
        },
        {
          title: 'Double Width Scaffolding',
          description: 'Wider scaffolding tower with enhanced stability and larger working platform.',
          features: ['Greater stability', 'Higher load capacity', 'Wide working platform'],
          image: doubleWidthScaffolding,
          link: '/services/double-width-scaffolding'
        },
        {
          title: 'Stairway Scaffolding',
          description: 'Scaffolding tower with integrated internal stairway for safer access to upper platform.',
          features: ['Internal stairway', 'Enhanced safety', 'Easy platform access'],
          image: stairwayScaffolding,
          link: '/services/stairway-scaffolding'
        },
        {
          title: 'Folding Tower',
          description: 'Foldable aluminium step tower designed for easy storage and transport.',
          features: ['Compact folding design', 'Easy transport', 'Quick setup'],
          image: foldingTower,
          link: '/services/folding-tower'
        },
        {
          title: 'Combination Scaffolding',
          description: 'Two towers connected by elevated platform for wider access and versatile configurations.',
          features: ['Connected dual towers', 'Wide access solution', 'Enhanced stability'],
          image: combinationScaffolding,
          link: '/services/combination-scaffolding'
        },
        {
          title: 'Bridge Scaffolding',
          description: 'Bridge-like structure with two towers supporting elevated platform for overhead access.',
          features: ['Overhead walkway', 'Dual tower support', 'Long-span platform'],
          image: bridgeScaffolding,
          link: '/services/bridge-scaffolding'
        },
        {
          title: 'Cantilever Scaffolding',
          description: 'Scaffolding with extended platform supported by cantilevered beams for hard-to-reach areas.',
          features: ['Extended reach', 'Cantilevered platform', 'Access difficult areas'],
          image: cantileverScaffolding,
          link: '/services/cantilever-scaffolding'
        }
      ]
    },
    {
      category: 'Ladders',
      icon: '🪜',
      description: 'Professional-grade aluminium and fiberglass ladders for industrial and commercial use',
      services: [
        {
          title: 'Aluminium A Type Dual Purpose',
          description: 'Wide-step A-frame ladder with robust construction for general-purpose use.',
          features: ['Dual-purpose design', 'Wide stable steps', 'Anti-slip feet'],
          image: aluminiumATypeDual,
          link: '/services/aluminium-a-type-dual'
        },
        {
          title: 'Aluminium A Type 2 Way (Heavy Duty)',
          description: 'Heavy-duty A-frame ladder with reinforced construction for demanding tasks.',
          features: ['Heavy-duty build', 'Two-way access', 'Robust structure'],
          image: aluminiumAType2Way,
          link: '/services/aluminium-a-type-2way'
        },
        {
          title: 'Aluminium Straight Ladder',
          description: 'Single-section straight ladder for leaning against vertical surfaces.',
          features: ['Lightweight aluminium', 'Multiple rung options', 'Easy to transport'],
          image: aluminiumStraight,
          link: '/services/aluminium-straight-ladder'
        },
        {
          title: 'Aluminium Extension Ladder (Rope Operated)',
          description: 'Two-section rung ladder with rope mechanism for extending to greater heights.',
          features: ['Rope-operated extension', 'Two interlocking sections', 'Extended reach'],
          image: aluminiumExtension,
          link: '/services/aluminium-extension-ladder'
        },
        {
          title: 'Aluminium Multi-Purpose Ladder',
          description: 'Versatile ladder with multiple hinges for various configurations.',
          features: ['Multiple configurations', 'Compact folding', 'Scaffold compatible'],
          image: aluminiumMultiPurpose,
          link: '/services/aluminium-multi-purpose'
        },
        {
          title: 'Aluminium Combination Ladder',
          description: 'Combined A-frame step ladder with extendable section for versatile tasks.',
          features: ['A-frame & extension combo', 'Multi-functional', 'Space-saving design'],
          image: aluminiumCombination,
          link: '/services/aluminium-combination'
        },
        {
          title: 'Aluminium Rolling Platform Ladder',
          description: 'Mobile platform ladder with guardrails and wheels for safe elevated work.',
          features: ['Wide stable platform', 'Safety guardrails', 'Easy mobility with wheels'],
          image: aluminiumRollingPlatform,
          link: '/services/aluminium-rolling-platform'
        },
        {
          title: 'Fiberglass A Type One Way Ladder',
          description: 'Non-conductive fiberglass A-frame ladder for electrical work environments.',
          features: ['Non-conductive material', 'Electrical safety rated', 'Weather resistant'],
          image: fiberglassATypeOneWay,
          link: '/services/fiberglass-a-type-oneway'
        },
        {
          title: 'Fiberglass A Type Two Way Ladder',
          description: 'Two-way access fiberglass ladder for electrical safety applications.',
          features: ['Two-way access', 'Non-conductive', 'Heavy-duty fiberglass'],
          image: fiberglassATypeTwoWay,
          link: '/services/fiberglass-a-type-twoway'
        }
      ]
    },
    {
      category: 'Steel Cuplock Scaffolding',
      icon: '🔧',
      description: 'Heavy-duty steel cuplock scaffolding systems and components for large-scale projects',
      services: [
        {
          title: 'Standard',
          description: 'Vertical steel cuplock standards with integrated cup connectors for main support.',
          features: ['Heavy-duty vertical support', 'Multiple cup positions', 'Corrosion-resistant finish'],
          image: steelStandard,
          link: '/services/cuplock-standard'
        },
        {
          title: 'Ledger',
          description: 'High-quality steel cuplock ledgers for horizontal support in scaffolding systems.',
          features: ['Durable steel construction', 'Multiple lengths available', 'Easy connection system'],
          image: steelLedger,
          link: '/services/cuplock-ledger'
        },
        {
          title: 'Intermediate Transom',
          description: 'Intermediate transoms for additional horizontal support and stability.',
          features: ['Enhanced stability', 'Quick installation', 'Load distribution'],
          image: intermediateTransom,
          link: '/services/intermediate-transom'
        },
        {
          title: 'Base Jacks',
          description: 'Adjustable base jacks for leveling scaffolding on uneven ground surfaces.',
          features: ['Height adjustable', 'Stable base plate', 'Load distribution'],
          image: baseJacks,
          link: '/services/base-jacks'
        },
        {
          title: 'Prop Jacks',
          description: 'Adjustable prop jacks for vertical support and height adjustment.',
          features: ['Height adjustable', 'Heavy-duty construction', 'Easy adjustment mechanism'],
          image: propJacks,
          link: '/services/prop-jacks'
        },
        {
          title: 'Steel Planks',
          description: 'Durable steel planks for creating safe working platforms on scaffolding.',
          features: ['Anti-slip surface', 'High strength', 'Weather resistant'],
          image: steelPlanks,
          link: '/services/steel-planks'
        },
        {
          title: 'I-Beam (Aluminium)',
          description: 'Lightweight aluminium I-beams for structural support in scaffolding systems.',
          features: ['Lightweight yet strong', 'Corrosion-resistant', 'Easy to handle'],
          image: beamAluminium,
          link: '/services/aluminium-beam'
        },
        {
          title: 'Wooden Planks',
          description: 'Heavy-duty wooden scaffolding planks with metal reinforcement for safe platforms.',
          features: ['Metal reinforced ends', 'High load capacity', 'Standard dimensions'],
          image: woodenPlanks,
          link: '/services/wooden-planks'
        },
        {
          title: 'Lattice Beam',
          description: 'Lattice truss beams for long-span support and structural reinforcement.',
          features: ['Long-span capability', 'Lightweight design', 'High strength-to-weight ratio'],
          image: latticeBeam,
          link: '/services/lattice-beam'
        }
      ]
    },
    {
      category: 'Couplers',
      icon: '🔩',
      description: 'Complete range of scaffolding couplers, clamps, and connectors for secure connections',
      services: [
        {
          title: 'Double Coupler',
          description: 'Heavy-duty double couplers with two jaws for secure 90-degree connections.',
          features: ['90-degree connection', 'High load capacity', 'Corrosion-resistant'],
          image: doubleCoupler,
          link: '/services/double-coupler'
        },
        {
          title: 'Double Coupler Pressed',
          description: 'Pressed steel double coupler with smooth finish for right-angle connections.',
          features: ['Pressed steel construction', 'Smooth finish', 'Quick installation'],
          image: doubleCouplerPressed,
          link: '/services/double-coupler-pressed'
        },
        {
          title: 'Board Retaining Coupler',
          description: 'L-bracket coupler for securing boards and planks to scaffolding tubes.',
          features: ['Board securing', 'L-bracket design', 'Single bolt mechanism'],
          image: boardRetainingCoupler,
          link: '/services/board-retaining-coupler'
        },
        {
          title: 'Swivel Coupler',
          description: 'Adjustable swivel couplers for connecting tubes at any angle with rotation.',
          features: ['360-degree rotation', 'Flexible positioning', 'Strong grip mechanism'],
          image: swivelCoupler,
          link: '/services/swivel-coupler'
        },
        {
          title: 'Swivel Coupler Pressed',
          description: 'Pressed steel swivel coupler with smooth finish for angled connections.',
          features: ['Pressed steel', 'Any angle connection', 'Swivel mechanism'],
          image: swivelCouplerPressed,
          link: '/services/swivel-coupler-pressed'
        },
        {
          title: 'Single Coupler (Putlog Coupler)',
          description: 'Single-ended coupler with fixed hook for connecting putlog tubes to standards.',
          features: ['Single-tube connection', 'Wall support', 'Easy to install'],
          image: putlogCoupler,
          link: '/services/putlog-coupler'
        },
        {
          title: 'Ladder Clamp',
          description: 'Large U-shaped clamp with wing nut for securing ladders to scaffolding.',
          features: ['U-shaped hook', 'Wing nut adjustment', 'Ladder securing'],
          image: ladderClamp,
          link: '/services/ladder-clamp'
        },
        {
          title: 'Gravlock Coupler (Beam Coupler)',
          description: 'Robust coupler with wide flat base for clamping onto beams and girders.',
          features: ['Beam support', 'Heavy load capacity', 'Secure locking system'],
          image: beamCoupler,
          link: '/services/beam-coupler'
        },
        {
          title: 'Toe Board Clamp',
          description: 'Small clamp with curved hook for securing toe boards to platform bases.',
          features: ['Toe board securing', 'Compact design', 'Easy installation'],
          image: toeBoardClamp,
          link: '/services/toe-board-clamp'
        },
        {
          title: 'Universal Clamp',
          description: 'C-shaped adjustable clamp for flexible connections between scaffolding tubes.',
          features: ['Adjustable connection', 'C-shaped body', 'Easy tightening'],
          image: universalClamp,
          link: '/services/universal-clamp'
        },
        {
          title: 'Sleeve Coupler',
          description: 'U-shaped coupler with parallel bolts for joining tubes end-to-end.',
          features: ['Length extension', 'Rigid connection', 'High tensile strength'],
          image: sleeveCoupler,
          link: '/services/sleeve-coupler'
        },
        {
          title: 'Spigot Pin',
          description: 'Square profile pin with collar for connecting vertical scaffolding standards.',
          features: ['Standard connection', 'Square profile', 'Locking hole'],
          image: spigotPin,
          link: '/services/spigot-pin'
        },
        {
          title: 'Joint Pin',
          description: 'Spring-loaded split pin for secure internal tube connections.',
          features: ['Spring-loaded', 'Internal connection', 'Easy manipulation'],
          image: jointPin,
          link: '/services/joint-pin'
        },
        {
          title: 'Wing Nut',
          description: 'Hand-tightening nut with wing projections for quick assembly and disassembly.',
          features: ['Hand-tightening', 'No wrench required', 'Quick fastening'],
          image: wingNut,
          link: '/services/wing-nut'
        },
        {
          title: 'Rapid Clamp',
          description: 'Quick-release lever clamp for efficient fastening in formwork applications.',
          features: ['Lever mechanism', 'Quick release', 'Efficient fastening'],
          image: rapidClamp,
          link: '/services/rapid-clamp'
        },
        {
          title: 'Shuttering Clamp',
          description: 'L-shaped sliding clamp for securing and aligning concrete formwork panels.',
          features: ['Formwork application', 'Sliding mechanism', 'Panel alignment'],
          image: shutteringClamp,
          link: '/services/shuttering-clamp'
        },
        {
          title: 'Tie Rod',
          description: 'Long cylindrical rod for connecting formwork panels and resisting concrete pressure.',
          features: ['Formwork connection', 'Pressure resistance', 'Long-span support'],
          image: tieRod,
          link: '/services/tie-rod'
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="section-padding bg-surface-light dark:bg-surface-dark transition-theme">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-accent-100 dark:bg-brand-accent-900 text-brand-accent-700 dark:text-brand-accent-300 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FiTool className="w-4 h-4" />
            <span>Our Services</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-3 sm:mb-4">
            Comprehensive Scaffolding Solutions
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
            From installation to maintenance, we provide end-to-end scaffolding services 
            designed to meet your project requirements and safety standards.
          </p>
        </motion.div>

        {/* Categorized Services */}
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {serviceCategories.map((categoryItem, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl sm:text-4xl">{categoryItem.icon}</span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {categoryItem.category}
                  </h3>
                </div>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 ml-12 sm:ml-14">
                  {categoryItem.description}
                </p>
              </div>

              {/* Services Grid for this Category */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {categoryItem.services.map((service, serviceIndex) => (
                  <motion.div
                    key={serviceIndex}
                    variants={itemVariants}
                    className="group h-full"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                      {/* Service Image */}
                      <div className="w-full h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                        <img 
                          src={service.image} 
                          alt={service.title}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 sm:p-6 flex-1 flex flex-col bg-white dark:bg-gray-800">
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
                          {service.title}
                        </h4>
                        
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          {service.description}
                        </p>

                        {/* Features */}
                        <ul className="space-y-2 mb-4 flex-1">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-2">
                              <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Link 
                            to={service.link}
                            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm sm:text-base transition-colors"
                          >
                            <span>Learn more</span>
                            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16 lg:mt-20"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 text-center border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Every project is unique. Our expert team will work with you to design 
              and implement the perfect scaffolding solution for your specific requirements.
            </p>
            
            <div className="flex justify-center">
              <Link 
                to="/contact-us" 
                className="text-blue-600 hover:text-blue-700 font-medium underline text-sm sm:text-base lg:text-lg"
              >
                Get Custom Quote
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
