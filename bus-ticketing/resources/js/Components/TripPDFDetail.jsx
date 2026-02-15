import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// ---- FORMAT FCFA ----
const money = (n) =>
  Number(n || 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// ---- FORMAT DATE FR ----
const dateFR = (d) => {
  if (!d) return "-";
  const x = new Date(d);
  return `${x.getDate().toString().padStart(2, "0")}/${
    (x.getMonth() + 1).toString().padStart(2, "0")
  }/${x.getFullYear()} ${x.getHours().toString().padStart(2, "0")}:${x
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11 },
  header: { fontSize: 16, textAlign: "center", fontWeight: "bold", marginBottom: 10 },
  table: { display: "table", width: "auto", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 10 },
  row: { flexDirection: "row" },
  col: { width: "25%", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  head: { backgroundColor: "#e3f2fd", fontWeight: "bold" },
  summary: { marginTop: 4, fontWeight: "bold" },
});

// ---- DOCUMENT PDF SIMPLIFIE ----
export const TripPDF = ({ trip }) => {
  const tickets = trip.tickets || [];
  const expenses = trip.expenses || [];

  const totalRecettes = tickets.reduce((s, t) => s + Number(t.price || 0), 0);
  const totalDepenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const resultat = totalRecettes - totalDepenses;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>RAPPORT FINANCIER DU TRAJET #{trip.id}</Text>

        {/* RECETTES BILLETS */}
        <Text style={{ marginBottom: 6 }}>Montants billets vendus :</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.col, styles.head]}>Client</Text>
            <Text style={[styles.col, styles.head]}>Montant</Text>
          </View>
          {tickets.map((t) => (
            <View style={styles.row} key={t.id}>
              <Text style={styles.col}>{t.client_name}</Text>
              <Text style={styles.col}>{money(t.price)} FCFA</Text>
            </View>
          ))}
        </View>
        <Text style={styles.summary}>TOTAL RECETTES : {money(totalRecettes)} FCFA</Text>

        {/* DEPENSES */}
        <Text style={{ marginTop: 10, marginBottom: 6 }}>Détails des dépenses :</Text>
        {expenses.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={[styles.col, styles.head]}>Description</Text>
              <Text style={[styles.col, styles.head]}>Agent</Text>
              <Text style={[styles.col, styles.head]}>Date</Text>
              <Text style={[styles.col, styles.head]}>Montant</Text>
            </View>
            {expenses.map((e) => (
              <View style={styles.row} key={e.id}>
                <Text style={styles.col}>{e.label || e.description}</Text>
                <Text style={styles.col}>{e.user?.name || "-"}</Text>
                <Text style={styles.col}>{dateFR(e.created_at)}</Text>
                <Text style={styles.col}>{money(e.amount)} FCFA</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>Aucune dépense enregistrée</Text>
        )}
        <Text style={styles.summary}>TOTAL DEPENSES : {money(totalDepenses)} FCFA</Text>

        {/* RESULTAT NET */}
        <Text style={[styles.summary, { marginTop: 6, fontSize: 13 }]}>
          RESULTAT NET : {money(resultat)} FCFA
        </Text>
      </Page>
    </Document>
  );
};

// ---- BOUTON PDF ----
export const TripPDFDetails = ({ trip }) => (
  <PDFDownloadLink
    document={<TripPDF trip={trip} />}
    fileName={`Rapport_Comptable_Trajet_${trip.id}.pdf`}
    style={{
      padding: "10px 18px",
      backgroundColor: "#2e7d32",
      color: "#fff",
      borderRadius: 5,
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    {({ loading }) => (loading ? "Génération rapport..." : "Télécharger PDF")}
  </PDFDownloadLink>
);
