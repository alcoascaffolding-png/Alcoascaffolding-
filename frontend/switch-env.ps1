# PowerShell script to switch frontend website environment

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("production", "development", "prod", "dev")]
    [string]$Environment
)

# Normalize environment name
$TargetEnv = switch ($Environment) {
    "prod" { "production" }
    "dev" { "development" }
    default { $Environment }
}

Write-Host ""
Write-Host "Switching Frontend Website to $TargetEnv environment..." -ForegroundColor Cyan
Write-Host ""

# Remove existing .env file
if (Test-Path ".env") {
    Remove-Item ".env"
    Write-Host "  Removed old .env file" -ForegroundColor Yellow
}

# Copy appropriate environment file
$SourceFile = ".env.$TargetEnv.local"
if (Test-Path $SourceFile) {
    Copy-Item $SourceFile ".env"
    Write-Host "  Copied $SourceFile to .env" -ForegroundColor Green
} else {
    Write-Host "  Error: $SourceFile not found!" -ForegroundColor Red
    Write-Host "  Please create $SourceFile first" -ForegroundColor Yellow
    exit 1
}

# Display current configuration
Write-Host ""
Write-Host "Frontend Website Configuration:" -ForegroundColor Cyan
Write-Host ""
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^VITE_") {
        Write-Host "  $_"
    }
}

Write-Host ""
Write-Host "Environment switched successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""

if ($TargetEnv -eq "production") {
    Write-Host "  1. Using Production Backend (Render.com)" -ForegroundColor Yellow
    Write-Host "  2. Website will submit forms to production" -ForegroundColor Yellow
    Write-Host "  3. Run: npm run dev" -ForegroundColor White
} else {
    Write-Host "  1. Using Local Backend (localhost:5000)" -ForegroundColor Yellow
    Write-Host "  2. Start backend: cd ..\backend ; npm start" -ForegroundColor White
    Write-Host "  3. Then run: npm run dev" -ForegroundColor White
}

Write-Host ""

