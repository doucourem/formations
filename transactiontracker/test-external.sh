#!/bin/bash

echo "🧪 Test d'accès externe"
echo ""

sleep 10

echo "🔍 Tests:"

curl -f -s http://localhost:5000/health > /dev/null && echo "   Health check: ✅" || echo "   Health check: ❌"
curl -f -s http://localhost:5000/ > /dev/null && echo "   Interface: ✅" || echo "   Interface: ❌"
curl -s -I http://localhost:5000/ | grep -q "Access-Control-Allow-Origin" && echo "   CORS: ✅" || echo "   CORS: ❌"

echo ""
echo "✅ Tests terminés"
