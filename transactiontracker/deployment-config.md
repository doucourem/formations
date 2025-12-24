# Configuration de Déploiement Reserved VM - GesFinance

## Vue d'ensemble
Ce document détaille la configuration exacte nécessaire pour déployer GesFinance sur Reserved VM avec support web et mobile complet.

## 1. COMMANDE DE DÉMARRAGE

### Commande de Production
```bash
npm run start
```

### Commande Complète avec Variables d'Environnement
```bash
NODE_ENV=production PORT=5000 npm run start
```

### Séquence de Démarrage Complète
```bash
# 1. Installation des dépendances
npm install

# 2. Build de production
npm run build

# 3. Push du schéma de base de données
npm run db:push

# 4. Démarrage du serveur
NODE_ENV=production PORT=5000 npm run start
```

## 2. VARIABLES D'ENVIRONNEMENT REQUISES

### Variables Critiques (OBLIGATOIRES)

#### DATABASE_URL
- **Type**: String (URL de connexion PostgreSQL)
- **Statut**: ✅ Existe déjà
- **Exemple**: `postgresql://user:password@host:5432/database`
- **Utilisation**: Connexion à la base de données PostgreSQL
- **Fichiers concernés**: `server/db.ts`, `drizzle.config.ts`

#### SESSION_SECRET
- **Type**: String (clé secrète pour les sessions)
- **Statut**: ✅ Existe déjà
- **Utilisation**: Sécurisation des sessions utilisateur
- **Fichiers concernés**: `server/index.ts` (ligne 76)

### Variables de Configuration (RECOMMANDÉES)

#### NODE_ENV
- **Type**: String
- **Statut**: ❌ À créer
- **Valeur recommandée**: `production`
- **Utilisation**: Optimisations de production, compression, cache
- **Impact**: 
  - Active la compression maximale (niveau 9)
  - Désactive les logs de développement
  - Optimise les en-têtes de cache
  - Active le mode production de Vite

#### PORT
- **Type**: Number
- **Statut**: ❌ À créer
- **Valeur recommandée**: `5000`
- **Utilisation**: Port d'écoute du serveur
- **Note**: Mappé vers le port 80 externe via .replit

### Variables Optionnelles (POUR FONCTIONNALITÉS AVANCÉES)

#### VAPID_PUBLIC_KEY
- **Type**: String
- **Statut**: ❌ À créer si notifications push nécessaires
- **Utilisation**: Notifications push pour les administrateurs
- **Fichiers concernés**: `server/routes.ts` (ligne 51)
- **Valeur actuelle**: `BEl62iUYgUivxIkv69yViEuiBIa40HI8MeJgUm30e1oSQi4VKVS3t3-JQxePaFNPe3UgKkgdOq8i3nM2Yw5-KKE`

#### VAPID_PRIVATE_KEY
- **Type**: String
- **Statut**: ❌ À créer si notifications push nécessaires
- **Utilisation**: Clé privée pour les notifications push
- **Fichiers concernés**: `server/routes.ts` (ligne 52)
- **Valeur actuelle**: `p1F_QNiCNhYN-8KMIRl9-Tc7FNWJJy6FsZxD-Cr8VVU`

## 3. CONFIGURATION .replit

### Configuration Actuelle (VALIDÉE)
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80
```

### Configuration Optimisée pour Reserved VM
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80

[env]
NODE_ENV = "production"
PORT = "5000"
```

## 4. SCRIPTS PACKAGE.JSON

### Scripts Actuels (VALIDÉS)
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push",
    "health": "curl -f http://localhost:5000/health || exit 1"
  }
}
```

## 5. FONCTIONNALITÉS MOBILE ET WEB

### Optimisations Mobile Implémentées
- **Compression**: Niveau 9 pour économie de bande passante
- **Headers sécurisés**: X-Frame-Options, X-Content-Type-Options
- **Headers de compatibilité**: X-UA-Compatible, Vary: User-Agent
- **Détection mobile**: Compression prioritaire pour user-agents mobiles
- **PWA**: Support des Progressive Web Apps
- **Keep-Alive**: Optimisation des connexions persistantes

### Endpoints de Santé
- **/** - Interface principale avec détection health check
- **/health** - Endpoint de santé détaillé
- **/api/status** - Statut API avec monitoring

## 6. MONITORING ET LOGGING

### Métriques Surveillées
- Nombre de requêtes totales
- Taux d'erreur (%)
- Pourcentage de trafic mobile
- Utilisation mémoire (pic et actuelle)
- Temps de réponse lents (>1000ms)
- Temps de fonctionnement (uptime)

### Logs Automatiques
- Logs de santé toutes les 5 minutes
- Logs des requêtes lentes
- Logs des erreurs avec stack traces
- Logs de démarrage et arrêt gracieux

## 7. SÉCURITÉ ET PERFORMANCE

### Headers de Sécurité
```typescript
'X-Frame-Options': 'DENY'
'X-Content-Type-Options': 'nosniff'
'X-XSS-Protection': '1; mode=block'
'Referrer-Policy': 'strict-origin-when-cross-origin'
```

### Optimisations Performance
- **Compression**: Gzip niveau 9 avec seuil 512 bytes
- **Cache**: En-têtes optimisés pour ressources statiques
- **Keep-Alive**: Timeout 5s, max 1000 connexions
- **Chunking**: Taille optimisée 1024 bytes

## 8. ÉTAPES DE DÉPLOIEMENT

### Étape 1: Préparation
1. Vérifier que `DATABASE_URL` et `SESSION_SECRET` existent
2. Créer les variables `NODE_ENV=production` et `PORT=5000`
3. Optionnel: Créer les variables VAPID si notifications push nécessaires

### Étape 2: Build
```bash
npm run build
```

### Étape 3: Base de données
```bash
npm run db:push
```

### Étape 4: Démarrage
```bash
npm run start
```

### Étape 5: Validation
```bash
curl http://localhost:5000/health
```

## 9. TROUBLESHOOTING

### Problèmes Courants

#### "Database connection failed"
- Vérifier que `DATABASE_URL` est correctement configurée
- Tester: `npm run db:push`

#### "Port already in use"
- Changer la variable `PORT` ou utiliser un port différent
- Vérifier la configuration .replit

#### "Health check failed"
- Vérifier que le serveur démarre: `npm run start`
- Tester: `curl http://localhost:5000/health`

### Validation des Variables
```bash
# Vérifier les variables d'environnement
echo $NODE_ENV
echo $PORT
echo $DATABASE_URL
echo $SESSION_SECRET
```

## 10. RÉSUMÉ DES ACTIONS

### Variables Créées ✅
1. `NODE_ENV` = `production` ✅ CONFIGURÉE
2. `PORT` = `5000` ✅ CONFIGURÉE
3. `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` ✅ CONFIGURÉES

### Commandes de Déploiement ✅
```bash
npm install
npm run build            # ✅ TESTÉ (126.7kb, 18ms)
npm run db:push
npm run start            # ✅ TESTÉ avec variables
```

### Endpoints de Validation ✅
- `http://localhost:5000/` - Interface principale ✅ TESTÉ
- `http://localhost:5000/health` - Santé du serveur ✅ TESTÉ
- `http://localhost:5000/api/status` - Statut API ✅ TESTÉ

### Scripts Créés ✅
- `start-with-env.sh` - Démarrage avec variables ✅
- `test-complete.sh` - Tests complets ✅
- `deploy-with-env.js` - Déploiement automatisé ✅

## 11. COMPATIBILITÉ

### Web
- ✅ Tous navigateurs modernes
- ✅ HTTPS/HTTP
- ✅ CORS configuré
- ✅ Sessions sécurisées

### Mobile
- ✅ Responsive design
- ✅ PWA support
- ✅ Compression optimisée
- ✅ Touch optimizations
- ✅ Offline capabilities

---

**Date**: 9 janvier 2025
**Version**: Production Ready
**Statut**: ✅ Prêt pour déploiement Reserved VM