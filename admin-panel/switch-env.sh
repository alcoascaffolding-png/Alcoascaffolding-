#!/bin/bash

# Bash script to switch between production and development environments

# Check if environment argument is provided
if [ -z "$1" ]; then
    echo ""
    echo "❌ Error: Please specify environment"
    echo ""
    echo "Usage:"
    echo "  ./switch-env.sh production   # Use production backend"
    echo "  ./switch-env.sh development  # Use local backend"
    echo "  ./switch-env.sh prod         # Shorthand for production"
    echo "  ./switch-env.sh dev          # Shorthand for development"
    echo ""
    exit 1
fi

# Normalize environment name
ENV=$1
case $ENV in
    prod)
        ENV="production"
        ;;
    dev)
        ENV="development"
        ;;
    production|development)
        # Already normalized
        ;;
    *)
        echo "❌ Invalid environment: $ENV"
        echo "Use: production, development, prod, or dev"
        exit 1
        ;;
esac

echo ""
echo "🔄 Switching to $ENV environment..."
echo ""

# Remove existing .env file
if [ -f ".env" ]; then
    rm .env
    echo "  🗑️  Removed old .env file"
fi

# Copy appropriate environment file
SOURCE_FILE=".env.$ENV.local"
if [ -f "$SOURCE_FILE" ]; then
    cp "$SOURCE_FILE" ".env"
    echo "  ✅ Copied $SOURCE_FILE to .env"
else
    echo "  ❌ Error: $SOURCE_FILE not found!"
    echo "  💡 Please create $SOURCE_FILE first"
    exit 1
fi

# Display current configuration
echo ""
echo "📋 Current Configuration:"
echo ""
grep "^VITE_" .env | while read line; do
    echo "  $line"
done

echo ""
echo "✨ Environment switched successfully!"
echo ""
echo "🚀 Next steps:"

if [ "$ENV" = "production" ]; then
    echo "  • Using Production Backend (Render.com)"
    echo "  • Make sure backend is deployed on Render"
    echo "  • Run: npm run dev"
else
    echo "  • Using Local Backend (localhost:5000)"
    echo "  • Make sure to start local backend: cd ../backend && npm start"
    echo "  • Run: npm run dev"
fi

echo ""

