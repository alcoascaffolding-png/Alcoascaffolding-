import React from 'react';
import { FiTool, FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi';

const UnderConstruction = ({ 
  title = "Page Under Construction",
  subtitle = "We're working hard to bring you something amazing!",
  description = "This page is currently being developed and will be available soon. Thank you for your patience.",
  showContactInfo = true,
  customMessage = null
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Professional Header */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8">
            <FiTool className="w-10 h-10 text-gray-600 dark:text-gray-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium mb-6">
            {subtitle}
          </p>
          
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
            {customMessage || description}
          </p>
        </div>

        {/* Contact Information */}
        {showContactInfo && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center space-x-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-semibold text-gray-900 dark:text-white">+971 58 137 5601</p>
                  <p className="font-semibold text-gray-900 dark:text-white">+971 50 926 8038</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Sales@alcoascaffolding.com</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <a
            href="tel:+971581375601"
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FiPhone className="w-4 h-4 mr-2" />
            Call Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
