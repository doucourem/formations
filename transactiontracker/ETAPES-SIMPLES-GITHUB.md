# 🚀 Étapes Simples pour GitHub

## ✅ Étape 1 : Créer le dépôt sur GitHub
1. Aller sur https://github.com
2. Cliquer "New repository"
3. Nom : `gesfinance`
4. Cliquer "Create repository"

## ✅ Étape 2 : Commandes à taper une par une

### Commande 1 : Ajouter les fichiers
```bash
git add .
```
**Résultat attendu :** Aucun message (c'est normal !)

### Commande 2 : Créer le commit
```bash
git commit -m "Initial commit: GesFinance"
```
**Résultat attendu :** Message avec "XX files changed"

### Commande 3 : Connecter à GitHub
```bash
git remote add origin https://github.com/VOTRE-USERNAME/gesfinance.git
```
**Résultat attendu :** Aucun message (c'est normal !)

### Commande 4 : Publier sur GitHub
```bash
git push -u origin main
```
**Résultat attendu :** Upload des fichiers vers GitHub

## 🔧 Si problème avec git commit

Si `git commit` ne marche pas, tapez d'abord :
```bash
git config --global user.email "votre@email.com"
git config --global user.name "Votre Nom"
```

Puis refaites :
```bash
git commit -m "Initial commit: GesFinance"
```

## 📝 Dites-moi ce qui s'affiche après chaque commande !