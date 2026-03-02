import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";

// ---- FORMAT MONNAIE FCFA ----
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

// ---- STYLES PDF ----
const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11 },
  headerBox: { marginBottom: 10 },
  company: { fontSize: 16, fontWeight: "bold" },
  small: { fontSize: 10 },
  title: { textAlign: "center", fontSize: 15, marginVertical: 10, fontWeight: "bold" },
  section: { marginBottom: 10 },
  table: { display: "table", width: "auto", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 10 },
  row: { flexDirection: "row" },
  col: { width: "25%", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  head: { backgroundColor: "#e3f2fd", fontWeight: "bold" },
  summary: { marginTop: 4, fontWeight: "bold" },
  signatureBox: { marginTop: 30 },
});

// ---- DOCUMENT PDF COMPTABLE ----
export const TripPDF = ({ trip, companyLogo, companyName = "NILATOUTELTRANS" }) => {
  const tickets = trip.tickets || [];
  const expenses = trip.expenses || [];

  const recettes = tickets.reduce((s, t) => s + Number(t.price || 0), 0);
  const depenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const resultat = recettes - depenses;

  const reportNumber = `TR-${trip.id}-${new Date().getFullYear()}`;

  return (
    <Document>
      <Page style={styles.page}>
        {/* ENTETE */}
        <View style={styles.headerBox}>
          {companyLogo && <Image src={companyLogo} style={{ width: 120 }} />}
          <Text style={styles.company}>{companyName}</Text>
          <Text style={styles.small}>Rapport comptable officiel de trajet</Text>
          <Text style={styles.small}>N° Rapport : {reportNumber}</Text>
          <Text style={styles.small}>Date impression : {dateFR(new Date())}</Text>
        </View>

        {/* TITRE */}
        <Text style={styles.title}>RAPPORT FINANCIER DU TRAJET #{trip.id}</Text>

        {/* INFOS TRAJET */}
        <View style={styles.section}>
          <Text>Route : {trip.route?.departureCity || "-"} → {trip.route?.arrivalCity || "-"}</Text>
          <Text>Départ : {dateFR(trip.departure_at)}</Text>
          <Text>Bus : {trip.bus?.model || "-"} ({trip.bus?.registration_number || "-"})</Text>
        </View>

        {/* RECETTES */}
        <Text style={styles.title}>RECETTES BILLETS</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.col, styles.head]}>Client</Text>
            <Text style={[styles.col, styles.head]}>Agence</Text>
            <Text style={[styles.col, styles.head]}>Siège</Text>
            <Text style={[styles.col, styles.head]}>Montant</Text>
          </View>
          {tickets.map((t) => (
            <View style={styles.row} key={t.id}>
              <Text style={styles.col}>{t.client_name}</Text>
              <Text style={styles.col}>{t.user?.agency?.name || "-"}</Text>
              <Text style={styles.col}>{t.seat_number || "-"}</Text>
              <Text style={styles.col}>{money(t.price)} FCFA</Text>
            </View>
          ))}
        </View>
        <Text style={styles.summary}>TOTAL RECETTES : {money(recettes)} FCFA</Text>

        {/* DEPENSES */}
        <Text style={styles.title}>DEPENSES DU TRAJET</Text>
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
        <Text style={styles.summary}>TOTAL DEPENSES : {money(depenses)} FCFA</Text>

        {/* RESULTAT NET */}
        <Text style={[styles.summary, { fontSize: 13, marginTop: 8 }]}>
          RESULTAT NET DU TRAJET : {money(resultat)} FCFA
        </Text>

        {/* SIGNATURE COMPTABLE */}
        <View style={styles.signatureBox}>
          <Text>Responsable comptable :</Text>
          <Text style={{ marginTop: 20 }}>Signature et cachet de l'entreprise</Text>
        </View>

        {/* MENTION LEGALE */}
        <Text style={{ marginTop: 25, fontSize: 9 }}>
          Ce document constitue un rapport financier officiel généré par le
          système de gestion de transport. Toute falsification expose à des
          sanctions conformément aux règles comptables en vigueur.
        </Text>
      </Page>
    </Document>
  );
};

// ---- BOUTON TELECHARGEMENT PDF ----
export const TripPDFDownload = ({ trip, companyLogo, companyName }) => (
  <PDFDownloadLink
    document={<TripPDF trip={trip} companyLogo={companyLogo} companyName={companyName} />}
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
    {({ loading }) => (loading ? "Génération rapport..." : "Télécharger rapport comptable")}
  </PDFDownloadLink>
);
