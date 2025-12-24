#!/bin/bash

# TEST COMPLET UTILISATEURS - DÉPLOIEMENT GESFINANCE
# Teste tous les utilisateurs sur le serveur de déploiement
# Date: 9 janvier 2025

echo "🔥 TEST COMPLET UTILISATEURS - DÉPLOIEMENT GESFINANCE"
echo "===================================================="

# Build et démarrer le serveur de déploiement
echo "📦 Build de l'application..."
npm run build > /dev/null 2>&1

echo "🚀 Démarrage du serveur de déploiement..."
node server/minimal-server.js &
SERVER_PID=$!

# Attendre que le serveur démarre
echo "⏱️  Attente démarrage serveur..."
sleep 8

# Vérifier que le serveur est actif
echo "🔍 Vérification santé du serveur..."
HEALTH_CHECK=$(curl -s http://localhost:5000/health | jq -r '.status' 2>/dev/null)

if [ "$HEALTH_CHECK" != "healthy" ]; then
    echo "❌ Serveur de déploiement non opérationnel"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "✅ Serveur de déploiement opérationnel"

# Liste des utilisateurs à tester
declare -A USERS=(
    ["admin"]="admin123"
    ["orange"]="orange123"
    ["cire"]="430001"
    ["barry"]="barry123"
    ["haroun@gmail.com"]="123456"
    ["bah"]="123456"
)

# Compteurs
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo ""
echo "🧪 TESTS D'AUTHENTIFICATION"
echo "============================"

# Tester chaque utilisateur
for username in "${!USERS[@]}"; do
    password="${USERS[$username]}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo "🔐 Test utilisateur: $username"
    
    # Test de connexion
    LOGIN_RESPONSE=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
        http://localhost:5000/api/auth/login)
    
    HTTP_CODE="${LOGIN_RESPONSE: -3}"
    JSON_RESPONSE="${LOGIN_RESPONSE%???}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        # Extraire l'ID utilisateur de la réponse
        USER_ID=$(echo "$JSON_RESPONSE" | jq -r '.id' 2>/dev/null)
        USER_ROLE=$(echo "$JSON_RESPONSE" | jq -r '.role' 2>/dev/null)
        
        if [ "$USER_ID" != "null" ] && [ "$USER_ID" != "" ]; then
            echo "  ✅ Connexion réussie (ID: $USER_ID, Rôle: $USER_ROLE)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            
            # Test d'accès aux données (session cookie)
            COOKIE_HEADER=$(curl -s -i \
                -H "Content-Type: application/json" \
                -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
                http://localhost:5000/api/auth/login | grep -i "set-cookie" | head -1)
            
            if [ ! -z "$COOKIE_HEADER" ]; then
                COOKIE_VALUE=$(echo "$COOKIE_HEADER" | sed 's/.*connect.sid=\([^;]*\).*/\1/')
                
                # Test accès données utilisateur
                DATA_RESPONSE=$(curl -s -w "%{http_code}" \
                    -H "Cookie: connect.sid=$COOKIE_VALUE" \
                    http://localhost:5000/api/user/profile)
                
                DATA_HTTP_CODE="${DATA_RESPONSE: -3}"
                
                if [ "$DATA_HTTP_CODE" = "200" ]; then
                    echo "  ✅ Accès aux données utilisateur OK"
                else
                    echo "  ⚠️  Problème d'accès aux données (code: $DATA_HTTP_CODE)"
                fi
            fi
        else
            echo "  ❌ Réponse invalide: $JSON_RESPONSE"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        ERROR_MSG=$(echo "$JSON_RESPONSE" | jq -r '.message' 2>/dev/null)
        echo "  ❌ Échec connexion (code: $HTTP_CODE, erreur: $ERROR_MSG)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
done

# Test des endpoints API critiques
echo "🔍 TESTS API CRITIQUES"
echo "======================"

# Test avec admin connecté
ADMIN_LOGIN=$(curl -s \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://localhost:5000/api/auth/login)

ADMIN_COOKIE=$(curl -s -i \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    http://localhost:5000/api/auth/login | grep -i "set-cookie" | head -1 | sed 's/.*connect.sid=\([^;]*\).*/\1/')

if [ ! -z "$ADMIN_COOKIE" ]; then
    echo "🔐 Tests avec session admin..."
    
    # Test endpoint santé
    HEALTH_TEST=$(curl -s -w "%{http_code}" http://localhost:5000/health)
    HEALTH_CODE="${HEALTH_TEST: -3}"
    [ "$HEALTH_CODE" = "200" ] && echo "  ✅ /health" || echo "  ❌ /health (code: $HEALTH_CODE)"
    
    # Test endpoint auth status
    AUTH_STATUS=$(curl -s -w "%{http_code}" \
        -H "Cookie: connect.sid=$ADMIN_COOKIE" \
        http://localhost:5000/api/auth/status)
    AUTH_CODE="${AUTH_STATUS: -3}"
    [ "$AUTH_CODE" = "200" ] && echo "  ✅ /api/auth/status" || echo "  ❌ /api/auth/status (code: $AUTH_CODE)"
    
    # Test endpoint utilisateurs
    USERS_TEST=$(curl -s -w "%{http_code}" \
        -H "Cookie: connect.sid=$ADMIN_COOKIE" \
        http://localhost:5000/api/users)
    USERS_CODE="${USERS_TEST: -3}"
    [ "$USERS_CODE" = "200" ] && echo "  ✅ /api/users" || echo "  ❌ /api/users (code: $USERS_CODE)"
    
else
    echo "❌ Impossible d'obtenir session admin pour tests API"
fi

# Arrêter le serveur
echo ""
echo "🛑 Arrêt du serveur de déploiement..."
kill $SERVER_PID 2>/dev/null
sleep 2

# Résumé final
echo ""
echo "📊 RÉSUMÉ DES TESTS"
echo "=================="
echo "Total des tests: $TOTAL_TESTS"
echo "Réussis: $PASSED_TESTS"
echo "Échoués: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo "🎉 TOUS LES TESTS RÉUSSIS !"
    echo "✅ Authentification déploiement fonctionnelle"
    echo "✅ Tous les utilisateurs peuvent se connecter"
    echo "✅ Accès aux données garanti"
    echo ""
    echo "🚀 PRÊT POUR DÉPLOIEMENT RESERVED VM"
    exit 0
else
    echo ""
    echo "⚠️  PROBLÈMES DÉTECTÉS"
    echo "❌ $FAILED_TESTS utilisateur(s) ne peuvent pas se connecter"
    echo "🔧 Vérifiez les mots de passe et la configuration"
    exit 1
fi