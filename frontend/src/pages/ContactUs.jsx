import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock,
  FiSend,
  FiUser,
  FiBriefcase,
  FiMessageSquare,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import UnderConstruction from '../components/common/UnderConstruction';
import { 
  updateContactForm, 
  setContactFormSubmitting, 
  setContactFormSubmitted,
  resetContactForm,
  selectContactForm 
} from '../redux/slices/formSlice';

// Contact Form Component - Moved outside to prevent re-creation on each render
const ContactForm = ({ contactForm, handleInputChange, handleSubmit }) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={contactForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="tel"
              value={contactForm.phone}
              onChange={(e) => {
                // Only allow numbers (digits only)
                const value = e.target.value.replace(/[^\d]/g, '');
                handleInputChange('phone', value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company (Optional)
          </label>
          <div className="relative">
            <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={contactForm.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Type
        </label>
        <select
          value={contactForm.projectType}
          onChange={(e) => handleInputChange('projectType', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select project type</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="emergency">Emergency Service</option>
          <option value="rental">Equipment Rental</option>
          <option value="consultation">Consultation</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message *
        </label>
        <div className="relative">
          <FiMessageSquare className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <textarea
            rows={6}
            value={contactForm.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Tell us about your project requirements..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={contactForm.isSubmitting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {contactForm.isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Sending Message...
          </>
        ) : (
          <>
            <FiSend className="w-5 h-5 mr-2" />
            Send Message
          </>
        )}
      </button>
    </form>
  );

// Quote Form Component - Moved outside to prevent re-creation on each render
const QuoteForm = ({ contactForm, handleInputChange, dispatch }) => {
  const [quoteData, setQuoteData] = useState({
    projectHeight: '',
    coverageArea: '',
    duration: '',
    startDate: ''
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Just check if phone has at least some digits (not empty)
    return phone && phone.trim().length > 0;
  };

  const validateQuoteForm = () => {
    // Name validation
    if (!contactForm.name || contactForm.name.trim().length < 2) {
      toast.error('❌ Please enter a valid name (at least 2 characters)', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Email validation - with format check
    if (!contactForm.email || contactForm.email.trim().length === 0) {
      toast.error('❌ Please enter an email address', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (!validateEmail(contactForm.email)) {
      toast.error('❌ Please enter a valid email address (e.g., user@example.com)', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Phone validation - NO format validation, just check if not empty
    if (!contactForm.phone || !validatePhone(contactForm.phone)) {
      toast.error('❌ Please enter a phone number', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Project height validation (optional but if provided should be valid)
    if (quoteData.projectHeight && (isNaN(quoteData.projectHeight) || Number(quoteData.projectHeight) <= 0)) {
      toast.error('❌ Please enter a valid project height (greater than 0)', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Coverage area validation (optional but if provided should be valid)
    if (quoteData.coverageArea && (isNaN(quoteData.coverageArea) || Number(quoteData.coverageArea) <= 0)) {
      toast.error('❌ Please enter a valid coverage area (greater than 0)', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateQuoteForm()) {
      return;
    }

    dispatch(setContactFormSubmitting(true));
    
    // Show info toast for submission
    toast.info('📤 Sending your quote request...', {
      position: "top-right",
      autoClose: 2000,
    });
    
    try {
      // Local development:
      // const response = await fetch('http://localhost:5000/api/email/send-quote', {
      
      // Production:
      const response = await fetch('https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api/email/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          company: contactForm.company,
          projectType: contactForm.projectType,
          message: contactForm.message,
          projectHeight: quoteData.projectHeight,
          coverageArea: quoteData.coverageArea,
          duration: quoteData.duration,
          startDate: quoteData.startDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setContactFormSubmitted(true));
        toast.success('💰 Your quote request has been submitted successfully! We will send you a detailed quote within 2 hours.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Reset form after successful submission
        setTimeout(() => {
          dispatch(resetContactForm());
          setQuoteData({
            projectHeight: '',
            coverageArea: '',
            duration: '',
            startDate: ''
          });
        }, 100);
      } else {
        // Handle specific error messages from backend
        const errorMessage = data.error || 'Failed to send quote request. Please try again.';
        let errorDetails = '';
        
        // Parse error details if it's an object
        if (data.details) {
          if (typeof data.details === 'object') {
            // Extract error messages from details object
            errorDetails = Object.values(data.details).join(', ');
          } else {
            errorDetails = data.details;
          }
        }
        
        const fullMessage = errorDetails 
          ? `❌ ${errorMessage}: ${errorDetails}` 
          : `❌ ${errorMessage}`;
        
        toast.error(fullMessage, {
          position: "top-right",
          autoClose: 5000,
        });
        dispatch(setContactFormSubmitting(false));
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to send quote request. ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Cannot connect to server. Please make sure the backend server is running.';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else {
        errorMessage += 'Please try again later or contact support if the issue persists.';
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
      dispatch(setContactFormSubmitting(false));
    }
  };

  return (
    <form onSubmit={handleQuoteSubmit} className="space-y-6">
        {/* Quick Quote Form */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Quote Request
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Height (meters)
              </label>
              <input
                type="number"
                value={quoteData.projectHeight}
                onChange={(e) => setQuoteData({ ...quoteData, projectHeight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-1 focus:ring-primary-500"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coverage Area (sqm)
              </label>
              <input
                type="number"
                value={quoteData.coverageArea}
                onChange={(e) => setQuoteData({ ...quoteData, coverageArea: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-1 focus:ring-primary-500"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Duration
              </label>
              <select 
                value={quoteData.duration}
                onChange={(e) => setQuoteData({ ...quoteData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select duration</option>
                <option value="1-7 days">1-7 days</option>
                <option value="1-4 weeks">1-4 weeks</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3+ months">3+ months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={quoteData.startDate}
                onChange={(e) => setQuoteData({ ...quoteData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={contactForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="tel"
                value={contactForm.phone}
                onChange={(e) => {
                  // Only allow numbers (digits only)
                  const value = e.target.value.replace(/[^\d]/g, '');
                  handleInputChange('phone', value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company (Optional)
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={contactForm.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Type
          </label>
          <select
            value={contactForm.projectType}
            onChange={(e) => handleInputChange('projectType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select project type</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="emergency">Emergency Service</option>
            <option value="rental">Equipment Rental</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes
          </label>
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <textarea
              rows={4}
              value={contactForm.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={contactForm.isSubmitting}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {contactForm.isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending Quote Request...
            </>
          ) : (
            <>
              <FiSend className="w-5 h-5 mr-2" />
              Request Quote
            </>
          )}
        </button>
      </form>
  );
};

const ContactUs = () => {
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const dispatch = useDispatch();
  const contactForm = useSelector(selectContactForm);
  const [activeTab, setActiveTab] = useState('contact');

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="Contact Us Page Under Construction"
        subtitle="We're building a better way to connect with you!"
        description="Our Contact Us page is currently being enhanced with improved forms, better contact options, and streamlined communication features. We're working hard to provide you with the most convenient ways to reach our team."
        showContactInfo={true}
      />
    );
  }

  const contactInfo = [
    {
      icon: FiPhone,
      title: 'Phone',
      primary: '+971 58 137 5601',
      secondary: '+971 50 926 8038',
      description: 'Monday-Saturday, 8am-6pm',
      action: 'tel:+971581375601'
    },
    {
      icon: FiMail,
      title: 'Email',
      primary: 'Sales@alcoascaffolding.com',
      // secondary: 'Sales@alcoascaffolding.com',
      description: '24/7 response within 2 hours',  
      action: 'mailto:Sales@alcoascaffolding.com'
    },
    {
      icon: FiMapPin,
      title: 'Address',
      primary: 'Musaffah,Abu Dhabi, UAE',
      // secondary: 'Abu Dhabi, UAE',
      description: 'Visit our showroom and warehouse',
      action: 'https://maps.google.com'
    },
    {
      icon: FiClock,
      title: 'Emergency',
      primary: '24/7 Emergency Hotline',
      secondary: '+971 50 926 8038',
      description: 'Urgent scaffolding support',
      action: 'tel:+971509268038'
    }
  ];

  const offices = [
    {
      city: 'Abu Dhabi',
      address: 'Musaffah, Abu Dhabi, UAE',
      phone: '+971 58 137 5601',
      phone2: '+971 50 926 8038',
      email: 'Sales@alcoascaffolding.com',
      isHeadquarters: true
    }
  ];

  const handleInputChange = (field, value) => {
    dispatch(updateContactForm({ [field]: value }));
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Just check if phone has at least some digits (not empty)
    return phone && phone.trim().length > 0;
  };

  const validateForm = () => {
    // Name validation
    if (!contactForm.name || contactForm.name.trim().length < 2) {
      toast.error('❌ Please enter a valid name (at least 2 characters)', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Email validation - with format check
    if (!contactForm.email || contactForm.email.trim().length === 0) {
      toast.error('❌ Please enter an email address', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (!validateEmail(contactForm.email)) {
      toast.error('❌ Please enter a valid email address (e.g., user@example.com)', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Phone validation - NO format validation, just check if not empty
    if (!contactForm.phone || !validatePhone(contactForm.phone)) {
      toast.error('❌ Please enter a phone number', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Message validation - with minimum length
    if (!contactForm.message || contactForm.message.trim().length === 0) {
      toast.error('❌ Please enter a message', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (contactForm.message.trim().length < 10) {
      toast.error('❌ Message must be at least 10 characters long', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    dispatch(setContactFormSubmitting(true));
    
    // Show info toast for submission
    toast.info('📤 Sending your message...', {
      position: "top-right",
      autoClose: 2000,
    });
    
    try {
      // Local development:
      // const response = await fetch('http://localhost:5000/api/email/send-contact', {
      
      // Production:
      const response = await fetch('https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api/email/send-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          company: contactForm.company,
          projectType: contactForm.projectType,
          message: contactForm.message
        })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setContactFormSubmitted(true));
        toast.success('🎉 Your message has been submitted successfully! We will get back to you within 2 hours.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Reset form after successful submission
        setTimeout(() => {
          dispatch(resetContactForm());
        }, 100);
      } else {
        // Handle specific error messages from backend
        const errorMessage = data.error || 'Failed to send message. Please try again.';
        let errorDetails = '';
        
        // Parse error details if it's an object
        if (data.details) {
          if (typeof data.details === 'object') {
            // Extract error messages from details object
            errorDetails = Object.values(data.details).join(', ');
          } else {
            errorDetails = data.details;
          }
        }
        
        const fullMessage = errorDetails 
          ? `❌ ${errorMessage}: ${errorDetails}` 
          : `❌ ${errorMessage}`;
        
        toast.error(fullMessage, {
          position: "top-right",
          autoClose: 5000,
        });
        dispatch(setContactFormSubmitting(false));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to send message. ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Cannot connect to server. Please make sure the backend server is running.';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else {
        errorMessage += 'Please try again later or contact support if the issue persists.';
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
      dispatch(setContactFormSubmitting(false));
    }
  };

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
              Get In 
              <span className="text-gradient"> Touch</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              Ready to start your project? Contact our expert team for a free consultation 
              and customized scaffolding solution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {info.title}
                </h3>
                <div className="space-y-1 mb-3 px-2">
                  <p className="font-medium text-gray-900 dark:text-gray-100 break-words text-sm leading-tight">{info.primary}</p>
                  <p className="text-gray-600 dark:text-gray-300 break-words text-sm leading-tight">{info.secondary}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{info.description}</p>
                <a
                  href={info.action}
                  className="btn-primary text-sm"
                  target={info.action.startsWith('http') ? '_blank' : undefined}
                  rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  Contact Now
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="section-padding bg-aluminum-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Tab Navigation */}
              <div className="flex mb-8 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'contact'
                      ? 'bg-primary-600 text-black dark:text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Contact Form
                </button>
                <button
                  onClick={() => setActiveTab('quote')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'quote'
                      ? 'bg-primary-600 text-black dark:text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Quick Quote
                </button>
              </div>

              {/* Form Content */}
              <div className="card">
                {contactForm.submitted ? (
                  <div className="text-center py-8">
                    <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Thank you for contacting us. We'll get back to you within 2 hours.
                    </p>
                    <button
                      onClick={() => {
                        dispatch(setContactFormSubmitted(false));
                        dispatch(resetContactForm());
                      }}
                      className="btn-primary"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                      {activeTab === 'contact' ? 'Send us a Message' : 'Get Quick Quote'}
                    </h2>
                    {activeTab === 'contact' ? (
                      <ContactForm 
                        contactForm={contactForm}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                      />
                    ) : (
                      <QuoteForm 
                        contactForm={contactForm}
                        handleInputChange={handleInputChange}
                        dispatch={dispatch}
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Office Locations */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Our Locations
              </h2>

              <div className="space-y-6">
                {offices.map((office, index) => (
                  <div
                    key={index}
                    className={`card ${office.isHeadquarters ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {office.city}
                        {office.isHeadquarters && (
                          <span className="ml-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            HQ
                          </span>
                        )}
                      </h3>
                      <FiMapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <p>{office.address}</p>
                      <p>
                        <FiPhone className="w-4 h-4 inline mr-2" />
                        <a href={`tel:${office.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                          {office.phone}
                        </a>
                      </p>
                      {office.phone2 && (
                        <p>
                          <FiPhone className="w-4 h-4 inline mr-2" />
                          <a href={`tel:${office.phone2}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                            {office.phone2}
                          </a>
                        </p>
                      )}
                      <p>
                        <FiMail className="w-4 h-4 inline mr-2" />
                        <a href={`mailto:${office.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                          {office.email}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mt-8">
                <div className="flex items-center mb-4">
                  <FiAlertCircle className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">
                    Emergency Support
                  </h3>
                </div>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  For urgent scaffolding needs or safety emergencies, 
                  contact our 24/7 emergency hotline.
                </p>
                <a
                  href="tel:+971581375601"
                  className="btn-primary bg-red-600 hover:bg-red-700 border-red-600"
                >
                  <FiPhone className="w-4 h-4 mr-2" />
                  Call Emergency Line
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
