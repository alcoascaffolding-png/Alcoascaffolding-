/**
 * Frontend Website Environment Configuration
 * Central place for all environment variables
 */

// Determine if we're in development mode
const isDev = import.meta.env.DEV || import.meta.env.VITE_ENV === 'development' || import.meta.env.MODE === 'development';

export const ENV_CONFIG = {
  // API Configuration - use localhost in development, production URL otherwise
  apiUrl: import.meta.env.VITE_API_URL || (isDev 
    ? 'http://localhost:5000/api' 
    : 'https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api'),
  
  // Environment
  env: import.meta.env.VITE_ENV || (isDev ? 'development' : 'production'),
  isDevelopment: isDev,
  isProduction: !isDev,
  
  // Site Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Alcoa Scaffolding',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://alcoascaffolding.com',
};

// Log configuration in development
if (ENV_CONFIG.isDevelopment) {
  console.log('🔧 Frontend Environment:', {
    apiUrl: ENV_CONFIG.apiUrl,
    env: ENV_CONFIG.env,
    siteUrl: ENV_CONFIG.siteUrl,
  });
}

export default ENV_CONFIG;

