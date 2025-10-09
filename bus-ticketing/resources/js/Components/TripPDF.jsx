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

// Fonction pour formater la date en français
const formatDateFR = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, "0")}/${
    (date.getMonth() + 1).toString().padStart(2, "0")
  }/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// Styles PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: {
    backgroundColor: "#1976d2",
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  logo: { width: 80, height: 40, marginBottom: 10 },
  section: { marginBottom: 15 },
  label: { fontWeight: "bold" },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: { flexDirection: "row" },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontWeight: "bold",
    backgroundColor: "#1976d2",
    color: "white",
  },
  tableRowOdd: {
    backgroundColor: "#f2f2f2",
  },
});

// Composant PDF du trajet
export const TripPDF = ({ trip, companyLogo }) => (
  <Document>
    <Page style={styles.page}>
      {/* Logo + Titre */}
      {companyLogo && <Image src={companyLogo} style={styles.logo} />}
      <Text style={styles.header}>Détails du trajet #{trip.id}</Text>

      <View style={styles.section}>
        <Text>
          <Text style={styles.label}>Route : </Text>
          {trip.route?.departureCity?.name || "-"} → {trip.route?.arrivalCity?.name || "-"}
        </Text>
        <Text>
          <Text style={styles.label}>Bus : </Text>
          {trip.bus?.model || "-"} ({trip.bus?.registration_number || "N/A"})
        </Text>
        <Text>
          <Text style={styles.label}>Départ : </Text>
          {formatDateFR(trip.departure_at)}
        </Text>
        <Text>
          <Text style={styles.label}>Arrivée : </Text>
          {formatDateFR(trip.arrival_at)}
        </Text>
        <Text>
          <Text style={styles.label}>Prix de base : </Text>
          {trip.route?.price ? Number(trip.route.price).toLocaleString("fr-FR") + " FCFA" : "-"}
        </Text>
        <Text>
          <Text style={styles.label}>Places disponibles : </Text>
          {trip.bus?.capacity || "-"}
        </Text>
      </View>

      <Text style={[styles.header, { fontSize: 16, marginBottom: 10 }]}>Billets vendus</Text>

      {trip.tickets?.length > 0 ? (
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.tableCellHeader]}>Client</Text>
            <Text style={[styles.tableCol, styles.tableCellHeader]}>Siège</Text>
            <Text style={[styles.tableCol, styles.tableCellHeader]}>Prix</Text>
            <Text style={[styles.tableCol, styles.tableCellHeader]}>Statut</Text>
          </View>

          {/* Rows */}
          {trip.tickets.map((ticket, index) => (
            <View
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowOdd]}
              key={ticket.id}
            >
              <Text style={styles.tableCol}>{ticket.client_name}</Text>
              <Text style={styles.tableCol}>{ticket.seat_number || "-"}</Text>
              <Text style={styles.tableCol}>
                {ticket.price ? Number(ticket.price).toLocaleString("fr-FR") + " FCFA" : "-"}
              </Text>
              <Text style={styles.tableCol}>
                {ticket.status === "paid"
                  ? "Payé"
                  : ticket.status === "cancelled"
                  ? "Annulé"
                  : "Réservé"}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text>Aucun billet vendu pour ce trajet.</Text>
      )}
    </Page>
  </Document>
);

// Composant pour télécharger le PDF
export const TripPDFDownload = ({ trip, companyLogo }) => (
  <PDFDownloadLink
    document={<TripPDF trip={trip} companyLogo={companyLogo} />}
    fileName={`Trajet_${trip.id}.pdf`}
    style={{
      textDecoration: "none",
      padding: "10px 20px",
      color: "#fff",
      backgroundColor: "#1976d2",
      borderRadius: 5,
      fontWeight: "bold",
    }}
  >
    {({ loading }) => (loading ? "Chargement PDF..." : "Télécharger PDF")}
  </PDFDownloadLink>
);
