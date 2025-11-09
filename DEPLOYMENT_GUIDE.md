# 🚀 Deployment Guide - Render.com

## ⚠️ The Issue You Had

**Error:** `Could not read package.json: Error: ENOENT`

**Cause:** Render was looking for `package.json` at project root, but your project has multiple folders:
- `backend/` (has package.json)
- `admin-panel/` (has package.json)
- `frontend/` (has package.json)

**Solution:** Add `rootDirectory` to tell Render which folder to use.

---

## ✅ Fix Applied

I've created/updated:
- ✅ `render.yaml` (root level) - Multi-service configuration
- ✅ `backend/render.yaml` - Added `rootDirectory: backend`

---

## 🔧 Deployment Options

### **Option 1: Using Render Dashboard (Recommended)**

#### **For Backend Service:**

1. Go to Render Dashboard
2. Click on your backend service
3. Go to **Settings**
4. Update these settings:

```
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

5. **Environment Variables** (Make sure these are set):
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Your secret key (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `RESEND_API_KEY` = Your Resend API key
   - `RESEND_FROM_EMAIL` = `Sales@alcoascaffolding.com`

6. Click **Save Changes**
7. Click **Manual Deploy** → **Deploy latest commit**

---

### **Option 2: Using render.yaml File**

#### **Step 1: Copy render.yaml to Project Root**

The `render.yaml` file I created should be at project root:

```
your-project/
├── render.yaml          ⭐ This file
├── backend/
├── admin-panel/
└── frontend/
```

#### **Step 2: Configure Render to Use YAML**

1. Go to Render Dashboard
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. It will create services based on the YAML configuration

---

## 📋 Complete render.yaml (Project Root)

I've created this file for you. It includes:

### **Backend Service:**
```yaml
- type: web
  name: alcoa-scaffolding-backend
  env: node
  rootDirectory: backend          # ⭐ Key fix!
  buildCommand: npm install
  startCommand: npm start
```

### **Admin Panel Service (Optional):**
```yaml
- type: web
  name: alcoa-admin-panel
  env: static
  rootDirectory: admin-panel      # ⭐ Points to admin-panel folder
  buildCommand: npm install && npm run build
  staticPublishPath: ./dist
```

---

## 🔐 Important Environment Variables

### **Required (Add These in Render Dashboard):**

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-random-32-char-secret
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Email Service
RESEND_API_KEY=re_YourResendAPIKey
```

### **Already Configured:**

```bash
NODE_ENV=production
PORT=10000
RESEND_FROM_EMAIL=Sales@alcoascaffolding.com
COMPANY_EMAIL=sales@alcoascaffolding.com
```

---

## 🎯 Quick Fix Steps

### **Option A: Update Existing Service (Fastest)**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click on:** `alcoa-scaffolding-backend` service
3. **Go to:** Settings tab
4. **Scroll to:** "Build & Deploy"
5. **Set Root Directory:** `backend`
6. **Build Command:** `npm install`
7. **Start Command:** `npm start`
8. **Click:** Save Changes
9. **Click:** Manual Deploy → Deploy latest commit

---

### **Option B: Using render.yaml (For Multiple Services)**

1. **Make sure** `render.yaml` is at project root (I created it)
2. **Commit and push:**
   ```bash
   git add render.yaml
   git commit -m "Add render.yaml with rootDirectory fix"
   git push origin main
   ```

3. **In Render Dashboard:**
   - Delete existing service (or skip this step)
   - Click **New** → **Blueprint**
   - Connect to your repo
   - Render will create services from YAML

---

## 🗂️ Project Structure for Render

Your project should look like this on GitHub:

```
your-repo/
├── render.yaml                    # ⭐ Deployment config
├── backend/
│   ├── package.json              # ⭐ Render looks here
│   ├── server.js
│   └── ...
├── admin-panel/
│   ├── package.json
│   └── ...
└── frontend/
    ├── package.json
    └── ...
```

---

## ✅ Verification Steps

### **1. After Deployment:**

Check if backend is running:
```
https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Alcoa Scaffolding API is running"
}
```

### **2. Test Contact Messages Endpoint:**

```
https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api/contact-messages
```

Should require authentication (401 if not logged in).

---

## 🐛 Common Deployment Errors & Fixes

### **Error: "Could not read package.json"**

**Fix:** Set `rootDirectory: backend` in Render settings

### **Error: "Module not found"**

**Fix:** Run `npm install` in backend folder before deploying

### **Error: "MongoDB connection failed"**

**Fix:** Add `MONGODB_URI` environment variable in Render dashboard

### **Error: "JWT_SECRET is not defined"**

**Fix:** Generate and add JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output and add to Render environment variables

---

## 📝 Environment Variables Checklist

Make sure these are set in Render Dashboard:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGODB_URI` = Your MongoDB connection string ⚠️ **Required!**
- [ ] `JWT_SECRET` = Your secret (32+ chars) ⚠️ **Required!**
- [ ] `RESEND_API_KEY` = Your Resend key ⚠️ **Required!**
- [ ] `RESEND_FROM_EMAIL` = `Sales@alcoascaffolding.com`
- [ ] `COMPANY_EMAIL` = `sales@alcoascaffolding.com`

---

## 🚀 Deploy Now

### **Quick Fix (Render Dashboard):**

1. **Render Dashboard** → Your backend service
2. **Settings** → Root Directory = `backend`
3. **Save**
4. **Manual Deploy** → Deploy latest commit
5. **Wait** for build to complete
6. **Test:** Your health endpoint

---

### **Using Git + YAML:**

```bash
# 1. Commit the render.yaml fix
git add render.yaml backend/render.yaml
git commit -m "fix: Add rootDirectory for Render deployment"
git push origin main

# 2. Render will auto-deploy (if auto-deploy enabled)
# OR manually trigger deploy in Render dashboard
```

---

## ✨ After Successful Deployment

### **Backend will be available at:**
```
https://alco-aluminium-scaffolding-backend-5ucb.onrender.com
```

### **Test Endpoints:**
```
GET  /api/health                    # Health check
POST /api/auth/login                # Admin login
POST /api/email/send-contact        # Contact form
GET  /api/contact-messages          # List messages (auth required)
```

### **Admin Panel:**
- Will connect to production backend automatically
- All website submissions will appear
- No additional configuration needed (already done!)

---

## 🎯 Summary

**What Was Wrong:**
- Render couldn't find package.json (wrong directory)

**What I Fixed:**
- ✅ Added `rootDirectory: backend` to render.yaml
- ✅ Created root-level render.yaml for multi-service setup
- ✅ Provided step-by-step deployment guide

**Next Steps:**
1. Update Render service settings OR use render.yaml
2. Add required environment variables
3. Deploy
4. Test backend health endpoint
5. Admin panel will work automatically! 🎉

---

**Go to Render Dashboard now and set Root Directory to `backend`!** 🚀

