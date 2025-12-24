# 🚀 Commandes à Exécuter pour Publier sur GitHub

## ✅ Étape 1 : Créer le dépôt GitHub (sur le site web)
1. Aller sur https://github.com
2. Cliquer sur le bouton vert "New repository"
3. Nom : `gesfinance`
4. Description : `Gestionnaire de transactions financières FCFA/GNF`
5. Cliquer "Create repository"

## ✅ Étape 2 : Exécuter ces commandes dans le terminal

### Copier et coller chaque commande une par une :

```bash
# 1. Ajouter tous les fichiers
git add .
```

```bash
# 2. Créer le commit initial
git commit -m "Initial commit: GesFinance - Application complète"
```

```bash
# 3. Connecter au dépôt GitHub (REMPLACER par votre URL)
git remote add origin https://github.com/VOTRE-USERNAME/gesfinance.git
```

```bash
# 4. Publier sur GitHub
git push -u origin main
```

## 🔧 Si vous avez une erreur d'authentification :

### Option A : Utiliser un Personal Access Token
1. Aller sur GitHub → Settings → Developer settings → Personal access tokens
2. Créer un nouveau token avec permission "repo"
3. Copier le token
4. Quand Git demande le mot de passe, coller le token

### Option B : Utiliser votre mot de passe GitHub
- Username : votre nom d'utilisateur GitHub
- Password : votre mot de passe GitHub

## ✅ Vérifier que ça marche :
1. Aller sur votre dépôt GitHub
2. Actualiser la page
3. Vous devriez voir tous vos fichiers

## 📝 Commandes pour les futures modifications :

```bash
# Après avoir modifié du code
git add .
git commit -m "Description des changements"
git push
```

---

**Suivez ces étapes dans l'ordre et votre code sera publié sur GitHub !**