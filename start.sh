#!/bin/bash

# Project directory
cd /Users/erolakarsu/projects/ai-food-flow-order

echo "========================================"
echo "   AI Food Flow Order - Starting...    "
echo "========================================"

# Override any shell env vars with ngrok URLs
export VITE_NGROK_SMS_URL=https://fd80be95a452.ngrok-free.app/api/send-sms
export VITE_NGROK_VOICE_URL=https://fd80be95a452.ngrok-free.app/api/voice
export VITE_TOKEN_URL=https://fd80be95a452.ngrok-free.app/api/twilio-token
echo "Environment variables set (using ngrok)"

# Kill processes on ports
echo "Cleaning ports..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1

# Check PostgreSQL
echo "Checking PostgreSQL..."
pg_isready > /dev/null 2>&1 || { echo "PostgreSQL not running!"; exit 1; }
echo "PostgreSQL is running"

# Seed database
echo "Seeding database..."
cd server && npm run seed 2>&1 | tail -3
cd ..

echo ""
echo "========================================"
echo "   Starting servers...                 "
echo "========================================"
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3001"
echo "========================================"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Shutting down..."
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

echo "Servers started. Press Ctrl+C to stop."

# Wait for processes
wait
