# Alcoa Aluminium Scaffolding - Admin Panel

A comprehensive full-stack Admin Management System for **Alcoa Aluminium Scaffolding** built using the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

### 📊 Dashboard
- Real-time analytics and statistics
- Monthly revenue, expenses, and profit overview
- Visual charts using ECharts
- Quick access to pending tasks and overdue invoices

### 👥 Customer Relations
- **Customers**: Complete customer database management
- **Quotes**: Create and manage customer quotations
- **Sales Orders**: Track customer orders
- **Sales Invoices**: Generate and manage invoices
- **Sales Returns**: Handle product returns
- **Delivery Notes**: Manage delivery documentation
- **Proforma Invoices**: Preliminary invoicing
- **Work Completion**: Project completion certificates

### 🏭 Vendor Relations
- **Vendors**: Supplier/vendor database
- **Purchase Orders**: Create and track purchase orders
- **Purchase Invoices**: Manage vendor invoices
- **Purchase Returns**: Handle returns to vendors

### 📦 Inventory Management
- **Products**: Complete product catalog
- **Barcode Management**: Track items with barcodes
- **Primary & Secondary Units**: Flexible unit management
- **Stock Adjustments**: Inventory corrections
- **Stock Movements**: Track all inventory movements

### 💰 Accounts
- **Bank Accounts**: Manage company bank accounts
- **Receipts**: Record customer payments
- **Payments**: Track vendor payments
- **Journal Entries**: Manual accounting entries
- **Contra Vouchers**: Bank-to-bank transfers
- **UAE Tax**: VAT calculations (5%)
- Financial Reports (coming soon):
  - Profit and Loss
  - Balance Sheet
  - Trial Balance
  - Outstanding Analysis
  - Payment Analysis

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (RBAC)
- Multiple user roles: Super Admin, Admin, Manager, Accountant, Sales, Inventory, Viewer
- Permission-based feature access

### 📥 Export Features
- PDF export for reports and invoices
- Excel export for data analysis
- Professional invoice templates

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **ECharts** - Data visualization
- **jsPDF & xlsx** - Export functionality
- **date-fns** - Date formatting

## 📁 Project Structure

```
alcoa-scaffolding/
├── backend/
│   ├── config/
│   │   ├── app.config.js
│   │   ├── auth.config.js
│   │   └── database.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── security.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Quote.js
│   │   ├── SalesOrder.js
│   │   ├── SalesInvoice.js
│   │   ├── PurchaseOrder.js
│   │   ├── PurchaseInvoice.js
│   │   ├── StockAdjustment.js
│   │   ├── BankAccount.js
│   │   ├── Receipt.js
│   │   ├── Payment.js
│   │   └── ... (and more)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── admin.routes.js
│   ├── utils/
│   │   ├── crudFactory.js
│   │   └── logger.js
│   ├── server.js
│   └── package.json
│
├── admin-panel/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── vendors/
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── purchase/
│   │   │   ├── inventory/
│   │   │   └── accounts/
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   └── store.js
│   │   ├── utils/
│   │   │   └── exportUtils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/alcoa-admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email (existing configuration)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Admin Panel Setup

1. Navigate to admin-panel directory:
```bash
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The admin panel will run on `http://localhost:5173`

### Creating the First Admin User

You can create the first super admin user using MongoDB:

```javascript
// Connect to MongoDB and run this:
use alcoa-admin

db.users.insertOne({
  name: "Admin User",
  email: "admin@alcoa.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "admin123"
  role: "super_admin",
  permissions: [],
  department: "management",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the API registration endpoint (accessible only to super admins after first setup).

## 🔐 Default Login Credentials

**Email**: admin@alcoa.com  
**Password**: admin123

> ⚠️ **Important**: Change these credentials immediately after first login in production!

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/register` - Register new user (Super Admin only)

### Admin Endpoints
All admin endpoints require authentication and are prefixed with `/api/admin/`

**Customers**: `/api/admin/customers`
**Vendors**: `/api/admin/vendors`
**Products**: `/api/admin/products`
**Quotes**: `/api/admin/quotes`
**Sales Orders**: `/api/admin/sales-orders`
**Sales Invoices**: `/api/admin/sales-invoices`
**Purchase Orders**: `/api/admin/purchase-orders`
**Purchase Invoices**: `/api/admin/purchase-invoices`
**Stock Adjustments**: `/api/admin/stock-adjustments`
**Bank Accounts**: `/api/admin/bank-accounts`
**Receipts**: `/api/admin/receipts`
**Payments**: `/api/admin/payments`

Each endpoint supports:
- `GET /` - List all (with pagination, filtering, sorting)
- `GET /:id` - Get single item
- `POST /` - Create new
- `PUT /:id` - Update existing
- `DELETE /:id` - Delete item

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## 🎨 Features Highlights

### Auto-generated Document Numbers
All documents automatically generate unique numbers:
- Customers: `CUST00001`
- Quotes: `QT202400001`
- Sales Orders: `SO202400001`
- Invoices: `INV202400001`
- Purchase Orders: `PO202400001`

### Financial Calculations
- Automatic subtotal, tax, and total calculations
- Support for discounts (percentage or fixed)
- UAE VAT (5%) calculations
- Payment tracking and balance management

### Inventory Tracking
- Real-time stock updates
- Low stock alerts
- Stock movement history
- Multi-unit support (primary and secondary units)

### Role-Based Access Control
Different permission levels for different user roles:
- **Super Admin**: Full access to everything
- **Admin**: Manage users and most operations
- **Manager**: Oversee operations
- **Accountant**: Full access to financial modules
- **Sales**: Customer relations and sales
- **Inventory**: Stock and product management
- **Viewer**: Read-only access

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS protection
- Request sanitization
- Security headers with Helmet.js
- Suspicious activity detection

## 📊 Data Export

Export your data in multiple formats:
- **PDF**: Professional formatted reports and invoices
- **Excel**: Spreadsheet format for data analysis

## 🚀 Deployment

### Backend Deployment (Render/Heroku/AWS)

1. Set environment variables on your hosting platform
2. Ensure MongoDB connection string is correct
3. Deploy using:
```bash
npm start
```

### Frontend Deployment (Netlify/Vercel/Render)

1. Build the production version:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting platform

3. **Important:** Set environment variable in your deployment platform:
```
VITE_API_URL=https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api
```

**Note:** If `VITE_API_URL` is not set, the app will automatically use the production backend URL (`https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api`) when built for production. However, it's recommended to explicitly set it in your deployment platform's environment variables.

**For different platforms:**
- **Netlify:** Go to Site Settings → Environment Variables → Add `VITE_API_URL`
- **Vercel:** Go to Project Settings → Environment Variables → Add `VITE_API_URL`
- **Render:** Add to `envVars` in your `render.yaml` or in the dashboard

## 🤝 Contributing

This is a proprietary project for Alcoa Aluminium Scaffolding. For any questions or support, please contact the development team.

## 📄 License

Proprietary - © 2025 Alcoa Aluminium Scaffolding. All rights reserved.

## 👨‍💻 Development Team

Built with ❤️ for Alcoa Aluminium Scaffolding

---

## 🆘 Support

For technical support or questions:
- Email: support@alcoascaffolding.com
- Phone: +971-XX-XXX-XXXX

---

## Vercel (monorepo)

- **Next.js admin (`alcoa-admin`):** create or edit the Vercel project with **Root Directory = `alcoa-admin`**. See `alcoa-admin/README.md`.
- **Legacy Vite site (`frontend`):** use **Root Directory = `frontend`**; build settings are in `frontend/vercel.json`.

---

**Version**: 1.0.0  
**Last Updated**: November 2025

