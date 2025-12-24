# Guide d'Utilisation des Scripts Automatiques - GesFinance Reserved VM

## 🚀 Scripts Disponibles

J'ai créé 3 scripts automatiques pour simplifier votre déploiement :

### 1. `start-with-env.sh` - Démarrage avec Variables
- Configure automatiquement NODE_ENV=production et PORT=5000
- Vérifie que DATABASE_URL et SESSION_SECRET sont présentes
- Démarre le serveur en mode production

### 2. `test-complete.sh` - Test Complet
- Teste tous les endpoints (/, /health, /api/status)
- Vérifie l'optimisation mobile
- Valide que le serveur fonctionne correctement

### 3. `deploy-with-env.js` - Déploiement Automatisé
- Build de production avec variables
- Création de tous les fichiers de configuration
- Validation complète avant déploiement

## 📋 Instructions d'Utilisation

### Étape 1 : Vérifier les Scripts
```bash
# Vérifier que les scripts existent
ls -la start-with-env.sh test-complete.sh

# Vérifier les permissions (doivent être exécutables)
chmod +x start-with-env.sh test-complete.sh
```

### Étape 2 : Démarrer l'Application
```bash
# Option A : Démarrage automatique (recommandé)
./start-with-env.sh

# Option B : Démarrage manuel
NODE_ENV=production PORT=5000 npm run start
```

### Étape 3 : Tester l'Application
```bash
# Dans un nouveau terminal, tester l'application
./test-complete.sh
```

### Étape 4 : Vérifier le Fonctionnement
```bash
# Tester manuellement les endpoints
curl http://localhost:5000/health
curl http://localhost:5000/
curl http://localhost:5000/api/status
```

## 🔧 Utilisation Détaillée

### Démarrage avec `start-with-env.sh`

Le script fait automatiquement :
1. ✅ Configure NODE_ENV=production
2. ✅ Configure PORT=5000
3. ✅ Vérifie DATABASE_URL (doit être dans les secrets Replit)
4. ✅ Vérifie SESSION_SECRET (doit être dans les secrets Replit)
5. ✅ Démarre le serveur avec `npm run start`

**Sortie attendue :**
```
🚀 Démarrage GesFinance Reserved VM
📊 Configuration:
   NODE_ENV: production
   PORT: 5000
   Host: 0.0.0.0
   External Port: 80

✅ Variables d'environnement validées

🎯 Démarrage du serveur...
```

### Test avec `test-complete.sh`

Le script teste automatiquement :
1. ✅ Health check endpoint
2. ✅ Interface principale
3. ✅ API status
4. ✅ Optimisation mobile

**Sortie attendue :**
```
🧪 Test complet de déploiement GesFinance
📊 Configuration testée:
   NODE_ENV: production
   PORT: 5000

🔍 Tests des endpoints:
   Health check: ✅ OK
   Root endpoint: ✅ OK
   API status: ✅ OK
   Mobile headers: ✅ OK

✅ Tests terminés
```

## 🎯 Scénarios d'Utilisation

### Scénario 1 : Démarrage Rapide
```bash
# Terminal 1 : Démarrer l'application
./start-with-env.sh

# Terminal 2 : Tester (attendre 10 secondes)
./test-complete.sh
```

### Scénario 2 : Déploiement Complet
```bash
# 1. Build et configuration
node deploy-with-env.js

# 2. Démarrage
./start-with-env.sh

# 3. Test
./test-complete.sh
```

### Scénario 3 : Déploiement Replit
```bash
# 1. Préparer l'environnement
./start-with-env.sh

# 2. Utiliser le bouton "Deploy" dans Replit
# L'application utilisera automatiquement les variables configurées
```

## 🔍 Résolution de Problèmes

### Problème : Script non exécutable
```bash
# Solution
chmod +x start-with-env.sh test-complete.sh
```

### Problème : Variables manquantes
```bash
# Vérifier les variables
echo $DATABASE_URL
echo $SESSION_SECRET

# Si vides, ajouter dans les secrets Replit
```

### Problème : Port déjà utilisé
```bash
# Tuer le processus existant
pkill -f "npm run start"
pkill -f "node"

# Redémarrer
./start-with-env.sh
```

### Problème : Tests échouent
```bash
# Attendre plus longtemps avant de tester
sleep 15
./test-complete.sh
```

## 📱 Accès à l'Application

### Accès Local
- **Interface principale** : http://localhost:5000/
- **Santé du serveur** : http://localhost:5000/health
- **API Status** : http://localhost:5000/api/status

### Accès Externe (après déploiement)
- **URL Replit** : https://votre-repl.replit.app/
- **URL Personnalisée** : Selon votre configuration

## ✅ Validation Finale

Après avoir utilisé les scripts, vous devriez avoir :
- ✅ Serveur démarré sur le port 5000
- ✅ Variables d'environnement configurées
- ✅ Tous les endpoints fonctionnels
- ✅ Optimisation mobile activée
- ✅ Monitoring et santé du serveur actifs

---

**Note** : Ces scripts fonctionnent parfaitement sans avoir besoin de configurer manuellement les secrets Replit pour NODE_ENV et PORT. Seuls DATABASE_URL et SESSION_SECRET doivent être dans les secrets Replit (et ils le sont déjà).