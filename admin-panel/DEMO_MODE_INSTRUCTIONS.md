# Dashboard Demo Mode Instructions

## Overview
The dashboard has been configured to show demo/mock data for client presentations. This makes the dashboard look populated with realistic data without needing a fully configured backend.

## What Was Changed

### 1. Mock Data Service Created
- **File**: `admin-panel/src/services/api/mockDashboardData.js`
- Contains realistic demo data for:
  - Dashboard statistics (revenue, customers, orders)
  - Sales overview chart (6 months trend)
  - Recent sales orders
  - Top customers by revenue
  - Removed pending invoices data

### 2. Dashboard Service Updated
- **File**: `admin-panel/src/services/api/dashboardService.js`
- Added `USE_MOCK_DATA` flag to toggle between demo and real API data
- Simulates realistic API delays for authentic feel

### 3. Dashboard UI Updated
- **File**: `admin-panel/src/pages/Dashboard.jsx`
- Removed "Pending Invoices" table as requested
- All other sections remain and now display demo data

## Demo Data Includes

### Key Metrics (Top Cards)
- **Monthly Revenue**: AED 425,000
- **Total Customers**: 145
- **Total Orders**: 234
- **Outstanding**: AED 285,000

### Charts & Visualizations
- Revenue Overview Chart (Revenue, Expenses, Profit)
- Sales Trend (Last 6 months with realistic growth)
- Top Customers by Revenue (5 major clients)

### Recent Sales Orders
- 6 recent orders with realistic data
- Company names like Emaar, DAMAC, Dubai Towers, etc.
- Order values ranging from AED 38,900 to AED 125,600

## How to Toggle Demo Mode

### Quick Toggle (Recommended)
Edit `admin-panel/src/config/demo.config.js`:

**Enable Demo Mode** (Current Setting):
```javascript
export const DEMO_MODE = true;  // Demo mode ON
```

**Disable Demo Mode** (Use Real API):
```javascript
export const DEMO_MODE = false;  // Demo mode OFF, uses real backend
```

This single change controls the entire dashboard's data source.

## Customizing Demo Data

To modify the demo data values, edit `admin-panel/src/services/api/mockDashboardData.js`:

### Change Revenue Values
```javascript
revenue: {
  monthly: 425000,  // Change this value
  annual: 4850000   // Change this value
}
```

### Add More Orders
```javascript
orders: [
  {
    _id: '7',  // Add new entry
    orderNumber: 'SO-2025-0157',
    customerName: 'Your Company Name',
    total: 95000,
    status: 'confirmed',
    createdAt: new Date('2025-11-12').toISOString()
  },
  // ... existing orders
]
```

### Modify Sales Trend
```javascript
salesOverview: [
  { _id: { month: 6, year: 2025 }, revenue: 320000, orders: 35 },
  // Adjust revenue and orders for each month
]
```

## For Client Presentation

1. **Before Demo**: Ensure `USE_MOCK_DATA = true` in `dashboardService.js`
2. **During Demo**: The dashboard will load with realistic data
3. **After Demo**: Switch back to real data by setting `USE_MOCK_DATA = false`

## Notes
- Mock data includes realistic API delays (300-400ms) for authentic feel
- All charts and visualizations work with the demo data
- Pending Invoices section has been completely removed
- Demo data is based on UAE-based scaffolding business context

## Support
If you need to add more demo data or modify existing values, refer to the `mockDashboardData.js` file which is well-documented and easy to update.

