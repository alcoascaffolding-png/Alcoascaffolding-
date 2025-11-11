# 🌐 Complete Environment Setup - Backend, Admin Panel & Frontend Website

## ✅ Environment Switching for ALL Components

I've set up environment configuration for your **entire project**!

---

## 🎯 Three Components, Easy Switching

```
📦 Your Project
├── 🖥️ Backend (API Server)
│   ├── Development: localhost:5000
│   └── Production: Render.com
│
├── 👨‍💼 Admin Panel
│   ├── Development: localhost backend
│   └── Production: Render backend
│
└── 🌐 Frontend Website
    ├── Development: localhost backend
    └── Production: Render backend
```

---

## 🚀 Quick Start Guide

### **Production Mode (Most Common)**

All components use production backend:

```powershell
# Admin Panel
cd admin-panel
.\switch-env.ps1 prod
npm run dev

# Frontend Website  
cd ../frontend
.\switch-env.ps1 prod
npm run dev

# Backend (deploy to Render)
# Already on Render.com!
```

---

### **Development Mode (Local Testing)**

All components use localhost backend:

```powershell
# 1. Start Backend (FIRST!)
cd backend
npm start

# 2. Admin Panel
cd ../admin-panel
.\switch-env.ps1 dev
npm run dev

# 3. Frontend Website
cd ../frontend
.\switch-env.ps1 dev
npm run dev
```

---

## 📁 Environment Files Created

### **Frontend Website:**
- ✅ `frontend/.env.production.local` - Production config
- ✅ `frontend/.env.development.local` - Development config
- ✅ `frontend/src/config/env.js` - Centralized config
- ✅ `frontend/switch-env.ps1` - Switching script
- ✅ `frontend/src/pages/ContactUs.jsx` - Updated to use ENV_CONFIG

### **Admin Panel:**
- ✅ `admin-panel/.env.production.local` - Production config
- ✅ `admin-panel/.env.development.local` - Development config
- ✅ `admin-panel/src/config/env.js` - Centralized config
- ✅ `admin-panel/switch-env.ps1` - Switching script

### **Backend:**
- ✅ `backend/.env.example` - Template for reference
- ✅ `backend/render.yaml` - Render deployment config

---

## 🔄 Environment Switching Commands

### **Frontend Website:**

```powershell
cd frontend

# Switch to production
.\switch-env.ps1 production
# OR shorthand
.\switch-env.ps1 prod

# Switch to development
.\switch-env.ps1 development  
# OR shorthand
.\switch-env.ps1 dev

# Then start
npm run dev
```

---

### **Admin Panel:**

```powershell
cd admin-panel

# Switch to production
.\switch-env.ps1 prod
npm run dev

# Switch to development
.\switch-env.ps1 dev
npm run dev
```

---

## 🎯 NPM Commands Available

### **Frontend Website:**

```bash
npm run dev          # Use current .env
npm run dev:local    # Force development mode
npm run dev:prod     # Force production mode
npm run build:prod   # Build for production
npm run build:dev    # Build for development
```

### **Admin Panel:**

```bash
npm run dev          # Use current .env
npm run dev:local    # Force development mode
npm run dev:prod     # Force production mode
npm run build:prod   # Build for production
npm run build:dev    # Build for development
```

---

## 📊 Configuration Comparison

### **Production Mode:**

| Component | API URL | Database | Use For |
|-----------|---------|----------|---------|
| Frontend Website | Render.com | Production | Live website |
| Admin Panel | Render.com | Production | Managing real data |
| Backend | Render.com | Production | Deployed service |

**All connected to same production database!** ✅

---

### **Development Mode:**

| Component | API URL | Database | Use For |
|-----------|---------|----------|---------|
| Frontend Website | localhost:5000 | Local | Testing forms |
| Admin Panel | localhost:5000 | Local | Testing admin |
| Backend | localhost:5000 | Local | Development |

**All connected to local database!** ✅

---

## 🎨 Complete Workflows

### **Workflow 1: Production (Daily Use)**

```powershell
# Admin Panel only (most common)
cd admin-panel
.\switch-env.ps1 prod
npm run dev

# Open: http://localhost:5173
# Manage real customer messages!
```

**Backend:** Already on Render ✅
**Frontend Website:** Already deployed ✅
**Admin Panel:** Connects to production ✅

---

### **Workflow 2: Full Local Development**

```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend Website
cd frontend
.\switch-env.ps1 dev
npm run dev

# Terminal 3 - Admin Panel
cd admin-panel
.\switch-env.ps1 dev
npm run dev
```

**All three running locally!** ✅
**All connected to local backend!** ✅

---

### **Workflow 3: Mixed (Website Prod, Admin Dev)**

```powershell
# Website uses production
cd frontend
.\switch-env.ps1 prod
npm run dev

# Admin uses local for testing
cd ../backend
npm start

cd ../admin-panel
.\switch-env.ps1 dev
npm run dev
```

**Flexible combinations!** ✅

---

## 🔍 Verify Current Environment

### **Frontend Website:**

```javascript
// Open website in browser
// Press F12 (Console)
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Environment:', import.meta.env.VITE_ENV);
```

### **Admin Panel:**

```javascript
// Open admin panel in browser
// Press F12 (Console)
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Environment:', import.meta.env.VITE_ENV);
```

---

## 📝 Environment Files Structure

```
Project Root/
│
├── backend/
│   ├── .env (create from .env.example)
│   └── .env.example ✅
│
├── admin-panel/
│   ├── .env (auto-generated)
│   ├── .env.production.local ✅
│   ├── .env.development.local ✅
│   ├── switch-env.ps1 ✅
│   └── src/config/env.js ✅
│
└── frontend/
    ├── .env (auto-generated)
    ├── .env.production.local ✅
    ├── .env.development.local ✅
    ├── switch-env.ps1 ✅
    └── src/config/env.js ✅
```

---

## 🎯 Setup Instructions

### **Initial Setup (One Time):**

#### **1. Create Backend .env:**

```bash
cd backend
# Copy .env.example to .env
# Add your real values:
# - MONGODB_URI
# - JWT_SECRET
# - RESEND_API_KEY
```

#### **2. Setup Frontend Website:**

```powershell
cd frontend
.\switch-env.ps1 prod
```

#### **3. Setup Admin Panel:**

```powershell
cd admin-panel
.\switch-env.ps1 prod
```

---

## ✅ Default Configuration

**Out of the box, everything is set to PRODUCTION:**

- ✅ Frontend Website → Render.com backend
- ✅ Admin Panel → Render.com backend
- ✅ Backend → Deployed on Render.com

**Just run and use!** 🚀

---

## 🔄 Quick Switch Reference

### **To Production (All Components):**

```powershell
# Frontend
cd frontend
.\switch-env.ps1 prod

# Admin Panel
cd ../admin-panel
.\switch-env.ps1 prod
```

### **To Development (All Components):**

```powershell
# Start backend first!
cd backend
npm start

# Frontend
cd ../frontend
.\switch-env.ps1 dev

# Admin Panel
cd ../admin-panel
.\switch-env.ps1 dev
```

---

## 🎨 Visual Confirmation

After switching, you'll see in browser console:

### **Production:**
```
📤 Sending contact form to: production backend
🔧 Frontend Environment: {
  apiUrl: "https://...onrender.com/api",
  env: "production"
}
```

### **Development:**
```
📤 Sending contact form to: development backend
🔧 Frontend Environment: {
  apiUrl: "http://localhost:5000/api",
  env: "development"
}
```

---

## ⚡ Benefits

### **Easy Switching:**
- ✅ One command to switch
- ✅ No code changes needed
- ✅ Clear which mode you're in
- ✅ Safe - .env files git-ignored

### **Development:**
- ✅ Test locally first
- ✅ Fast iteration
- ✅ No production impact
- ✅ Full control

### **Production:**
- ✅ Use real data
- ✅ No local backend needed
- ✅ Internet required
- ✅ Live customer messages

---

## 📊 What Each Component Does

### **Frontend Website (Customer-Facing):**

**Production:**
- Visitors submit contact forms
- Forms go to Render backend
- Saved to production database
- Visible in production admin panel

**Development:**
- Test contact form locally
- Forms go to localhost backend
- Saved to local database
- Visible in local admin panel

---

### **Admin Panel (Internal Use):**

**Production:**
- See real customer messages
- Manage live inquiries
- Contact via Email/WhatsApp
- Track status

**Development:**
- Test admin features
- Safe environment
- Local data only
- No production impact

---

### **Backend (API Server):**

**Production (Render.com):**
- Handles website submissions
- Stores in production MongoDB
- Serves admin panel
- Always running

**Development (localhost):**
- Local testing
- Local MongoDB
- Fast development
- Full control

---

## 🎉 Complete Feature Summary

**You now have:**

1. ✅ **Environment switching** for all 3 components
2. ✅ **One-command setup** via scripts
3. ✅ **Centralized configuration** in each app
4. ✅ **Production-ready** by default
5. ✅ **Easy local development** when needed
6. ✅ **No hardcoded URLs** anywhere
7. ✅ **Git-safe** (.env files ignored)

---

## 🚀 Start Using

### **Most Common (Production):**

```powershell
# Admin Panel
cd admin-panel
npm run dev

# Website already deployed ✅
# Backend already on Render ✅
```

### **Local Development:**

```powershell
# Backend
cd backend
npm start

# Frontend
cd ../frontend
.\switch-env.ps1 dev
npm run dev

# Admin Panel
cd ../admin-panel
.\switch-env.ps1 dev
npm run dev
```

---

## 🎊 **YOU'RE ALL SET!**

**Your complete system:**
- ✅ Frontend Website with env switching
- ✅ Admin Panel with env switching
- ✅ Backend with proper config
- ✅ Easy dev/prod switching
- ✅ Professional setup
- ✅ Production-ready!

**See `WHATSAPP_INTEGRATION.md` for WhatsApp features!**
**See `BACKEND_OPTIMIZATIONS.md` for performance details!**

🚀 **Enterprise-level infrastructure complete!** 🌟

