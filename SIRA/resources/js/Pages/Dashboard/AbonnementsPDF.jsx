import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFDownloadLink,
} from '@react-pdf/renderer';


const servicesAddons = [
  {
    service: "WhatsApp Bot Automatisé",
    tarif: "5 000 FCFA / mois",
    tag: "Recommandé",
    category: "Automatisation & IA",
    description:
      "Réservations automatiques, confirmation instantanée, génération du billet PDF + QR Code, suivi du statut de paiement et rappel avant le départ.",
  },
  {
    service: "Support prioritaire 24/7",
    tarif: "Inclus avec Enterprise",
    tag: "Inclus",
    category: "Support & Assistance",
    description:
      "Accès direct à l’équipe Mali Billet : résolution rapide WhatsApp, téléphone et email. Assistance technique premium.",
  },
  {
    service: "Frais client par billet",
    tarif: "1 000 FCFA / billet",
    tag: "Automatique",
    category: "Modèle économique",
    description:
      "Chaque passager paie un supplément fixe de 1 000 FCFA sur son billet. Ce montant est collecté et reversé automatiquement à Mali Billet.",
  },
  {
    service: "Statistiques avancées",
    tarif: "5 000 FCFA / mois",
    tag: "Option",
    category: "Analyse & Performance",
    description:
      "Analyse détaillée : taux de remplissage, ventes par ligne, performance chauffeurs, alertes trajets sous-performants.",
  },
  {
    service: "API Intégration",
    tarif: "10 000 FCFA / mois",
    tag: "Enterprise+",
    category: "Intégration système",
    description:
      "Connectez votre site, vos bornes ou votre système interne directement à la plateforme Mali Billet (JSON REST API).",
  },
];
// Styles PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
    color: '#0d47a1',
  },
  abonnementBox: {
    border: '1pt solid #0d47a1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  serviceBox: {
    border: '1pt solid #2e7d32',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    marginBottom: 3,
  },
  tag: {
    color: '#fff',
    backgroundColor: '#ff9800',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontSize: 10,
    marginRight: 5,
  },
});

// Document PDF
const AbonnementsPDFDocument = ({ abonnements }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Mali Billet - Formules d’Abonnement</Text>

      {/* Abonnements */}
      {abonnements.map((abonnement, i) => (
        <View key={i} style={styles.abonnementBox}>
          <Text style={styles.header}>{abonnement.plan}</Text>
          <Text style={styles.text}>{abonnement.tarif}</Text>
          <Text style={styles.text}>{abonnement.description}</Text>
          {abonnement.objectifs && (
            <View style={{ marginTop: 5 }}>
              {abonnement.objectifs.map((obj, j) => (
                <Text key={j}>• {obj}</Text>
              ))}
            </View>
          )}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Services Additionnels</Text>

      {/* Add-ons */}
      {servicesAddons.map((addon, i) => (
        <View key={i} style={styles.serviceBox}>
          <Text style={styles.header}>
            {addon.service} <Text style={styles.tag}>{addon.tag}</Text>
          </Text>
          <Text style={styles.text}>{addon.category}</Text>
          <Text style={styles.text}>{addon.tarif}</Text>
          <Text style={styles.text}>{addon.description}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

// Composant React pour téléchargement
export default function AbonnementsPDF({ abonnements }) {
  return (
    <div className="p-6">
      <PDFDownloadLink
        document={<AbonnementsPDFDocument abonnements={abonnements} />}
        fileName="Abonnements_MaliBillet.pdf"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
      >
        {({ loading }) => (loading ? 'Chargement...' : 'Télécharger PDF')}
      </PDFDownloadLink>
    </div>
  );
}
