/**
 * Frontend Website Environment Configuration
 * Central place for all environment variables
 */

export const ENV_CONFIG = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api',
  
  // Environment
  env: import.meta.env.VITE_ENV || 'production',
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  
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

