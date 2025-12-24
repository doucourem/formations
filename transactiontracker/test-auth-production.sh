#!/bin/bash

echo "🔧 Testing Production Authentication - GesFinance"
echo "=============================================="

# Start production server in background
echo "1. Starting production server..."
cd /home/runner/workspace
npx tsx server/production-simple.js &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test 1: Health check
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/health)
if [ $? -eq 0 ]; then
    echo "✅ Health check: OK"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Health check: FAILED"
fi

# Test 2: Auth status (before login)
echo "3. Testing auth status (before login)..."
AUTH_STATUS=$(curl -s http://localhost:5001/api/auth/status)
if [ $? -eq 0 ]; then
    echo "✅ Auth status: OK"
    echo "   Response: $AUTH_STATUS"
else
    echo "❌ Auth status: FAILED"
fi

# Test 3: Login attempt
echo "4. Testing login..."
LOGIN_RESPONSE=$(curl -s -c /tmp/cookies.txt -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:5001/api/auth/login)
if [ $? -eq 0 ]; then
    echo "✅ Login request: OK"
    echo "   Response: $LOGIN_RESPONSE"
else
    echo "❌ Login request: FAILED"
fi

# Test 4: Auth check (after login)
echo "5. Testing auth check (after login)..."
AUTH_ME=$(curl -s -b /tmp/cookies.txt http://localhost:5001/api/auth/me)
if [ $? -eq 0 ]; then
    echo "✅ Auth me: OK"
    echo "   Response: $AUTH_ME"
else
    echo "❌ Auth me: FAILED"
fi

# Test 5: Protected endpoint
echo "6. Testing protected endpoint..."
PROTECTED=$(curl -s -b /tmp/cookies.txt http://localhost:5001/api/users)
if [ $? -eq 0 ]; then
    echo "✅ Protected endpoint: OK"
    echo "   Response: $PROTECTED"
else
    echo "❌ Protected endpoint: FAILED"
fi

echo "=============================================="
echo "Test completed. Server PID: $SERVER_PID"
echo "To stop server: kill $SERVER_PID"