#!/bin/bash

# AI Food Flow Order - Startup Script
# This script handles port cleanup, migrations, seeding, and server startup

# Project directory
cd /Users/erolakarsu/projects/ai-food-flow-order

echo "=========================================="
echo "   AI Food Flow Order - Starting...      "
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[X]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Step 1: Kill processes on ports (NOT 5000)
echo ""
print_info "Cleaning ports..."

lsof -ti:3000 | xargs kill -9 2>/dev/null && print_status "Port 3000 cleared" || print_status "Port 3000 available"
lsof -ti:3001 | xargs kill -9 2>/dev/null && print_status "Port 3001 cleared" || print_status "Port 3001 available"
lsof -ti:5173 | xargs kill -9 2>/dev/null && print_status "Port 5173 cleared" || print_status "Port 5173 available"
sleep 1

# Step 2: Check PostgreSQL
echo ""
print_info "Checking PostgreSQL..."
pg_isready > /dev/null 2>&1 || { print_error "PostgreSQL not running!"; exit 1; }
print_status "PostgreSQL is running"

# Step 3: Load environment variables
echo ""
print_info "Loading environment..."
if [ -f server/.env ]; then
    export $(cat server/.env | grep -v '^#' | xargs 2>/dev/null) || true
    print_status "Environment loaded"
fi

# Step 4: Install dependencies if needed
echo ""
print_info "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
fi
if [ ! -d "server/node_modules" ]; then
    print_warning "Installing server dependencies..."
    cd server && npm install && cd ..
fi
print_status "Dependencies ready"

# Step 5: Run migrations
echo ""
print_info "Running migrations..."
cd server
npm run migrate 2>&1 | grep -E "(CREATE|NOTICE|already exists|completed)" | head -5 || true
print_status "Migrations complete"
cd ..

# Step 6: Seed database
echo ""
print_info "Seeding database..."
cd server
npm run seed 2>&1 | grep -E "(Seed|Created|exists)" | head -3 || true
npm run seed:ai 2>&1 | grep -E "(Seed|Created|exists)" | head -3 || true
print_status "Database seeded"
cd ..

echo ""
echo "=========================================="
echo "   Starting servers...                   "
echo "=========================================="
echo ""
echo -e "${GREEN}Frontend:${NC}  http://localhost:3000"
echo -e "${GREEN}Backend:${NC}   http://localhost:3001"
echo ""
echo -e "${BLUE}Admin Dashboard:${NC} http://localhost:3000/login"
echo -e "${BLUE}Demo Login:${NC}      demo@orderlybite.com / Demo123!"
echo ""
echo "=========================================="
echo ""

# Cleanup function
cleanup() {
    echo ""
    print_info "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap before starting processes
trap cleanup SIGINT SIGTERM

# Start backend in background
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

print_status "Servers started. Press Ctrl+C to stop."

# Wait for processes
wait
