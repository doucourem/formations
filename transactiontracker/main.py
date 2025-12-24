#!/usr/bin/env python3
"""
GesFinance - Démarrage de production
Lance le serveur Node.js via Python pour compatibilité Replit
"""

import subprocess
import sys
import os

def main():
    print("🚀 GesFinance - Démarrage de production")
    print("=" * 50)
    
    # Vérifier Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js version: {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ Node.js non trouvé")
        sys.exit(1)
    
    # Aller dans le répertoire dist
    os.chdir("dist")
    print(f"📁 Répertoire: {os.getcwd()}")
    
    # Lister les fichiers
    files = os.listdir(".")
    print(f"📄 Fichiers: {files}")
    
    # Démarrer le serveur
    print("🔄 Démarrage du serveur GesFinance...")
    try:
        subprocess.run(["node", "server-simple.js"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du démarrage: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Arrêt du serveur")
        sys.exit(0)

if __name__ == "__main__":
    main()