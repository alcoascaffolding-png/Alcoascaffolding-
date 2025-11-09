# MongoDB Atlas Setup

## Your MongoDB Connection String

Your MongoDB Atlas URI has been configured!

### Update your `backend/.env` file:

**Open** `backend/.env` file and update/add this line:

```env
MONGODB_URI=mongodb+srv://anasqureshi9764_db_user:h5B9t5DpV46Y7dbX@cluster0.zukuduq.mongodb.net/alcoa-admin?retryWrites=true&w=majority&appName=Cluster0
```

## Complete `.env` File Content

Your `backend/.env` should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://anasqureshi9764_db_user:h5B9t5DpV46Y7dbX@cluster0.zukuduq.mongodb.net/alcoa-admin?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=alcoa-admin-jwt-secret-2025-change-in-production-please-use-strong-random-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-specific-password
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@alcoascaffolding.com
ADMIN_EMAIL=admin@alcoascaffolding.com
```

## Important Notes:

1. **Database Name**: I added `alcoa-admin` as the database name in the URI
2. **Security**: Added `retryWrites=true&w=majority` for data consistency
3. **Change JWT_SECRET**: Generate a strong secret key for production

## Steps to Complete Setup:

### 1. Update .env File
Open `backend/.env` and paste the MongoDB URI above.

### 2. MongoDB Atlas Security (IMPORTANT!)

Go to your MongoDB Atlas dashboard:

**a) Network Access:**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your current IP address

**b) Database User:**
   - Your user is already created: `anasqureshi9764_db_user`
   - Password: `h5B9t5DpV46Y7dbX`
   - Make sure user has "Read and Write" permissions

### 3. Create Admin User

After MongoDB is connected, create your first admin user:

```bash
cd backend
node scripts/createAdmin.js
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.zukuduq.mongodb.net
🚀 Server started successfully on port 5000
```

### 5. Test Connection

Open browser or use curl:
```
http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Alcoa Scaffolding API is running"
}
```

## Troubleshooting:

### Connection Timeout
- Check MongoDB Atlas Network Access settings
- Add your IP: 0.0.0.0/0 (for development)

### Authentication Failed
- Verify username and password in MongoDB Atlas
- Make sure user has correct permissions

### Database Not Created
- The database `alcoa-admin` will be created automatically
- It appears after first document is inserted

## Next Steps:

1. ✅ Update .env with MongoDB URI
2. ✅ Configure Network Access in MongoDB Atlas
3. ✅ Start backend server
4. ✅ Create admin user
5. ✅ Start frontend and login!

---

**Your MongoDB is ready to use!** 🎉

