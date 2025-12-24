#!/bin/bash
echo "🔍 GesFinance - Sanity Check"
echo "=========================="

# Test des composants essentiels
echo "1. Vérification Node.js..."
node --version || exit 1

echo "2. Vérification des fichiers..."
[ -f "package.json" ] || { echo "❌ package.json manquant"; exit 1; }
[ -f "dist/index.js" ] || { echo "❌ dist/index.js manquant"; exit 1; }

echo "3. Test de build..."
npm run build --silent || { echo "❌ Build échoué"; exit 1; }

echo "4. Test de démarrage..."
timeout 10 npm start &
PID=$!
sleep 5

# Test health check
if curl -f -s http://localhost:5000/health > /dev/null; then
    echo "✅ Health check réussi"
else
    echo "❌ Health check échoué"
    kill $PID 2>/dev/null
    exit 1
fi

kill $PID 2>/dev/null
echo "✅ Tous les tests passés - Prêt pour déploiement"
