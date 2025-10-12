#!/bin/bash

# Kill Port 3000 Script
# This script kills processes using port 3000

echo "🔫 Killing processes on port 3000"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if any process is using port 3000
echo "Checking processes on port 3000..."

if lsof -i:3000 > /dev/null 2>&1; then
    echo "Processes found on port 3000:"
    lsof -i:3000
    
    echo ""
    print_status "Killing processes on port 3000..."
    
    # Kill processes using port 3000
    PIDS=$(lsof -ti:3000)
    
    if [ -n "$PIDS" ]; then
        echo "Killing PIDs: $PIDS"
        kill -9 $PIDS
        
        # Wait a moment
        sleep 2
        
        # Check if processes are still running
        if lsof -i:3000 > /dev/null 2>&1; then
            print_warning "Some processes still running, trying force kill..."
            sudo kill -9 $PIDS 2>/dev/null || true
            sleep 2
        fi
        
        # Final check
        if lsof -i:3000 > /dev/null 2>&1; then
            print_error "Failed to kill all processes on port 3000"
            echo "Remaining processes:"
            lsof -i:3000
            exit 1
        else
            print_status "Successfully killed all processes on port 3000"
        fi
    else
        print_warning "No PIDs found to kill"
    fi
else
    print_status "No processes found on port 3000"
fi

echo ""
echo "✅ Port 3000 is now free!"
echo ""
echo "🚀 You can now start your application:"
echo "   npm run dev"
echo ""
