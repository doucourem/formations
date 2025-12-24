# GesFinance - Gestionnaire de Transactions Financières

## 📋 Description

GesFinance est une application web complète de gestion de transactions financières spécialisée dans la conversion FCFA/GNF. Elle offre une interface admin/utilisateur avec notifications en temps réel, gestion des preuves de paiement, et archivage automatique.

## 🚀 Fonctionnalités

### Interface Admin
- **Gestion des transactions** : Validation/annulation des transactions
- **Gestion des utilisateurs** : Création et gestion des comptes
- **Rapports quotidiens** : Statistiques et analyses
- **Notifications temps réel** : Alertes sonores et visuelles
- **Archivage automatique** : Système d'archivage hebdomadaire

### Interface Utilisateur
- **Création de transactions** : Envoi FCFA avec conversion automatique GNF
- **Gestion des clients** : Carnet d'adresses intégré
- **Soumission de preuves** : Upload d'images ou saisie de texte
- **Historique complet** : Suivi des transactions et soldes
- **Notifications push** : Alertes sur mobile

### Fonctionnalités Techniques
- **PWA** : Application web progressive avec support offline
- **Responsive** : Optimisé pour mobile et desktop
- **Temps réel** : WebSocket pour notifications instantanées
- **Sécurité** : Authentification par sessions, validation des données
- **Performance** : Cache intelligent, optimisations réseau

## 🛠️ Technologies

### Frontend
- **React** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Wouter** (routing)
- **TanStack Query** (data fetching)
- **Radix UI** (components)

### Backend
- **Node.js** + Express
- **TypeScript**
- **PostgreSQL** (base de données)
- **Drizzle ORM** (ORM)
- **WebSocket** (temps réel)
- **Web Push** (notifications)

### DevOps
- **TSX** (TypeScript execution)
- **ESBuild** (bundling)
- **Compression** (optimisation)
- **CORS** (accès externe)

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- NPM ou Yarn

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/votre-username/gesfinance.git
cd gesfinance

# Installer les dépendances
npm install

# Configurer la base de données
export DATABASE_URL="postgresql://user:password@localhost:5432/gesfinance"

# Créer les tables
npm run db:push

# Lancer en développement
npm run dev
```

## 🔧 Configuration

### Variables d'environnement
```bash
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/gesfinance

# Session
SESSION_SECRET=your-session-secret

# Notifications Push (optionnel)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### Scripts disponibles
```bash
npm run dev        # Développement
npm run build      # Build production
npm run db:push    # Migrations base de données
npm run db:studio  # Interface Drizzle Studio
```

## 🚀 Déploiement

### Production avec TSX
```bash
# Build frontend
npm run build

# Démarrer serveur production
npx tsx server/production-simple.js
```

### Déploiement Replit
L'application est optimisée pour Replit avec :
- Configuration automatique des ports
- Scripts de démarrage intégrés
- Support Reserved VM

## 📊 Architecture

### Structure des fichiers
```
gesfinance/
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
├── server/          # Backend Node.js
│   ├── routes.ts
│   ├── storage.ts
│   └── db.ts
├── shared/          # Types partagés
│   └── schema.ts
└── public/          # Assets statiques
```

### Base de données
- **users** : Comptes utilisateurs (admin/user)
- **clients** : Carnet d'adresses par utilisateur
- **transactions** : Transactions FCFA/GNF
- **payments** : Preuves de paiement
- **notifications** : Système de notifications

## 🔒 Sécurité

- Authentification par sessions
- Validation des données avec Zod
- Protection CSRF
- Sanitisation des entrées
- Gestion des permissions par rôles

## 📱 Mobile & PWA

- Service Worker pour offline
- Notifications push natives
- Interface tactile optimisée
- Responsive design complet
- Installation sur écran d'accueil

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développement** : Équipe GesFinance
- **Design** : Interface utilisateur moderne
- **Support** : Documentation complète

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Vérifier les logs d'erreur

## 🔄 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions.

---

**GesFinance** - Gestionnaire de transactions financières moderne et sécurisé 🚀