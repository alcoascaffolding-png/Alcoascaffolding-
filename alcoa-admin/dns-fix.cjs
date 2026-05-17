/**
 * DNS pre-configuration for MongoDB Atlas on Windows.
 * Loaded via NODE_OPTIONS="--require ./dns-fix.cjs" in .env.local.
 *
 * Problem: Some ISP DNS servers refuse SRV record lookups used by
 * mongodb+srv:// connection strings, causing 'querySrv ECONNREFUSED'.
 * Fix: Switch Node.js DNS resolver to Google public DNS (8.8.8.8).
 */
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Silent — non-Node environments (e.g. edge workers) don't have dns module
}
