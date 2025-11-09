import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import useDarkMode from '../../hooks/useDarkMode';

const DarkModeToggle = ({ className = '', size = 'md' }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className={`
        ${sizeClasses[size]} 
        relative rounded-full border border-border-light dark:border-border-dark
        bg-surface-light dark:bg-surface-muted-dark
        hover:bg-surface-muted dark:hover:bg-brand-secondary-800
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2
        shadow-sm hover:shadow-md
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            scale: darkMode ? 0 : 1,
            opacity: darkMode ? 0 : 1,
            rotate: darkMode ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <FiSun className={`${iconSizes[size]} text-brand-warning-500`} />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: darkMode ? 1 : 0,
            opacity: darkMode ? 1 : 0,
            rotate: darkMode ? 0 : -180,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <FiMoon className={`${iconSizes[size]} text-brand-primary-400`} />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default DarkModeToggle;
