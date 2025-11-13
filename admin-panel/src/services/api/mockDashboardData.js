/**
 * Mock Dashboard Data for Demo Purposes
 * Simulates realistic API responses
 */

// Generate demo data for the dashboard
export const mockDashboardData = {
  // Dashboard statistics
  stats: {
    customers: {
      total: 145,
      active: 132,
      outstanding: 285000
    },
    quotes: {
      total: 89,
      accepted: 67,
      pending: 22,
      value: 1250000
    },
    orders: {
      total: 234,
      pending: 18,
      delivered: 216
    },
    invoices: {
      total: 198,
      paid: 165,
      overdue: 12,
      totalValue: 3450000,
      collected: 2890000,
      outstanding: 560000
    },
    revenue: {
      monthly: 425000,
      annual: 4850000
    }
  },

  // Sales overview for last 6 months
  salesOverview: [
    { _id: { month: 6, year: 2025 }, revenue: 320000, orders: 35 },
    { _id: { month: 7, year: 2025 }, revenue: 380000, orders: 42 },
    { _id: { month: 8, year: 2025 }, revenue: 410000, orders: 38 },
    { _id: { month: 9, year: 2025 }, revenue: 395000, orders: 40 },
    { _id: { month: 10, year: 2025 }, revenue: 455000, orders: 45 },
    { _id: { month: 11, year: 2025 }, revenue: 425000, orders: 39 }
  ],

  // Recent activities - orders and invoices
  recentActivities: {
    orders: [
      {
        _id: '1',
        orderNumber: 'SO-2025-0156',
        customerName: 'Emirates Construction LLC',
        total: 45800,
        status: 'confirmed',
        createdAt: new Date('2025-11-10').toISOString()
      },
      {
        _id: '2',
        orderNumber: 'SO-2025-0155',
        customerName: 'Dubai Towers Development',
        total: 72300,
        status: 'confirmed',
        createdAt: new Date('2025-11-09').toISOString()
      },
      {
        _id: '3',
        orderNumber: 'SO-2025-0154',
        customerName: 'Al Futtaim Engineering',
        total: 38900,
        status: 'processing',
        createdAt: new Date('2025-11-08').toISOString()
      },
      {
        _id: '4',
        orderNumber: 'SO-2025-0153',
        customerName: 'Emaar Properties PJSC',
        total: 125600,
        status: 'confirmed',
        createdAt: new Date('2025-11-07').toISOString()
      },
      {
        _id: '5',
        orderNumber: 'SO-2025-0152',
        customerName: 'DAMAC Properties',
        total: 56400,
        status: 'delivered',
        createdAt: new Date('2025-11-06').toISOString()
      },
      {
        _id: '6',
        orderNumber: 'SO-2025-0151',
        customerName: 'Nakheel Development',
        total: 89200,
        status: 'confirmed',
        createdAt: new Date('2025-11-05').toISOString()
      }
    ],
    invoices: [
      {
        _id: '1',
        invoiceNumber: 'INV-2025-0234',
        customerName: 'Dubai Marina Contracting',
        total: 35600,
        status: 'paid',
        createdAt: new Date('2025-11-11').toISOString()
      },
      {
        _id: '2',
        invoiceNumber: 'INV-2025-0233',
        customerName: 'Sharjah Construction Co.',
        total: 28900,
        status: 'paid',
        createdAt: new Date('2025-11-10').toISOString()
      }
    ]
  },

  // Top customers by revenue
  topCustomers: [
    {
      _id: 'Emaar Properties PJSC',
      totalRevenue: 485000,
      orderCount: 28
    },
    {
      _id: 'Dubai Towers Development',
      totalRevenue: 420000,
      orderCount: 24
    },
    {
      _id: 'DAMAC Properties',
      totalRevenue: 385000,
      orderCount: 22
    },
    {
      _id: 'Al Futtaim Engineering',
      totalRevenue: 340000,
      orderCount: 19
    },
    {
      _id: 'Nakheel Development',
      totalRevenue: 295000,
      orderCount: 17
    }
  ],

  // Pending invoices (keeping empty as user wants to remove it)
  pendingInvoices: []
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API response wrapper
export const mockApiResponse = (data) => {
  return {
    success: true,
    data: data
  };
};

