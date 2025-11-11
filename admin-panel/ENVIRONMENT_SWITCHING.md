# 🔄 Environment Switching Guide

## Overview

Your admin panel can now easily switch between **Production** and **Development** backends.

---

## 🎯 Two Modes Available

### **1. Production Mode** (Default)
- 🌐 **Backend:** https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api
- 📊 **Database:** Production MongoDB (Render.com)
- 📬 **Messages:** Real submissions from your live website
- ✅ **Use when:** Working with live data

### **2. Development Mode** (Local Testing)
- 💻 **Backend:** http://localhost:5000/api
- 📊 **Database:** Local MongoDB
- 📬 **Messages:** Test messages only
- ✅ **Use when:** Developing features, testing locally

---

## 🚀 How to Switch

### **Method 1: Using Scripts (Easiest)**

#### **Switch to Production:**

**Windows (PowerShell):**
```powershell
cd admin-panel
.\switch-env.ps1 production
npm run dev
```

**Linux/Mac:**
```bash
cd admin-panel
chmod +x switch-env.sh
./switch-env.sh production
npm run dev
```

#### **Switch to Development:**

**Windows (PowerShell):**
```powershell
cd admin-panel
.\switch-env.ps1 development
npm run dev
```

**Linux/Mac:**
```bash
cd admin-panel
./switch-env.sh development
npm run dev
```

**Shorthand:**
```bash
./switch-env.sh prod   # Production
./switch-env.sh dev    # Development
```

---

### **Method 2: Manual (Quick)**

#### **For Production:**

Create/edit `admin-panel/.env`:
```env
VITE_API_URL=https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api
VITE_ENV=production
```

#### **For Development:**

Create/edit `admin-panel/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

Then restart:
```bash
cd admin-panel
npm run dev
```

---

## 📁 Environment Files Structure

```
admin-panel/
├── .env                          # Active config (git ignored)
├── .env.production.local         # Production settings ✅
├── .env.development.local        # Development settings ✅
├── .env.example                  # Template for reference
├── switch-env.ps1                # Windows switcher script ✅
└── switch-env.sh                 # Linux/Mac switcher script ✅
```

---

## 🔍 How to Check Current Mode

### **In Browser Console (F12):**

```javascript
console.log('Current API URL:', import.meta.env.VITE_API_URL);
console.log('Environment:', import.meta.env.VITE_ENV);
```

**Production shows:**
```
Current API URL: https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api
Environment: production
```

**Development shows:**
```
Current API URL: http://localhost:5000/api
Environment: development
```

---

## 💼 Typical Workflows

### **Working on Live Site (Production Mode):**

```bash
# 1. Switch to production
cd admin-panel
.\switch-env.ps1 production  # Windows
# ./switch-env.sh production  # Linux/Mac

# 2. Start admin panel
npm run dev

# 3. Login with production credentials
# 4. View real messages from website
# 5. Manage live customer inquiries
```

**Benefits:**
- ✅ See real customer messages
- ✅ Work with production data
- ✅ Test with live backend
- ✅ No local backend needed

---

### **Developing New Features (Development Mode):**

```bash
# 1. Start local backend
cd backend
npm start

# 2. Switch admin panel to development
cd ../admin-panel
.\switch-env.ps1 development  # Windows
# ./switch-env.sh development  # Linux/Mac

# 3. Start admin panel
npm run dev

# 4. Test locally with test data
```

**Benefits:**
- ✅ Safe testing environment
- ✅ Faster development cycle
- ✅ Don't affect production data
- ✅ Full control over backend

---

## 🎯 Quick Reference

### **Production Setup:**

```bash
# Windows
cd admin-panel
.\switch-env.ps1 prod
npm run dev

# Linux/Mac
cd admin-panel
./switch-env.sh prod
npm run dev
```

**Connects to:** Render.com backend ✅

---

### **Development Setup:**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Admin Panel
cd admin-panel
.\switch-env.ps1 dev  # Windows
# ./switch-env.sh dev  # Linux/Mac
npm run dev
```

**Connects to:** localhost:5000 ✅

---

## ⚙️ Environment Priority

Vite loads environment files in this order (highest priority first):

1. `.env.local` - Local override (highest priority)
2. `.env.[mode].local` - Mode-specific local (e.g., `.env.development.local`)
3. `.env.[mode]` - Mode-specific (e.g., `.env.production`)
4. `.env` - Default/Active configuration
5. Code defaults - Fallback in `config/env.js`

---

## 🔐 Git Ignore

These files are protected (in `.gitignore`):
- ✅ `.env` - Never committed
- ✅ `.env.local` - Never committed
- ✅ `.env.production.local` - Never committed
- ✅ `.env.development.local` - Never committed

**Safe to commit:**
- ✅ `.env.example` - Template only
- ✅ `switch-env.ps1` - Switching script
- ✅ `switch-env.sh` - Switching script

---

## 📊 Configuration Comparison

| Setting | Production | Development |
|---------|------------|-------------|
| API URL | Render.com | localhost:5000 |
| Database | Production MongoDB | Local MongoDB |
| Messages | Real from website | Test only |
| Login | Production admin | Local admin |
| Speed | Network dependent | Fast (local) |
| Data | Live data | Test data |

---

## ✅ Best Practices

### **For Daily Work (Production):**
```bash
.\switch-env.ps1 production
npm run dev
```
- Work with real data
- Manage live inquiries
- No local backend needed

### **For Development (Local):**
```bash
# Start local backend first!
cd ../backend && npm start

# Then switch admin panel
cd admin-panel
.\switch-env.ps1 development
npm run dev
```
- Safe testing
- Develop new features
- No impact on production

---

## 🎉 You're All Set!

**Now you have:**
- ✅ Easy switching between environments
- ✅ Scripts for both Windows and Linux/Mac
- ✅ Clear separation of production and development
- ✅ Git-safe configuration files

---

## 🚀 Quick Start

**Most common use case (Production):**

```powershell
# Windows
cd admin-panel
.\switch-env.ps1 prod
npm run dev
```

**Then login and use! All website messages will appear automatically!** 🎊

---

See files created:
- `admin-panel/.env.production.local` - Production config
- `admin-panel/.env.development.local` - Development config
- `admin-panel/switch-env.ps1` - Windows switcher
- `admin-panel/switch-env.sh` - Linux/Mac switcher

