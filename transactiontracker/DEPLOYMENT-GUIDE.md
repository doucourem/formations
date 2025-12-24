# 🚀 Guide de Déploiement - GesFinance

## Vue d'ensemble

GesFinance est une application de gestion financière optimisée pour mobile et web, supportant les transactions FCFA/GNF avec suivi en temps réel.

## 📱 Fonctionnalités Déployées

### Mobile
- Interface responsive (320px à 2XL)
- Progressive Web App (PWA) avec installation
- Bouton d'actualisation intelligent
- Optimisations pour connexions 3G
- Support tactile optimisé

### Web
- Interface desktop complète
- Compatibilité tous navigateurs
- Notifications temps réel
- Gestion des sessions sécurisée

## 🔧 Méthodes de Déploiement

### 1. Déploiement Replit (Recommandé)

#### Étape 1 : Préparation
```bash
# Construire l'application
npm run build

# Vérifier les fichiers
ls -la dist/
```

#### Étape 2 : Déploiement Simplifié
```bash
# Utiliser le serveur de déploiement
node deploy-simple.js
```

#### Étape 3 : Déploiement Complet
```bash
# Avec base de données PostgreSQL
node deploy-production.js
```

### 2. Déploiement Reserved VM

#### Configuration requise
```bash
# Variables d'environnement
export PORT=5000
export NODE_ENV=production
export DATABASE_URL="your-postgres-url"
export SESSION_SECRET="your-secret-key"
```

#### Démarrage
```bash
# Build et déploiement automatique
./build-and-deploy.sh

# Ou démarrage direct
cd dist/
npm install
npm start
```

## 🌐 Accès et URLs

### URLs d'accès
- **Principal :** `https://your-app.replit.app`
- **Health Check :** `https://your-app.replit.app/health`
- **API :** `https://your-app.replit.app/api/*`

### Compatibilité
- **Mobile :** iOS Safari, Android Chrome, Firefox Mobile
- **Desktop :** Chrome, Firefox, Safari, Edge
- **Tablettes :** iPad, Android tablets

## 🔐 Authentification

### Comptes de test disponibles
```
Admin : admin / admin123
Orange : orange / orange123
Cire : cire / 430001
Barry : barry / barry123
Haroun : haroun@gmail.com / 123456
Bah : bah / 123456
```

### Fonctionnalités par rôle
- **Utilisateur :** Transactions, clients, historique, rapports
- **Admin :** Toutes les fonctionnalités + validation, gestion utilisateurs, statistiques globales

## 📊 Monitoring

### Health Check
```bash
# Vérifier l'état du serveur
curl https://your-app.replit.app/health

# Réponse attendue
{
  "status": "healthy",
  "timestamp": "2025-07-16T04:18:00.000Z",
  "uptime": 3600,
  "memory": {...},
  "version": "1.0.0"
}
```

### Logs de diagnostic
```bash
# Surveiller les logs
tail -f logs/production.log

# Vérifier les erreurs
grep "ERROR" logs/production.log
```

## 🔄 Optimisations

### Performance Mobile
- Cache intelligent (5min utilisateur, 3min admin)
- Compression des données
- Lazy loading des images
- Service Worker pour offline

### Réseau 3G
- Timeouts adaptés (30s)
- Retry automatique (5x)
- Intervalles de requêtes optimisés
- Détection de connexion lente

### Sécurité
- Sessions sécurisées
- CORS configuré
- Headers de sécurité
- Validation des entrées

## 🐛 Dépannage

### Problèmes courants

#### 1. "Service Unavailable"
```bash
# Vérifier le serveur
curl -I https://your-app.replit.app
# Redémarrer si nécessaire
pm2 restart gesfinance
```

#### 2. Problèmes d'authentification
```bash
# Vérifier les sessions
curl -b cookies.txt https://your-app.replit.app/api/auth/me
# Nettoyer les cookies
rm cookies.txt
```

#### 3. Erreurs de base de données
```bash
# Vérifier la connexion
psql $DATABASE_URL -c "SELECT 1;"
# Réinitialiser si nécessaire
npm run db:push
```

### Logs d'erreur
```bash
# Erreurs système
journalctl -u gesfinance -f

# Erreurs application
tail -f /var/log/gesfinance/error.log
```

## 🔧 Maintenance

### Mise à jour
```bash
# Sauvegarder la base de données
pg_dump $DATABASE_URL > backup.sql

# Mettre à jour le code
git pull origin main
npm run build
pm2 restart gesfinance

# Vérifier le déploiement
curl https://your-app.replit.app/health
```

### Sauvegarde
```bash
# Sauvegarde automatique quotidienne
crontab -e
0 2 * * * pg_dump $DATABASE_URL > /backups/gesfinance-$(date +%Y%m%d).sql
```

## 📞 Support

### Contact
- **Email :** support@gesfinance.app
- **Documentation :** https://docs.gesfinance.app
- **Issues :** https://github.com/gesfinance/issues

### Versions
- **Production :** 1.0.0
- **API :** v1
- **Base de données :** PostgreSQL 15+
- **Node.js :** 18+

## 📈 Métriques

### Performance attendue
- **Temps de chargement :** < 3s (3G)
- **Temps de réponse API :** < 500ms
- **Disponibilité :** 99.9%
- **Utilisation mémoire :** < 512MB

### Monitoring
```bash
# Utilisation ressources
htop
df -h
free -h

# Trafic réseau
netstat -tuln
ss -tuln
```

---

## 🚀 Déploiement Immédiat

Pour déployer immédiatement l'application :

1. **Cliquez sur "Deploy" dans Replit**
2. **Sélectionnez "Reserved VM"**
3. **L'application sera accessible sur votre domaine .replit.app**

L'application est **100% prête pour la production** avec :
- ✅ Optimisations mobiles complètes
- ✅ Compatibilité web universelle
- ✅ PWA avec installation
- ✅ Gestion des sessions sécurisée
- ✅ API complète et documentée
- ✅ Monitoring et health checks
- ✅ Système de cache intelligent
- ✅ Optimisations réseau 3G