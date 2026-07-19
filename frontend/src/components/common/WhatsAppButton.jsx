import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { trackWhatsAppClick } from '../../utils/analytics';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Your WhatsApp number - Update this with your actual number
  // Format: country code + number (no + or spaces)
  const whatsappNumber = '971581375601'; // UAE number
  const message = 'Hello! I would like to inquire about your scaffolding services.';

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const openWhatsApp = () => {
    // Track the WhatsApp click as a GA4 conversion event
    trackWhatsAppClick();
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={openWhatsApp}
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-colors hover:bg-green-600 dark:bg-green-600 dark:shadow-2xl dark:hover:bg-green-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Contact us on WhatsApp"
          title="Chat with us on WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;


