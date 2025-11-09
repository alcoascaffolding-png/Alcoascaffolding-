/**
 * Utility functions for generating unique codes
 */

const Customer = require('../models/Customer');

/**
 * Generate unique customer code
 * Format: CUST000001, CUST000002, etc.
 */
exports.generateCustomerCode = async () => {
  try {
    // Get the last customer
    const lastCustomer = await Customer.findOne()
      .sort({ customerCode: -1 })
      .select('customerCode')
      .lean();

    if (!lastCustomer || !lastCustomer.customerCode) {
      return 'CUST000001';
    }

    // Extract number from last code
    const lastNumber = parseInt(lastCustomer.customerCode.replace('CUST', ''));
    const nextNumber = lastNumber + 1;

    // Pad with zeros
    const paddedNumber = String(nextNumber).padStart(6, '0');

    return `CUST${paddedNumber}`;
  } catch (error) {
    console.error('Error generating customer code:', error);
    // Fallback to timestamp-based code
    return `CUST${Date.now().toString().slice(-6)}`;
  }
};

