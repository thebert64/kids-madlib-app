#!/usr/bin/env python3
import subprocess
import os
import sys

# Change to project directory
project_dir = '/workspaces/claude'
os.chdir(project_dir)

print(f"📁 Working directory: {os.getcwd()}")
print("=" * 50)

# Step 1: Generate Prisma client
print("🔧 Generating Prisma client...")
try:
    result = subprocess.run(['npx', 'prisma', 'generate'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Prisma client generated successfully!")
    else:
        print(f"❌ Prisma generation failed: {result.stderr}")
        sys.exit(1)
except Exception as e:
    print(f"❌ Error running Prisma generate: {e}")
    sys.exit(1)

print("=" * 50)

# Step 2: Build Next.js
print("📦 Building Next.js application...")
try:
    result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode == 0:
        print("✅ Build completed successfully!")
    else:
        print(f"⚠️ Build completed with warnings/errors: {result.stderr}")
        print("\n📝 Output:")
        print(result.stdout)
except Exception as e:
    print(f"❌ Error running build: {e}")
    sys.exit(1)

print("=" * 50)
print("✨ All done! Ready to run: npm run dev")
