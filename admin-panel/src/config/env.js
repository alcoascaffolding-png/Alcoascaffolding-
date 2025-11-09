/**
 * Environment Configuration
 * Central place for all environment variables
 */

export const ENV_CONFIG = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // Environment
  env: import.meta.env.VITE_ENV || 'production',
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Alcoa Admin Panel',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
};

// Log configuration in development
if (ENV_CONFIG.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    apiUrl: ENV_CONFIG.apiUrl,
    env: ENV_CONFIG.env,
    appName: ENV_CONFIG.appName,
    appVersion: ENV_CONFIG.appVersion,
  });
}

// Validate required environment variables
const validateEnv = () => {
  const required = ['apiUrl'];
  const missing = required.filter(key => !ENV_CONFIG[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please check your .env file');
  }
};

validateEnv();

export default ENV_CONFIG;

