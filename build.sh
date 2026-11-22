#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📦 Building Next.js app..."
npm run build

echo "✅ Build complete!"
