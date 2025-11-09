/**
 * Email Validation Schemas
 * Input validation for email-related endpoints
 */

/**
 * Email format validation
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation (international format)
 */
const isValidPhone = (phone) => {
  // Accept various formats: +971581375601, 971581375601, 0581375601
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // Remove iframe tags
};

/**
 * Validate contact form data
 */
const validateContactForm = (data) => {
  const errors = {};
  const { name, email, phone, message } = data;

  // Required fields validation
  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters';
  }

  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!phone || phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  }
  // No format validation for phone - accept any value

  if (!message || message.trim().length === 0) {
    errors.message = 'Message is required';
  } else if (message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  } else if (message.trim().length > 5000) {
    errors.message = 'Message must not exceed 5000 characters';
  }

  // Optional fields validation
  if (data.company && data.company.trim().length > 200) {
    errors.company = 'Company name must not exceed 200 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      name: sanitizeString(name),
      email: sanitizeString(email),
      phone: sanitizeString(phone),
      message: sanitizeString(message),
      company: data.company ? sanitizeString(data.company) : '',
      projectType: data.projectType ? sanitizeString(data.projectType) : ''
    }
  };
};

/**
 * Validate quote form data
 */
const validateQuoteForm = (data) => {
  const errors = {};
  const { name, email, phone } = data;

  // Required fields validation (same as contact form)
  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters';
  }

  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!phone || phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  }
  // No format validation for phone - accept any value

  // Optional quote-specific fields validation
  if (data.projectHeight && (isNaN(data.projectHeight) || data.projectHeight < 0 || data.projectHeight > 1000)) {
    errors.projectHeight = 'Project height must be a valid number between 0 and 1000 meters';
  }

  if (data.coverageArea && (isNaN(data.coverageArea) || data.coverageArea < 0 || data.coverageArea > 100000)) {
    errors.coverageArea = 'Coverage area must be a valid number between 0 and 100000 sqm';
  }

  if (data.message && data.message.trim().length > 0) {
    if (data.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    } else if (data.message.trim().length > 5000) {
      errors.message = 'Message must not exceed 5000 characters';
    }
  }

  if (data.company && data.company.trim().length > 200) {
    errors.company = 'Company name must not exceed 200 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      name: sanitizeString(name),
      email: sanitizeString(email),
      phone: sanitizeString(phone),
      company: data.company ? sanitizeString(data.company) : '',
      projectType: data.projectType ? sanitizeString(data.projectType) : '',
      message: data.message ? sanitizeString(data.message) : '',
      projectHeight: data.projectHeight || '',
      coverageArea: data.coverageArea || '',
      duration: data.duration ? sanitizeString(data.duration) : '',
      startDate: data.startDate || ''
    }
  };
};

module.exports = {
  validateContactForm,
  validateQuoteForm,
  isValidEmail,
  isValidPhone,
  sanitizeString
};

