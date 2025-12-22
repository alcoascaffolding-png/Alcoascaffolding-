/**
 * Quote Data Transformation Middleware
 * Transforms frontend data to match backend model
 */

const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const User = require('../models/User');

const transformQuoteData = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Remove _id from frontend (MongoDB auto-generates)
    if (data._id) {
      delete data._id;
    }

    // Set createdBy - find or create a default user
    if (!data.createdBy) {
      // Try to get user from auth
      if (req.user && mongoose.Types.ObjectId.isValid(req.user._id || req.user.id)) {
        data.createdBy = req.user._id || req.user.id;
      } else {
        // Find or create a system user
        let systemUser = await User.findOne({ email: 'system@alcoa.com' });
        if (!systemUser) {
          systemUser = await User.create({
            name: 'System User',
            email: 'system@alcoa.com',
            password: 'system123456',
            role: 'admin',
            isActive: true
          });
        }
        data.createdBy = systemUser._id;
      }
    }

    // Handle customer - find by name or create reference
    if (data.customerName && !data.customer) {
      const customer = await Customer.findOne({ companyName: data.customerName });
      if (customer) {
        data.customer = customer._id;
      } else {
        // Create a temporary customer if doesn't exist
        const newCustomer = await Customer.create({
          customerCode: `CUST${Date.now().toString().slice(-6)}`,
          companyName: data.customerName,
          contactPerson: 'N/A',
          email: `temp${Date.now()}@temp.com`,
          phone: 'N/A',
          status: 'active',
          creditLimit: 0,
          balance: 0
        });
        data.customer = newCustomer._id;
      }
    }

    // Transform items to match model structure
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map(item => ({
        itemName: item.description || item.itemName || 'Item',
        description: item.description || '',
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'Piece',
        rate: parseFloat(item.unitPrice || item.rate) || 0,
        discount: parseFloat(item.discount) || 0,
        discountType: 'percentage',
        taxRate: 5,
        amount: parseFloat(item.total || item.amount) || 0
      }));
    }

    // Calculate totals
    if (data.items && data.items.length > 0) {
      data.subtotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      data.totalTax = data.subtotal * 0.05;
      data.taxAmount = data.totalTax;
      data.total = data.subtotal + data.totalTax;
    }

    // Copy grandTotal to total if provided
    if (data.grandTotal) {
      data.total = data.grandTotal;
    }

    // Set default status
    if (!data.status) {
      data.status = 'draft';
    }

    // Set quote date
    if (!data.quoteDate) {
      data.quoteDate = new Date();
    }

    // Set valid until (30 days from now if not provided)
    if (!data.validUntil) {
      data.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Update request body
    req.body = data;
    next();
  } catch (error) {
    console.error('Quote transformation error:', error);
    return res.status(400).json({
      success: false,
      message: 'Failed to process quote data',
      error: error.message
    });
  }
};

module.exports = transformQuoteData;

