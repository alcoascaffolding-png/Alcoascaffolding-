/**
 * Authentication Configuration
 * JWT and authentication settings
 */

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  
  // Session settings
  session: {
    maxActiveSessions: 5,
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Role-based access
  roles: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant',
    SALES: 'sales',
    INVENTORY: 'inventory',
    VIEWER: 'viewer'
  },
  
  // Permissions
  permissions: {
    // Customer Relations
    CUSTOMER_CREATE: 'customer:create',
    CUSTOMER_READ: 'customer:read',
    CUSTOMER_UPDATE: 'customer:update',
    CUSTOMER_DELETE: 'customer:delete',
    
    // Vendor Relations
    VENDOR_CREATE: 'vendor:create',
    VENDOR_READ: 'vendor:read',
    VENDOR_UPDATE: 'vendor:update',
    VENDOR_DELETE: 'vendor:delete',
    
    // Inventory
    INVENTORY_CREATE: 'inventory:create',
    INVENTORY_READ: 'inventory:read',
    INVENTORY_UPDATE: 'inventory:update',
    INVENTORY_DELETE: 'inventory:delete',
    
    // Accounts
    ACCOUNTS_CREATE: 'accounts:create',
    ACCOUNTS_READ: 'accounts:read',
    ACCOUNTS_UPDATE: 'accounts:update',
    ACCOUNTS_DELETE: 'accounts:delete',
    
    // Users & Admin
    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete'
  }
};

