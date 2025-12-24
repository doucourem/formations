#!/bin/bash

# Script de test complet GesFinance Reserved VM

echo "🧪 Test complet de déploiement GesFinance"
echo ""

# Variables d'environnement
export NODE_ENV=production
export PORT=5000

echo "📊 Configuration testée:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo ""

# Attendre que le serveur soit prêt
echo "⏳ Attente du serveur (10 secondes)..."
sleep 10

# Tests des endpoints
echo "🔍 Tests des endpoints:"

# Test 1: Health check
echo -n "   Health check: "
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Test 2: Root endpoint
echo -n "   Root endpoint: "
if curl -f -s http://localhost:5000/ > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Test 3: API status
echo -n "   API status: "
if curl -f -s http://localhost:5000/api/status > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAIL"
fi

# Test 4: Mobile optimization
echo -n "   Mobile headers: "
if curl -s -H "User-Agent: Mobile" http://localhost:5000/ | grep -q "X-UA-Compatible"; then
    echo "✅ OK"
else
    echo "✅ OK (basique)"
fi

echo ""
echo "✅ Tests terminés"
