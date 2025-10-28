#!/bin/bash

echo "🚀 PMO System Quick Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node version..."
node_version=$(node -v)
echo "Node: $node_version"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Run: npm install${NC}"
else
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi
echo ""

# Check Prisma
echo "🔧 Checking Prisma..."
if command -v npx &> /dev/null; then
    echo "Running prisma validate..."
    npx prisma validate > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Prisma schema valid${NC}"
    else
        echo -e "${RED}❌ Prisma schema has errors${NC}"
    fi
fi
echo ""

# Check TypeScript
echo "📝 Checking TypeScript..."
npx tsc --noEmit > /tmp/tsc-errors.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found. Check /tmp/tsc-errors.log${NC}"
fi
echo ""

# Check build
echo "🏗️  Checking build..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Check /tmp/build.log${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "✅ Quick verification complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Test all CRUD operations in the app"
echo "2. Verify authentication flow"
echo "3. Check permissions for each role"
echo "4. Test file uploads and exports"
echo ""

