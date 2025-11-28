/**
 * Frontend Website Environment Configuration
 * Central place for all environment variables
 */

// Production backend URL
const PRODUCTION_API_URL = 'https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api';

// Determine if we're in development mode
// In Vite: import.meta.env.DEV is true in dev server, false in production builds
// import.meta.env.PROD is false in dev server, true in production builds
// import.meta.env.MODE is 'development' in dev, 'production' in production builds
const isDev = import.meta.env.DEV === true || 
              import.meta.env.MODE === 'development' || 
              import.meta.env.VITE_ENV === 'development';

// Determine API URL:
// 1. If VITE_API_URL is explicitly set, use it (highest priority)
// 2. If in development mode, use localhost
// 3. Otherwise, use production URL (default for production builds)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (isDev) {
    return 'http://localhost:5000/api';
  }
  
  // Default to production URL for production builds
  return PRODUCTION_API_URL;
};

export const ENV_CONFIG = {
  // API Configuration
  apiUrl: getApiUrl(),
  
  // Environment
  env: import.meta.env.VITE_ENV || import.meta.env.MODE || (isDev ? 'development' : 'production'),
  isDevelopment: isDev,
  isProduction: !isDev,
  
  // Site Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Alcoa Scaffolding',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://alcoascaffolding.com',
};

// Always log configuration for debugging (helps identify issues in production)
console.log('🔧 Frontend Environment Configuration:', {
  apiUrl: ENV_CONFIG.apiUrl,
  env: ENV_CONFIG.env,
  isDevelopment: ENV_CONFIG.isDevelopment,
  isProduction: ENV_CONFIG.isProduction,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  viteApiUrl: import.meta.env.VITE_API_URL || 'not set',
  siteUrl: ENV_CONFIG.siteUrl,
});

export default ENV_CONFIG;

