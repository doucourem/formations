# CAHIER DES CHARGES COMPLET - APPLICATION GESFINANCE
## DOCUMENTATION TECHNIQUE COMPLÈTE ET MISE À JOUR - JANVIER 2025

## 1. PRÉSENTATION GÉNÉRALE

### 1.1 Objectif du Projet
GesFinance est une plateforme complète de gestion de transactions financières spécialisée dans les transferts multi-devises (FCFA/GNF) avec un système intégré de suivi des dettes, validation administrative et notifications en temps réel. L'application est optimisée pour les connexions 3G en Afrique de l'Ouest.

### 1.2 Contexte d'Utilisation
- **Domaine** : Services financiers et transferts d'argent
- **Public cible** : Agents de transfert et administrateurs de plateformes financières
- **Zone géographique** : Afrique de l'Ouest (Mali-Guinée-Conakry)
- **Devises gérées** : FCFA (Franc CFA) et GNF (Franc Guinéen)
- **Optimisation réseau** : Spécialement conçu pour connexions 3G lentes

### 1.3 Valeur Ajoutée Distinctive
- **Interface mobile-first** : Optimisation tactile complète pour smartphones
- **Conversion automatique** : FCFA/GNF avec taux de change dynamique
- **Frais personnalisés** : Pourcentage individuel par utilisateur (ex: Orange 9%)
- **Seuils de dette intelligents** : Gestion personnalisée par utilisateur
- **Notifications triple** : WebSocket + Push + Audio en temps réel
- **Sélection clients révolutionnaire** : Système par lettre sans scroll
- **Optimisation 3G** : Cache intelligent et intervalles adaptés aux connexions lentes
- **Interface professionnelle** : Formulaires compacts et résumés organisés

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack Technologique

#### Frontend
- **Framework** : React 18.3.1 avec TypeScript
- **Build Tool** : Vite 5.4.14
- **Styling** : Tailwind CSS 3.4.17 + shadcn/ui
- **Routing** : Wouter 3.3.5
- **State Management** : TanStack React Query 5.60.5
- **Gestion de formulaires** : React Hook Form 7.55.0 + Zod 3.24.2
- **Animations** : Framer Motion 11.13.1
- **Graphiques** : Recharts 2.15.2
- **PWA** : Service Worker + Manifest

#### Backend
- **Runtime** : Node.js 20.16.11 avec TypeScript
- **Framework** : Express.js 4.21.2
- **Base de données** : PostgreSQL avec Drizzle ORM 0.39.1
- **Authentification** : Passport.js + Express-session
- **WebSockets** : ws 8.18.0
- **Compression** : compression 1.8.0
- **Notifications Push** : web-push 3.6.7
- **Planification** : node-cron 4.1.0

#### Base de Données
- **SGBD** : PostgreSQL
- **ORM** : Drizzle ORM avec migrations automatiques
- **Provider** : Neon Database (cloud PostgreSQL)

### 2.2 Architecture Déployée
- **Hébergement** : Replit (développement et production)
- **Base de données** : Neon PostgreSQL Cloud
- **Assets** : Stockage local avec archivage automatique
- **Domaine** : `.replit.app` avec support HTTPS automatique

---

## 3. FONCTIONNALITÉS DÉTAILLÉES

### 3.1 Système d'Authentification et Autorisation

#### 3.1.1 Connexion Utilisateur
- **Méthode** : Username/Password (session-based)
- **Sécurité** : Sessions Express avec MemoryStore
- **Rôles** : Administrateur (`admin`) et Utilisateur (`user`)
- **Persistance** : LocalStorage pour maintien de session mobile
- **Auto-reconnexion** : Système automatique pour stabilité mobile

#### 3.1.2 Gestion des Sessions
- **Durée** : Sessions persistantes avec renouvellement automatique
- **Sécurité** : Tokens de session sécurisés, CORS configuré
- **Multi-device** : Support simultané ordinateur/mobile
- **Déconnexion** : Invalidation complète côté serveur et client

### 3.2 Interface Utilisateur (User)

#### 3.2.1 Tableau de Bord Principal
- **Vue d'ensemble** : Résumé financier personnel
  - Montant total envoyé (FCFA)
  - Montant total payé (FCFA) 
  - Dette actuelle vs seuil autorisé
  - Crédit restant disponible
- **Indicateurs visuels** : Graphiques et barres de progression
- **Actualisation** : Données en temps réel via WebSocket

#### 3.2.2 Création de Transactions (INTERFACE RÉVOLUTIONNAIRE)

##### **Formulaire Professionnel Optimisé**
- **Layout compact** : Numéro et montant côte à côte (responsive grid)
- **Sélection client révolutionnaire** : 
  - Système de recherche par lettre unique (ex: tapez "M" → voir tous les clients commençant par M)
  - PLUS DE PROBLÈME DE SCROLL : Grille tactile sans défilement problématique
  - Boutons clients optimisés : Taille 64px, active:scale-98, touch-manipulation
  - Compatible Android/iOS : WebkitOverflowScrolling: 'touch'
  - Sélection visuelle avec icônes et couleurs

##### **Résumé Transaction Réorganisé**
- **Progression logique avec codes couleur** :
  1. **Montant envoyé** (fond blanc) : Montant de base FCFA
  2. **Conversion** (fond bleu) : Montant en GNF avec taux affiché
  3. **Frais personnalisés** (fond orange) : Pourcentage individuel (ex: 9% pour Orange)
  4. **Total dette** (fond rouge) : Montant final à payer

##### **Contrôles de Validation Avancés**
- **Vérification seuil personnel** : Chaque utilisateur a son propre seuil (ex: 3,000,000 FCFA)
- **Validation solde admin** : Vérification fonds disponibles en GNF
- **Contrôles format** : Validation numéro téléphone, montants
- **Logique DEPOT BAMAKO** : Transactions spéciales qui n'impactent pas le solde admin

#### 3.2.3 Gestion des Clients
- **CRUD complet** : Créer, lire, modifier, supprimer
- **Liste personnelle** : Chaque utilisateur gère ses propres clients
- **Recherche** : Filtrage par nom
- **Historique** : Transactions associées à chaque client
- **Protection** : Impossible de supprimer un client avec transactions

#### 3.2.4 Historique des Transactions
- **Vue chronologique** : Toutes les transactions de l'utilisateur
- **Filtres avancés** :
  - Par statut (pending, seen, validated, cancelled)
  - Par période (jour, semaine, mois)
  - Par client
  - Par montant
- **Détails complets** : Toutes les informations par transaction
- **Soumission de preuves** : Upload d'images ou saisie de texte

#### 3.2.5 Transactions Validées
- **Vue spécialisée** : Transactions approuvées par l'admin
- **Preuves archivées** : Gestion automatique des preuves anciennes
- **Statistiques** : Compteurs et totaux
- **Export** : Possibilité d'extraction de données

#### 3.2.6 Rapports Personnels
- **Rapports quotidiens** : Synthèse par jour
  - Transactions créées
  - Montants totaux
  - Dette évolution
  - Statut des paiements
- **Historique de dette** : Évolution dans le temps
- **Analyses** : Tendances et patterns
- **Téléchargement** : Export PDF/Excel (futur)

### 3.3 Interface Administrateur (Admin)

#### 3.3.1 Tableau de Bord Global
- **Vue d'ensemble système** :
  - Nombre total d'utilisateurs actifs
  - Transactions en attente de validation
  - Solde principal GNF
  - Dette globale du système
  - Transactions du jour

- **Statistiques en temps réel** :
  - Graphiques de performance
  - Évolution des volumes
  - Répartition par utilisateur
  - Alertes et notifications

#### 3.3.2 Gestion des Utilisateurs
- **CRUD utilisateurs** :
  - Création de nouveaux comptes
  - Modification des informations
  - Activation/Désactivation des comptes
  - Gestion des rôles

- **Configuration personnalisée** :
  - Seuil de dette individuel (FCFA)
  - Pourcentage de frais personnel
  - Statut actif/bloqué
  - Historique des modifications

#### 3.3.3 Validation des Transactions
- **File d'attente** : Transactions en attente
- **Validation groupée** : Traitement multiple
- **Détails enrichis** :
  - Informations complètes utilisateur
  - Preuves de paiement soumises
  - Historique des statuts
  - Recommandations automatiques

- **Actions disponibles** :
  - Valider (approved)
  - Marquer comme vue (seen)
  - Annuler (cancelled)
  - Demander complément

#### 3.3.4 Gestion du Solde Principal
- **Solde GNF** : Fonds disponibles pour les envois
- **Opérations** :
  - Ajout de fonds
  - Retrait de fonds
  - Historique des mouvements
  - Réconciliation comptable

- **Sécurité** :
  - Validation à double niveau
  - Traçabilité complète
  - Alertes de seuil minimum
  - Backup automatique

#### 3.3.5 Configuration Système
- **Taux de change FCFA/GNF** :
  - Mise à jour manuelle
  - Historique des taux
  - Impact sur transactions futures
  - Validation automatique

- **Paramètres globaux** :
  - Frais par défaut
  - Seuils d'alerte
  - Délais d'expiration
  - Règles de validation

#### 3.3.6 Gestion des Paiements
- **Validation manuelle** : Traitement des preuves
- **Rapprochement** : Correspondance avec transactions
- **Suivi des paiements** : États détaillés
- **Historique** : Tous les paiements traités

#### 3.3.7 Annulation de Transactions
- **Critères automatiques** :
  - Pending > 7 jours
  - Seen > 3 jours
  - Proof_submitted > 2 jours
- **Validation administrative** requise
- **Notification automatique** aux utilisateurs
- **Traçabilité complète** des annulations

#### 3.3.8 Rapports Administrateur
- **Rapports globaux** : Performance système
- **Rapports utilisateur** : Détail par agent
- **Analyses financières** : Volumes, marges, dettes
- **Export** : Données comptables et réglementaires

### 3.4 Système de Notifications (TRIPLE ALERTE ULTRA-COMPLET)

#### 3.4.1 Notifications WebSocket Temps Réel
- **Connexion permanente** : WebSocket maintenu en continu
- **Événements typés** : 
  - `TRANSACTION_CREATED` : Nouvelle transaction soumise
  - `TRANSACTION_VALIDATED` : Transaction approuvée
  - `TRANSACTION_DELETED` : Transaction supprimée
  - `BALANCE_UPDATED` : Solde principal modifié
  - `REFRESH_STATS` : Actualisation des statistiques

#### 3.4.2 Alertes Visuelles et Sonores Admin
- **Triple système d'alerte** pour nouvelles transactions :
  1. **Bannière rouge** : "🚨 NOUVELLE TRANSACTION REÇUE 🚨" (8 secondes)
  2. **Flash écran rouge** : Écran entier clignote (1.5 secondes)
  3. **Son d'alerte** : Bip automatique (0.3s) avec Web Audio API

- **Badge compteur dynamique** : 
  - Mise à jour instantanée via WebSocket
  - Affichage nombre exact de transactions en attente
  - Synchronisation parfaite badge vs interface

#### 3.4.3 Push Notifications Persistantes
- **Service Worker intégré** : Notifications même application fermée
- **Clés VAPID configurées** : web-push avec authentification
- **Gestion clics intelligente** : Redirection vers transaction concernée
- **Notifications automatiques** :
  - Création de transaction (pour admin)
  - Validation de transaction (pour utilisateur)
  - Annulation automatique (selon critères temps)

#### 3.4.4 Optimisation Réseau 3G
- **Intervalles adaptés connexions lentes** :
  - Admin : Notifications toutes les 2 minutes (au lieu de 3s)
  - Utilisateur : Vérifications toutes les 5 minutes
  - Debt Status : Contrôle toutes les 30 secondes
- **Cache intelligent** : 1-2 minutes staleTime, 2-3 minutes gcTime
- **Bouton actualisation manuel** : Force refresh à la demande

### 3.5 Interface Mobile Optimisée (RÉVOLUTION TACTILE)

#### 3.5.1 Optimisations Tactiles Complètes
- **Touch-optimized components** :
  - `touch-manipulation` et `touchAction` sur tous boutons
  - Taille minimale 44px pour compatibilité iOS/Android
  - `active:scale-98` pour feedback visuel tactile
  - `WebkitOverflowScrolling: 'touch'` pour scroll fluide

#### 3.5.2 Responsive Design Cross-Browser
- **Breakpoints optimisés** :
  - XS (320px) : Smartphones compacts
  - SM (640px) : Smartphones standards
  - MD (768px) : Tablettes portrait
  - LG (1024px) : Desktop/tablettes landscape
  - XL (1280px+) : Écrans larges

- **Compatibilité navigateurs** :
  - Chrome/Edge : Support complet
  - Firefox : Préfixes `-moz-` spécialisés
  - Safari iOS : Optimisations WebKit
  - Android Browser : Propriétés tactiles

#### 3.5.3 Interface Compacte Professionnelle
- **Formulaires optimisés** :
  - Champs côte à côte en responsive grid
  - Hauteur standardisée 48px minimum
  - Espacement réduit pour écrans mobiles
  - Boutons dégradés avec feedback visuel

- **Cards et résumés** :
  - Layout en grid adaptatif
  - Codes couleur cohérents
  - Progression logique de l'information
  - Icônes et badges informatifs

#### 3.5.4 Bouton Actualisation Ultra-Optimisé
- **Rafraîchissement complet** :
  - `QueryClient.clear()` + `invalidateQueries`
  - Différenciation user/admin selon rôle
  - Animation rotation + couleur verte
  - Toast confirmation et logs diagnostiques

#### 3.5.5 Icônes et Feedback Visuels
- **Icônes adaptatives** :
  - Tailles différenciées mobile/desktop
  - Admin : 3×3 à 6×6 pixels selon contexte
  - User : 4×4 à 5×5 pixels optimisés
  - Espacement gap-1 au lieu de gap-2

- **États persistants** :
  - Icônes copie restent vertes après déconnexion
  - LocalStorage par utilisateur (copiedProofs_userId)
  - Numérotation transactions conservée
  - Soulignement montants/téléphones

### 3.6 Systèmes Avancés et Logiques Métier

#### 3.6.1 Système de Soft Delete (Audit Trail)
- **Suppression douce** : Transactions marquées `isDeleted=true` au lieu d'être supprimées
- **Traçabilité complète** :
  - `deletedAt` : Date/heure de suppression
  - `deletedBy` : ID de l'utilisateur/admin qui a supprimé
  - Historique conservé pour audit
- **Affichage interface** : Badge "🗑️ SUPPRIMÉE" avec fond rouge et opacité réduite

#### 3.6.2 Gestion Intelligente des Frais
- **Frais personnalisés par utilisateur** :
  - Orange : 9% (au lieu de 10% global)
  - Configuration individuelle via interface admin
  - Trigger PostgreSQL automatique pour nouvelles transactions
- **Calcul dynamique** : Modification pourcentage → impact immédiat
- **Affichage utilisateur** : Carte "Total des Frais" dans historique avec détail

#### 3.6.3 Logique DEPOT BAMAKO Spéciale
- **Business Rule** : Transactions client "DEPOT BAMAKO" ne déduisent PAS le solde admin
- **Visibilité complète** : Apparaissent dans historique et rapports utilisateur
- **Calcul frais normal** : Frais calculés normalement pour comptabilité utilisateur
- **Protection spéciale** : Suppression DEPOT BAMAKO ne restaure pas solde admin

#### 3.6.4 Système de Numérotation et Partage
- **Numérotation chronologique par jour** : Transactions numérotées 1, 2, 3... selon heure
- **Format intelligent avec soulignement** :
  - Aujourd'hui : "#1 • 14:30 • 612345678 • 50,000 FCFA"
  - Numéros téléphone soulignés orange, montants soulignés vert
- **Partage WhatsApp groupé** : Toutes les preuves d'un client en un message
- **États persistants** : Icônes de copie vertes conservées après déconnexion

#### 3.4.2 Push Notifications (Mobile)
- **Service Worker** : Fonctionnement en arrière-plan
- **Support multi-navigateur** : Chrome, Firefox, Safari
- **Types de notifications** :
  - Transactions importantes
  - Alertes critiques
  - Rappels d'action
  - Confirmations

#### 3.4.3 Notifications Audio
- **Son d'alerte** : Fichier MP3 intégré
- **Déclencheurs** :
  - Nouvelles transactions (admin)
  - Validation confirmée (user)
  - Alertes importantes
- **Contrôle** : Activation/désactivation par utilisateur

### 3.5 Système Financier

#### 3.5.1 Gestion Multi-Devises
- **Conversion automatique** : FCFA → GNF
- **Taux de change** : Configurable par admin
- **Historique des taux** : Traçabilité des conversions
- **Validation** : Contrôle des montants convertis

#### 3.5.2 Système de Frais Personnalisés
- **Configuration individuelle** : % par utilisateur
- **Calcul automatique** : Intégré aux transactions
- **Transparence** : Affichage détaillé pour l'utilisateur
- **Flexibilité** : Modification possible par admin

#### 3.5.3 Gestion des Dettes
- **Seuil personnel** : Limite configurable par utilisateur
- **Calcul dynamique** : Mise à jour en temps réel
- **Blocage automatique** : Empêche les envois en cas de dépassement
- **Suivi historique** : Évolution de la dette dans le temps

#### 3.5.4 Contrôles Financiers
- **Validation du solde** : Vérification avant transaction
- **Prévention du découvert** : Impossible de dépasser le solde
- **Réconciliation** : Équilibre des comptes automatique
- **Audit** : Traçabilité complète des opérations

### 3.6 Gestion des Preuves de Paiement

#### 3.6.1 Types de Preuves Acceptées
- **Images** : JPG, PNG, WebP (upload direct)
- **Texte** : Références, codes de transaction
- **URLs externes** : Liens vers preuves hébergées
- **Métadonnées** : Date, heure, taille

#### 3.6.2 Stockage et Archivage
- **Stockage local** : Répertoire `/public/uploads/`
- **Organisation** : Par date et utilisateur
- **Archivage automatique** : Transactions validées > 7 jours
- **Compression** : Optimisation de l'espace
- **Backup** : Sauvegarde régulière

#### 3.6.3 Sécurité des Preuves
- **Validation du format** : Contrôle des types de fichiers
- **Limitation de taille** : Maximum par fichier
- **Nettoyage automatique** : Suppression des fichiers anciens
- **Accès contrôlé** : Visible uniquement par propriétaire et admin

---

## 4. INTERFACE MOBILE ET PWA

### 4.1 Design Mobile-First
- **Responsive** : Adaptation automatique tous écrans
- **Touch-optimized** : Zones de contact optimisées (44px minimum)
- **Performance** : Chargement rapide sur réseaux lents
- **Offline** : Fonctionnement basique hors ligne

### 4.2 Progressive Web App (PWA)
- **Installable** : Ajout à l'écran d'accueil
- **Service Worker** : Cache intelligent et notifications
- **Manifest** : Configuration PWA complète
- **App Shell** : Interface persistante

### 4.3 Navigation Mobile Spécialisée
- **Navigation inférieure** : Accès rapide aux fonctions principales
- **Header mobile** : Titre et bouton d'actualisation
- **Badges** : Compteurs en temps réel
- **Feedback visuel** : Animations et transitions

### 4.4 Fonctionnalités Mobile Spécifiques
- **Actualisation complète** : Bouton pour vider cache et recharger
- **Détection de réseau** : Adaptation selon connexion
- **Optimisation batterie** : Gestion intelligente des ressources
- **Géolocalisation** : Prêt pour fonctionnalités futures

---

## 5. PERFORMANCE ET OPTIMISATION

### 5.1 Optimisations Frontend
- **Code splitting** : Chargement lazy des pages
- **Mise en cache** : TanStack Query avec cache intelligent
- **Compression** : Gzip/Brotli automatique
- **Bundle optimization** : Tree-shaking et minification

### 5.2 Optimisations Backend
- **Compression des réponses** : Toutes les API
- **Cache serveur** : Données fréquemment demandées
- **Requêtes optimisées** : SQL efficace et indexation
- **Limitation de débit** : Protection contre les abus

### 5.3 Optimisations Base de Données
- **Index stratégiques** : Performances des requêtes
- **Pagination** : Éviter les requêtes lourdes
- **Pooling de connexions** : Réutilisation des connexions
- **Nettoyage automatique** : Suppression des données anciennes

### 5.4 Monitoring et Observabilité
- **Logs détaillés** : Traçabilité complète
- **Métriques de performance** : Temps de réponse
- **Alertes automatiques** : Problèmes critiques
- **Health checks** : Surveillance continue

---

## 6. SÉCURITÉ

### 6.1 Authentification et Autorisation
- **Sessions sécurisées** : Tokens cryptés
- **RBAC** : Contrôle d'accès basé sur les rôles
- **Protection CSRF** : Tokens de validation
- **Expiration automatique** : Sessions temporaires

### 6.2 Sécurité des Données
- **Validation stricte** : Zod schemas côté client et serveur
- **Échappement** : Prévention des injections
- **Chiffrement** : Communications HTTPS obligatoires
- **Anonymisation** : Pas de données sensibles en logs

### 6.3 Sécurité Infrastructure
- **CORS configuré** : Origines autorisées uniquement
- **Headers de sécurité** : Protection navigateur
- **Rate limiting** : Protection contre les attaques
- **Monitoring** : Détection d'activités suspectes

### 6.4 Protection des Données Financières
- **Isolation** : Données par utilisateur séparées
- **Audit trail** : Traçabilité des modifications
- **Backup régulier** : Sauvegarde des données critiques
- **Accès minimal** : Principe du moindre privilège

---

## 7. DÉPLOIEMENT ET INFRASTRUCTURE

### 7.1 Environnement de Production
- **Plateforme** : Replit avec VM réservée
- **Base de données** : Neon PostgreSQL (cloud)
- **Domaine** : `.replit.app` avec HTTPS automatique
- **Stockage** : Local avec archivage

### 7.2 Configuration Déploiement
- **Variables d'environnement** : Configuration sécurisée
- **Scripts de build** : Automatisation complète
- **Health checks** : Vérification automatique
- **Rollback** : Retour en arrière possible

### 7.3 Monitoring Production
- **Logs centralisés** : Agrégation des événements
- **Métriques** : Performance et utilisation
- **Alertes** : Notification des problèmes
- **Backup** : Sauvegarde automatique quotidienne

---

## 8. ÉVOLUTIVITÉ ET MAINTENANCE

### 8.1 Architecture Évolutive
- **Modulaire** : Composants indépendants
- **API-first** : Séparation frontend/backend
- **Configuration** : Paramètres externalisés
- **Extensions** : Hooks pour nouvelles fonctionnalités

### 8.2 Maintenance
- **Documentation** : Code et API documentés
- **Tests** : Couverture des fonctions critiques
- **Versions** : Gestion des releases
- **Support** : Procédures de dépannage

### 8.3 Améliorations Futures Prêtes
- **Multi-langues** : Structure i18n préparée
- **Nouvelles devises** : Système extensible
- **API externes** : Intégration prête
- **Analytics** : Données prêtes pour BI

---

## 9. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES

### 9.1 APIs Disponibles

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/me` - Vérification session
- `POST /api/auth/logout` - Déconnexion

#### Utilisateurs (Admin)
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Création utilisateur
- `PUT /api/users/:id` - Modification utilisateur
- `DELETE /api/users/:id` - Suppression utilisateur

#### Transactions
- `GET /api/transactions` - Liste des transactions
- `POST /api/transactions` - Création transaction
- `PUT /api/transactions/:id` - Modification transaction
- `GET /api/transactions/pending` - Transactions en attente
- `GET /api/transactions/validated` - Transactions validées
- `GET /api/transactions/cancellation-candidates` - Transactions à annuler

#### Clients
- `GET /api/clients` - Liste des clients
- `POST /api/clients` - Création client
- `PUT /api/clients/:id` - Modification client
- `DELETE /api/clients/:id` - Suppression client

#### Système
- `GET /api/system/settings` - Configuration système
- `PUT /api/system/settings` - Modification configuration
- `GET /api/stats/daily` - Statistiques quotidiennes
- `GET /api/stats/users` - Statistiques utilisateurs
- `GET /api/stats/pending-count` - Compteur transactions en attente
- `GET /api/stats/cancellation-count` - Compteur annulations

#### Notifications
- `POST /api/notifications/subscribe` - Abonnement push
- `POST /api/notifications/unsubscribe` - Désabonnement push

### 9.2 Schéma Base de Données

#### Table: users
```sql
- id: serial PRIMARY KEY
- first_name: varchar(100) NOT NULL
- last_name: varchar(100) NOT NULL
- username: varchar(50) UNIQUE NOT NULL
- password: varchar(255) NOT NULL
- role: varchar(20) DEFAULT 'user'
- is_active: boolean DEFAULT true
- personal_debt_threshold_fcfa: decimal(15,2) DEFAULT 100000.00
- personal_fee_percentage: decimal(5,2) DEFAULT 10.00
- created_at: timestamp DEFAULT NOW()
```

#### Table: clients
```sql
- id: serial PRIMARY KEY
- name: varchar(100) NOT NULL
- user_id: integer REFERENCES users(id)
- created_at: timestamp DEFAULT NOW()
```

#### Table: transactions
```sql
- id: serial PRIMARY KEY
- user_id: integer REFERENCES users(id)
- client_id: integer REFERENCES clients(id)
- phone_number: varchar(20) NOT NULL
- amount_fcfa: decimal(15,2) NOT NULL
- amount_gnf: decimal(15,2) NOT NULL
- amount_to_pay: decimal(15,2) NOT NULL
- fee_amount: decimal(15,2) NOT NULL
- fee_percentage: decimal(5,2) NOT NULL
- exchange_rate: decimal(10,4) NOT NULL
- status: varchar(20) DEFAULT 'pending'
- proof_text: text
- proof_url: varchar(500)
- external_proof_url: varchar(500)
- is_archived: boolean DEFAULT false
- is_deleted: boolean DEFAULT false
- created_at: timestamp DEFAULT NOW()
- updated_at: timestamp DEFAULT NOW()
```

#### Table: payments
```sql
- id: serial PRIMARY KEY
- transaction_id: integer REFERENCES transactions(id)
- amount_paid: decimal(15,2) NOT NULL
- payment_date: timestamp DEFAULT NOW()
- proof_text: text
- proof_url: varchar(500)
- is_validated: boolean DEFAULT false
- created_at: timestamp DEFAULT NOW()
```

#### Table: system_settings
```sql
- id: serial PRIMARY KEY
- exchange_rate: decimal(10,4) NOT NULL
- main_balance_gnf: decimal(20,2) NOT NULL
- fee_percentage: decimal(5,2) DEFAULT 10.00
- updated_at: timestamp DEFAULT NOW()
```

#### Table: notifications
```sql
- id: serial PRIMARY KEY
- user_id: integer REFERENCES users(id)
- title: varchar(200) NOT NULL
- message: text NOT NULL
- type: varchar(50) NOT NULL
- is_read: boolean DEFAULT false
- created_at: timestamp DEFAULT NOW()
```

### 9.3 Statuts des Transactions
- **pending** : Créée, en attente de traitement
- **seen** : Vue par l'admin, en cours de vérification
- **proof_submitted** : Preuve de paiement soumise
- **validated** : Validée et approuvée par l'admin
- **cancelled** : Annulée (expiration ou problème)

### 9.4 Types de Notifications
- **transaction_status** : Changement de statut
- **payment_request** : Demande de paiement
- **debt_warning** : Alerte de dette
- **system_alert** : Alerte système
- **admin_notification** : Notification administrative

---

## 10. GUIDE D'UTILISATION

### 10.1 Pour les Utilisateurs

#### Première Connexion
1. Recevoir les identifiants de l'administrateur
2. Se connecter via `/login`
3. Découvrir le tableau de bord
4. Configurer les notifications (optionnel)

#### Créer une Transaction
1. Aller dans l'onglet "Nouvelle Transaction"
2. Sélectionner ou créer un client
3. Saisir le numéro de téléphone du bénéficiaire
4. Entrer le montant en FCFA
5. Vérifier la conversion et les frais
6. Valider la création

#### Gérer ses Clients
1. Onglet "Mes Clients"
2. Ajouter un nouveau client
3. Modifier les informations
4. Voir l'historique des transactions

#### Suivre ses Transactions
1. "Historique" pour toutes les transactions
2. "Validées" pour les transactions approuvées
3. Soumettre des preuves de paiement si demandé
4. Consulter les détails de chaque transaction

### 10.2 Pour les Administrateurs

#### Gestion Quotidienne
1. Consulter le tableau de bord
2. Traiter les transactions en attente
3. Valider les preuves de paiement
4. Surveiller les alertes

#### Configuration Système
1. Onglet "Configuration" → "Taux de Change"
2. Modifier le taux FCFA/GNF
3. Ajuster le solde principal
4. Configurer les paramètres globaux

#### Gestion des Utilisateurs
1. Onglet "Utilisateurs"
2. Créer de nouveaux comptes
3. Modifier les seuils de dette
4. Ajuster les pourcentages de frais
5. Activer/Désactiver des comptes

---

## 11. SUPPORT ET MAINTENANCE

### 11.1 Documentation Technique
- **Code source** : Commenté et structuré
- **API** : Documentation des endpoints
- **Base de données** : Schéma et relations
- **Déploiement** : Procédures détaillées

### 11.2 Procédures de Dépannage
- **Logs système** : Localisation et interprétation
- **Base de données** : Requêtes de diagnostic
- **Performance** : Outils de monitoring
- **Sécurité** : Détection d'incidents

### 11.3 Évolutions Prévues
- **Export de données** : PDF, Excel
- **API mobile native** : Applications iOS/Android
- **Intégrations** : Services de paiement externes
- **Analytics** : Tableaux de bord avancés
- **Multi-langues** : Support français/anglais complet

---

## 12. CONCLUSION

GesFinance représente une solution complète et robuste pour la gestion de transactions financières multi-devises. Son architecture moderne, sa sécurité renforcée et son interface optimisée pour mobile en font un outil adapté aux besoins actuels du secteur financier en Afrique de l'Ouest.

La plateforme est conçue pour évoluer et s'adapter aux nouveaux besoins, avec une base technique solide permettant l'ajout de nouvelles fonctionnalités sans comprometre la stabilité existante.

L'accent mis sur l'expérience utilisateur, tant sur desktop que mobile, assure une adoption facile et une utilisation efficace par tous les types d'utilisateurs, des agents de terrain aux administrateurs système.

---

**Version du document** : 1.0  
**Date de création** : 19 juillet 2025  
**Dernière mise à jour** : 19 juillet 2025  
**Statut** : Document complet et à jour