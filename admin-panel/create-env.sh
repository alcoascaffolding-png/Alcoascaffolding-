#!/bin/bash

# Bash script to create .env file for admin panel

echo "🔧 Creating Admin Panel Environment File..."

# Production configuration
cat > .env << 'EOF'
# API Configuration - Production Backend
VITE_API_URL=https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api

# Environment
VITE_ENV=production

# App Configuration
VITE_APP_NAME=Alcoa Admin Panel
VITE_APP_VERSION=1.0.0

# Timeouts (in milliseconds)
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
EOF

echo "✅ Created .env file successfully!"
echo ""
echo "📋 Configuration:"
echo "  API URL: https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api"
echo "  Environment: production"
echo ""
echo "🚀 Next steps:"
echo "  1. Review the .env file if needed"
echo "  2. Run: npm run dev"
echo "  3. Login and test!"
echo ""

