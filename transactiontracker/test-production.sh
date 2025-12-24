#!/bin/bash

echo "🧪 Test de production GesFinance"
echo "🔧 Vérification Service Unavailable"
echo ""

# Configuration
export NODE_ENV=production
export PORT=5000

echo "📊 Configuration testée:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   Host: 0.0.0.0"
echo ""

# Attendre le serveur
echo "⏳ Attente du serveur (20 secondes)..."
sleep 20

# Tests de production
echo "🔍 Tests de production:"
echo ""

# Test 1: Health check
echo -n "1. Health check (/health): "
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health.json http://localhost:5000/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ OK"
    echo "   Response: $(cat /tmp/health.json | jq -r '.status')"
else
    echo "❌ FAIL ($HEALTH_RESPONSE)"
fi

# Test 2: Root endpoint
echo -n "2. Root endpoint (/): "
ROOT_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:5000/)
if [ "$ROOT_RESPONSE" = "200" ]; then
    echo "✅ OK"
else
    echo "❌ FAIL ($ROOT_RESPONSE)"
fi

# Test 3: API status
echo -n "3. API status (/api/status): "
API_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/api.json http://localhost:5000/api/status)
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ OK"
    echo "   Response: $(cat /tmp/api.json | jq -r '.status')"
else
    echo "❌ FAIL ($API_RESPONSE)"
fi

# Test 4: CORS headers
echo -n "4. CORS headers: "
CORS_RESPONSE=$(curl -s -I http://localhost:5000/ | grep -i "access-control-allow-origin")
if [ -n "$CORS_RESPONSE" ]; then
    echo "✅ OK"
    echo "   Header: $CORS_RESPONSE"
else
    echo "❌ FAIL"
fi

# Test 5: External binding
echo -n "5. External binding: "
BIND_CHECK=$(netstat -ln | grep "0.0.0.0:5000")
if [ -n "$BIND_CHECK" ]; then
    echo "✅ OK"
    echo "   Binding: $BIND_CHECK"
else
    echo "❌ FAIL"
fi

echo ""
echo "✅ Tests terminés"
echo ""

# Résumé
if [ "$HEALTH_RESPONSE" = "200" ] && [ "$ROOT_RESPONSE" = "200" ] && [ "$API_RESPONSE" = "200" ] && [ -n "$CORS_RESPONSE" ] && [ -n "$BIND_CHECK" ]; then
    echo "🎉 TOUS LES TESTS RÉUSSIS"
    echo "✅ Serveur prêt pour déploiement"
    echo "🌐 Accessible depuis l'extérieur"
else
    echo "❌ CERTAINS TESTS ONT ÉCHOUÉ"
    echo "🔧 Vérifiez la configuration"
fi

echo ""
echo "📱 Une fois déployé, accessible à:"
echo "   https://votre-repl.replit.app"
echo "   https://votre-repl.replit.app/health"
