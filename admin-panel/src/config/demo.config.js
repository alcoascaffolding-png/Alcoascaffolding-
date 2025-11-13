/**
 * Demo Mode Configuration
 * Control whether the application uses mock data or real API calls
 * 
 * USAGE:
 * - Set DEMO_MODE to true for client presentations/demos
 * - Set DEMO_MODE to false for production with real backend
 */

export const DEMO_MODE = true;

/**
 * API simulation delays (in milliseconds)
 * Makes mock API calls feel more realistic
 */
export const API_DELAYS = {
  stats: 300,
  salesOverview: 400,
  recentActivities: 350,
  topCustomers: 380,
  pendingInvoices: 320
};

/**
 * Demo configuration settings
 */
export const DEMO_CONFIG = {
  // Show loading spinners even with mock data
  showLoadingState: true,
  
  // Simulate occasional API delays
  simulateNetworkLatency: true,
  
  // Log demo mode status to console
  logDemoMode: true
};

// Log current mode on import
if (DEMO_CONFIG.logDemoMode) {
  console.log(
    `%c🎭 Dashboard Mode: ${DEMO_MODE ? 'DEMO' : 'LIVE'}`,
    `font-weight: bold; font-size: 14px; color: ${DEMO_MODE ? '#10b981' : '#3b82f6'}`
  );
}

