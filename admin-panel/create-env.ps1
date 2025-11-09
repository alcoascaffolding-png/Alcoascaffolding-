# PowerShell script to create .env file for admin panel

Write-Host "🔧 Creating Admin Panel Environment File..." -ForegroundColor Cyan

# Production configuration
$envContent = @"
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
"@

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host "✅ Created .env file successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  API URL: https://alco-aluminium-scaffolding-backend-5ucb.onrender.com/api"
Write-Host "  Environment: production"
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the .env file if needed"
Write-Host "  2. Run: npm run dev"
Write-Host "  3. Login and test!"
Write-Host ""

