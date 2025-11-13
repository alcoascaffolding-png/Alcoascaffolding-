/**
 * Under Construction Configuration
 * Centralized control for all under-construction pages
 * 
 * Usage: Import and use in your pages
 * Example: const [isUnderConstruction] = useState(UNDER_CONSTRUCTION.VENDOR_RELATIONS);
 */

export const UNDER_CONSTRUCTION = {
  // Customer Relations
  VENDOR_RELATIONS: true,
  SALES_ORDERS: true,
  SALES_INVOICES: true,
  RENTAL_ORDERS: true,
  
  // Inventory
  INVENTORY_PRODUCTS: false,  // Example: This one is live
  STOCK_ADJUSTMENTS: true,
  EQUIPMENT_TRACKING: true,
  
  // Accounts & Finance
  ACCOUNTS: true,
  INVOICING: true,
  PAYMENTS: true,
  EXPENSES: true,
  
  // Reports & Analytics
  REPORTS: true,
  ANALYTICS: true,
  
  // Settings
  SYSTEM_SETTINGS: true,
  USER_MANAGEMENT: true,
  
  // Other Modules
  MAINTENANCE_SCHEDULE: true,
  SAFETY_INSPECTIONS: true,
  TRAINING_MODULES: true
};

/**
 * Get all modules that are under construction
 */
export const getUnderConstructionModules = () => {
  return Object.entries(UNDER_CONSTRUCTION)
    .filter(([_, isUnderConstruction]) => isUnderConstruction)
    .map(([module]) => module);
};

/**
 * Get all live modules
 */
export const getLiveModules = () => {
  return Object.entries(UNDER_CONSTRUCTION)
    .filter(([_, isUnderConstruction]) => !isUnderConstruction)
    .map(([module]) => module);
};

/**
 * Check if a module is under construction
 */
export const isModuleUnderConstruction = (moduleName) => {
  return UNDER_CONSTRUCTION[moduleName] ?? true; // Default to under construction if not found
};

export default UNDER_CONSTRUCTION;

