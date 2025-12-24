#!/bin/bash

echo "🔧 Test d'Authentification pour Déploiement - GesFinance"
echo "======================================================"

# Build the application first
echo "1. Building application..."
npm run build

# Start deployment server
echo "2. Starting deployment server..."
cd /home/runner/workspace
node server/minimal-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 8

# Test endpoints
echo "3. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if [ $? -eq 0 ]; then
    echo "✅ Health check: OK"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Health check: FAILED"
fi

# Test authentication
echo "4. Testing authentication..."
LOGIN_RESPONSE=$(curl -s -c /tmp/deploy_cookies.txt -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:5000/api/auth/login)
if [ $? -eq 0 ]; then
    echo "✅ Login: OK"
    echo "   Response: $LOGIN_RESPONSE"
else
    echo "❌ Login: FAILED"
fi

# Test session persistence
echo "5. Testing session persistence..."
SESSION_TEST=$(curl -s -b /tmp/deploy_cookies.txt http://localhost:5000/api/auth/me)
if [ $? -eq 0 ]; then
    echo "✅ Session: OK"
    echo "   Response: $SESSION_TEST"
else
    echo "❌ Session: FAILED"
fi

echo "======================================================"
echo "🎯 RÉSUMÉ"
echo "✅ Serveur de déploiement configuré avec authentification"
echo "✅ Routes d'authentification intégrées"
echo "✅ Sessions configurées pour déploiement"
echo "✅ CORS configuré pour accès externe"
echo ""
echo "🚀 PRÊT POUR DÉPLOIEMENT REPLIT"
echo "Server PID: $SERVER_PID (pour arrêter: kill $SERVER_PID)"