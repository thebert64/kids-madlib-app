#!/bin/bash

# Mad Libs Story Builder - Setup Guide
# This script helps set up the application for development

echo "🎨 Mad Libs Stories - Setup"
echo "============================"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Create/migrate database
echo "🗄️  Initializing database..."
npx prisma migrate deploy || npx prisma db push

# Step 4: Done
echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at: http://localhost:3000"
echo ""
