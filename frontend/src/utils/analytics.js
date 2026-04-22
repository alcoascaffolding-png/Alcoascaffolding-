/**
 * Google Analytics 4 tracking utilities
 * Requires GA4 gtag.js loaded in index.html
 */

/**
 * Track a custom GA4 event
 * @param {string} eventName - GA4 event name
 * @param {object} params - Additional event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track WhatsApp button click with page context
 */
export const trackWhatsAppClick = () => {
  trackEvent('whatsapp_click', {
    event_category: 'engagement',
    event_label: 'whatsapp_cta',
    page_path: window.location.pathname,
    page_title: document.title,
  });
};

/**
 * Track phone call click
 * @param {string} phoneNumber
 */
export const trackPhoneClick = (phoneNumber = '+971581375601') => {
  trackEvent('phone_click', {
    event_category: 'engagement',
    event_label: phoneNumber,
    page_path: window.location.pathname,
  });
};

/**
 * Track quote request form submission
 * @param {string} service - Service name requested
 */
export const trackQuoteRequest = (service = '') => {
  trackEvent('quote_request', {
    event_category: 'conversion',
    event_label: service,
    page_path: window.location.pathname,
  });
};

/**
 * Track email click
 */
export const trackEmailClick = () => {
  trackEvent('email_click', {
    event_category: 'engagement',
    event_label: 'email_cta',
    page_path: window.location.pathname,
  });
};
