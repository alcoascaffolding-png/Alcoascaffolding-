/**
 * Google Analytics 4 tracking utilities
 * Requires GA4 gtag.js loaded in index.html (G-ZP0M0V7FRC)
 */

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
      language: path.startsWith('/ar') ? 'ar' : 'en',
    });
  }
};

export const trackWhatsAppClick = () => {
  trackEvent('whatsapp_click', {
    event_category: 'engagement',
    event_label: 'whatsapp_cta',
    page_path: window.location.pathname,
    page_title: document.title,
  });
};

export const trackPhoneClick = (phoneNumber = '+971581375601') => {
  trackEvent('phone_click', {
    event_category: 'engagement',
    event_label: phoneNumber,
    page_path: window.location.pathname,
  });
};

export const trackQuoteRequest = (service = '') => {
  trackEvent('generate_lead', {
    event_category: 'conversion',
    event_label: service,
    page_path: window.location.pathname,
  });
  trackEvent('quote_request', {
    event_category: 'conversion',
    event_label: service,
    page_path: window.location.pathname,
  });
};

export const trackFormSubmit = (params = {}) => {
  trackEvent('generate_lead', {
    event_category: 'conversion',
    event_label: 'contact_form',
    page_path: window.location.pathname,
    ...params,
  });
  trackEvent('form_submit', {
    event_category: 'conversion',
    event_label: 'contact_form',
    page_path: window.location.pathname,
    ...params,
  });
};

export const trackEmailClick = () => {
  trackEvent('email_click', {
    event_category: 'engagement',
    event_label: 'email_cta',
    page_path: window.location.pathname,
  });
};

/** Delegated click tracking for tel: and mailto: links sitewide */
export const initAnalyticsClickTracking = () => {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (event) => {
    const telLink = event.target.closest('a[href^="tel:"]');
    if (telLink) {
      trackPhoneClick(telLink.getAttribute('href')?.replace('tel:', '') || '');
      return;
    }

    const mailLink = event.target.closest('a[href^="mailto:"]');
    if (mailLink) {
      trackEmailClick();
    }
  });
};
