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
// CRITICAL: Runtime hostname check ALWAYS wins - prevents localhost on production
const getApiUrl = () => {
  // STEP 1: Runtime hostname check (ABSOLUTE PRIORITY - cannot be overridden)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname.toLowerCase().trim();
    
    // Explicitly check for localhost/local network - if NOT localhost, use production
    const isLocalhostDomain = hostname === 'localhost' || 
                              hostname === '127.0.0.1' || 
                              hostname === '' ||
                              hostname.startsWith('192.168.') || 
                              hostname.startsWith('10.0.');
    
    // If NOT on localhost, ALWAYS use production backend (no exceptions)
    if (!isLocalhostDomain) {
      // We're on a production/public domain - FORCE production backend
      // This overrides VITE_API_URL even if it's set to localhost
      return PRODUCTION_API_URL;
    }
    
    // If on localhost, use localhost backend
    if (isLocalhostDomain) {
      return DEVELOPMENT_API_URL;
    }
  }
  
  // STEP 2: Fallback - Check VITE_API_URL (but NEVER use localhost URLs)
  // This only applies in edge cases where hostname check didn't run
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && 
      typeof viteApiUrl === 'string' &&
      !viteApiUrl.includes('localhost') &&
      !viteApiUrl.includes('127.0.0.1') &&
      viteApiUrl.startsWith('https://')) {
    return viteApiUrl;
  }
  
  // STEP 3: Default to production URL (safest for all deployments)
  return PRODUCTION_API_URL;
};

function trimOrigin(value) {
  if (value == null || typeof value !== "string") return "";
  const t = value.trim().replace(/\/+$/, "");
  return t || "";
}

/** True when the marketing site is opened from this machine / LAN (same rule as getApiUrl localhost branch). */
function isLocalMarketingHostname() {
  if (typeof window === "undefined" || !window.location?.hostname) return false;
  const h = window.location.hostname.toLowerCase().trim();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "" ||
    h.startsWith("192.168.") ||
    h.startsWith("10.0.")
  );
}

const DEFAULT_LOCAL_ADMIN_ORIGIN = "http://localhost:3000";

/** Next default port; override with VITE_LOCAL_ADMIN_ORIGIN if admin runs elsewhere. */
const LOCAL_ADMIN_PORT = "3000";

function resolveAutoLocalAdminOrigin() {
  const explicit = trimOrigin(import.meta.env.VITE_LOCAL_ADMIN_ORIGIN);
  if (explicit) return explicit;
  if (typeof window === "undefined" || !window.location?.hostname) {
    return DEFAULT_LOCAL_ADMIN_ORIGIN;
  }
  const h = window.location.hostname.toLowerCase().trim();
  const host = h === "localhost" || h === "127.0.0.1" || h === "" ? "localhost" : h;
  return `http://${host}:${LOCAL_ADMIN_PORT}`;
}

function adminEmailPaths(origin) {
  return {
    sendContact: `${origin}/api/email/send-contact`,
    sendQuote: `${origin}/api/email/send-quote`,
  };
}

/**
 * Where contact + quick-quote forms POST so entries appear in alcoa-admin → Contact Messages.
 *
 * Priority:
 * 1. VITE_CONTACT_INGEST_ORIGIN or VITE_ADMIN_APP_ORIGIN — deployed alcoa-admin origin (https://…, no trailing slash).
 * 2. Site opened on localhost / LAN — auto `http://<same-host>:3000` (or VITE_LOCAL_ADMIN_ORIGIN).
 * 3. Legacy Express: same base as getApiUrl() + /email/send-contact|send-quote (only if that API shares MongoDB with admin).
 */
export function getContactFormApiUrls() {
  const explicit =
    trimOrigin(import.meta.env.VITE_CONTACT_INGEST_ORIGIN) ||
    trimOrigin(import.meta.env.VITE_ADMIN_APP_ORIGIN);
  if (explicit) {
    return adminEmailPaths(explicit);
  }

  if (isLocalMarketingHostname()) {
    return adminEmailPaths(resolveAutoLocalAdminOrigin());
  }

  const base = getApiUrl();
  return {
    sendContact: `${base}/email/send-contact`,
    sendQuote: `${base}/email/send-quote`,
  };
}

/** For debug logs: how contact ingest was resolved. */
export function getContactIngestResolution() {
  const explicit =
    trimOrigin(import.meta.env.VITE_CONTACT_INGEST_ORIGIN) ||
    trimOrigin(import.meta.env.VITE_ADMIN_APP_ORIGIN);
  if (explicit) return { mode: "explicit-admin", origin: explicit };
  if (isLocalMarketingHostname()) {
    return { mode: "auto-local-admin", origin: resolveAutoLocalAdminOrigin() };
  }
  return { mode: "legacy-express", origin: null };
}

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
  const ingest = getContactIngestResolution();
  console.log('🔧 Frontend Environment Configuration:', {
    apiUrl: ENV_CONFIG.apiUrl,
    contactFormApis: getContactFormApiUrls(),
    contactIngest:
      ingest.mode === "legacy-express"
        ? {
            ...ingest,
            hint: "Set VITE_CONTACT_INGEST_ORIGIN (build env) to your deployed alcoa-admin origin so Contact Messages receives submissions.",
          }
        : ingest,
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

