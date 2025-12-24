#!/usr/bin/env python3

import json
import subprocess
import sys

# Récupérer les données via curl
result = subprocess.run([
    'curl', '-s', '-X', 'GET', 'http://localhost:5000/api/transactions',
    '-H', 'Content-Type: application/json',
    '-b', 'cookies_test.txt'
], capture_output=True, text=True)

if result.returncode != 0:
    print("Erreur lors de la récupération des données")
    sys.exit(1)

try:
    data = json.loads(result.stdout)
    transactions = data.get('transactions', [])
    
    # Analyser les transactions du 15 juillet
    transactions_15 = []
    for t in transactions:
        if t['createdAt'].startswith('2025-07-15'):
            transactions_15.append({
                'id': t['id'],
                'feeAmount': float(t['feeAmount'] or 0),
                'isDeleted': t['isDeleted'],
                'createdAt': t['createdAt']
            })
    
    print(f"🔍 Analyse des transactions du 15 juillet 2025:")
    print(f"Total transactions trouvées: {len(transactions_15)}")
    print()
    
    active_fees = 0
    deleted_fees = 0
    
    for t in transactions_15:
        status = "SUPPRIMÉE" if t['isDeleted'] else "ACTIVE"
        print(f"ID: {t['id']}, Frais: {t['feeAmount']:.0f} FCFA, Statut: {status}")
        
        if t['isDeleted']:
            deleted_fees += t['feeAmount']
        else:
            active_fees += t['feeAmount']
    
    print()
    print(f"💰 Résumé des frais:")
    print(f"Frais transactions actives: {active_fees:.0f} FCFA")
    print(f"Frais transactions supprimées: {deleted_fees:.0f} FCFA")
    print(f"Total frais (toutes): {active_fees + deleted_fees:.0f} FCFA")
    print()
    
    if active_fees == 1980:
        print("✅ Le calcul est correct - seules les transactions actives doivent être comptées")
    else:
        print(f"❌ Problème détecté - attendu: 1980 FCFA, trouvé: {active_fees:.0f} FCFA")
        
except json.JSONDecodeError as e:
    print(f"Erreur de parsing JSON: {e}")
    print("Sortie brute:")
    print(result.stdout[:1000])