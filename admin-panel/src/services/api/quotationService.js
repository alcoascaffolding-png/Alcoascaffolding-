/**
 * Quotation API Service
 * Handles all API calls related to quotations
 */

import api from '../../api/axios';

const quotationService = {
  /**
   * Get all quotations with filters and pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },

  /**
   * Get quotation by ID
   */
  getById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Get quotation statistics
   */
  getStats: async () => {
    const response = await api.get('/quotes/stats');
    return response.data;
  },

  /**
   * Create new quotation
   */
  create: async (quotationData) => {
    const response = await api.post('/quotes', quotationData);
    return response.data;
  },

  /**
   * Update existing quotation
   */
  update: async (id, quotationData) => {
    const response = await api.patch(`/quotes/${id}`, quotationData);
    return response.data;
  },

  /**
   * Delete quotation
   */
  delete: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },

  /**
   * Check for new quotations (lightweight polling)
   */
  checkForNew: async (lastCheck) => {
    const response = await api.get('/quotes/check-new', {
      params: { lastCheck }
    });
    return response.data;
  },

  /**
   * Send quotation via email
   */
  sendEmail: async (id, emailData) => {
    const response = await api.post(`/quotes/${id}/send-email`, emailData);
    return response.data;
  },

  /**
   * Download quotation as PDF using backend Playwright generator
   */
  downloadPDF: async (id) => {
    const response = await api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob', // Important for binary data
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    let filename = `Quotation_${id}.pdf`;
    if (contentDisposition) {
      // Try to extract filename from header (handles both quoted and unquoted)
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  },

  /**
   * Get PDF as blob (for preview or other uses)
   */
  getPDFBlob: async (id) => {
    const response = await api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }
};

export default quotationService;

