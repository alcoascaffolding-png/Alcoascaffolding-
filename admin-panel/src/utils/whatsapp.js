/**
 * WhatsApp Utility Functions
 * Helper functions for WhatsApp integration
 */

/**
 * Format phone number for WhatsApp
 * Removes spaces, dashes, and adds country code if needed
 */
export const formatPhoneForWhatsApp = (phone, defaultCountryCode = '971') => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If doesn't start with country code, add default (UAE +971)
  if (!cleaned.startsWith('971') && !cleaned.startsWith('+')) {
    // Remove leading 0 if exists
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    cleaned = defaultCountryCode + cleaned;
  }
  
  return cleaned;
};

/**
 * Generate WhatsApp chat URL
 * Works for both WhatsApp Web and Mobile app
 */
export const getWhatsAppUrl = (phone, message = '') => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  
  // Use wa.me - works for both web and mobile
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Generate pre-filled WhatsApp message template
 */
export const generateWhatsAppMessage = (customerName, messageType = 'contact') => {
  const templates = {
    contact: `Hello ${customerName},

Thank you for contacting Alcoa Aluminium Scaffolding.

We received your message and would like to discuss your requirements further.

When would be a convenient time for a call?

Best regards,
Alcoa Scaffolding Team
📞 +971 58 137 5601
🌐 alcoascaffolding.com`,

    quote: `Hello ${customerName},

Thank you for your quote request with Alcoa Aluminium Scaffolding!

We have reviewed your requirements and would like to provide you with a detailed quotation.

Can we schedule a brief call to discuss the specifics?

Best regards,
Alcoa Scaffolding Team
📞 +971 58 137 5601
🌐 alcoascaffolding.com`,

    followup: `Hello ${customerName},

Following up on your inquiry with Alcoa Aluminium Scaffolding.

We wanted to check if you need any additional information or assistance.

Feel free to reach out anytime!

Best regards,
Alcoa Scaffolding Team`
  };
  
  return templates[messageType] || templates.contact;
};

/**
 * Open WhatsApp chat in new window
 */
export const openWhatsAppChat = (phone, customerName, messageType = 'contact') => {
  const message = generateWhatsAppMessage(customerName, messageType);
  const url = getWhatsAppUrl(phone, message);
  
  // Open in new window
  window.open(url, '_blank', 'noopener,noreferrer');
};

