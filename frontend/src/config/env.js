/**
 * Frontend Website Environment Configuration
 * Central place for all environment variables
 */

// Production backend URL
const PRODUCTION_API_URL = 'https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api';
const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

// Check if we're running on localhost (runtime check)
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.0.')
);

// Determine if we're in development mode
// Priority: 1. Runtime hostname check, 2. Build-time env vars
const isDev = isLocalhost || 
              import.meta.env.DEV === true || 
              import.meta.env.MODE === 'development' || 
              import.meta.env.VITE_ENV === 'development';

// Determine API URL:
// 1. If VITE_API_URL is explicitly set, use it (highest priority)
// 2. If on localhost (runtime check), use localhost backend
// 3. Otherwise, use production URL (default for all production deployments)
const getApiUrl = () => {
  // Highest priority: explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Second priority: if running on localhost, use localhost backend
  if (isLocalhost) {
    return DEVELOPMENT_API_URL;
  }
  
  // Default: use production URL for all non-localhost deployments
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
if (typeof window !== 'undefined') {
  console.log('🔧 Frontend Environment Configuration:', {
    apiUrl: ENV_CONFIG.apiUrl,
    env: ENV_CONFIG.env,
    isDevelopment: ENV_CONFIG.isDevelopment,
    isProduction: ENV_CONFIG.isProduction,
    hostname: window.location.hostname,
    isLocalhost: isLocalhost,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    viteApiUrl: import.meta.env.VITE_API_URL || 'not set',
    siteUrl: ENV_CONFIG.siteUrl,
  });
}

export default ENV_CONFIG;

