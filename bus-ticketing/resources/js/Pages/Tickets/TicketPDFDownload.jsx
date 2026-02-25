import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

// 🔹 Styles pour ticket thermique 80mm
const styles = StyleSheet.create({
  page: { padding: 4, backgroundColor: "#fff", fontFamily: "Helvetica" },
  ticketContainer: { margin: 0, padding: 2 },
  header: { fontSize: 10, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginVertical: 1 },
  label: { fontSize: 6, fontWeight: "bold" },
  value: { fontSize: 6 },
  statusPaid: { color: "green", fontWeight: "bold", fontSize: 6 },
  statusCancelled: { color: "red", fontWeight: "bold", fontSize: 6 },
  statusReserved: { color: "orange", fontWeight: "bold", fontSize: 6 },
  qrContainer: { alignItems: "center", marginVertical: 2 },
  footer: { fontSize: 5, textAlign: "center", marginTop: 2 },
});

const TicketThermal80 = ({ ticket }) => {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    async function generateQr() {
      if (!ticket?.id) return;
      try {
        const dataUrl = await QRCode.toDataURL(`ticket-${ticket.id}`);
        setQrCode(dataUrl);
      } catch (e) {
        console.error("QR generation error:", e);
      }
    }
    generateQr();
  }, [ticket?.id]);

  const translateStatus = (status) => {
    switch (status) {
      case "paid": return "Payé";
      case "cancelled": return "Annulé";
      case "reserved": return "Réservé";
      default: return "Inconnu";
    }
  };
  const statusStyle = (status) => {
    switch (status) {
      case "paid": return styles.statusPaid;
      case "cancelled": return styles.statusCancelled;
      case "reserved": return styles.statusReserved;
      default: return {};
    }
  };

  return (
    <Document>
      <Page size={[80 * 3.78, 200]} style={styles.page}>
        <View style={styles.ticketContainer}>
          <Text style={styles.header}>🚌 Ticket Bus #{ticket?.id || "—"}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{ticket?.client_name || "—"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Trajet:</Text>
            <Text style={styles.value}>
              {ticket?.trip?.route
                ? `${ticket.trip.route.departureCity || "?"} → ${ticket.trip.route.arrivalCity || "?"}`
                : "Non défini"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Départ:</Text>
            <Text style={styles.value}>{ticket?.trip?.departure_time || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Siège:</Text>
            <Text style={styles.value}>{ticket?.seat_number || "—"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Prix:</Text>
            <Text style={styles.value}>{ticket?.price?.toLocaleString() || "—"} FCFA</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={statusStyle(ticket?.status)}>{translateStatus(ticket?.status)}</Text>
          </View>

          {qrCode && (
            <View style={styles.qrContainer}>
              <Image src={qrCode} style={{ width: 50, height: 50 }} />
              <Text style={{ fontSize: 5, textAlign: "center" }}>Scanner pour valider</Text>
            </View>
          )}

          <Text style={styles.footer}>Merci de votre confiance !</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function TicketThermalDownload({ ticket }) {
  return (
    <PDFDownloadLink
      document={<TicketThermal80 ticket={ticket} />}
      fileName={`ticket_bus_${ticket?.id || "—"}.pdf`}
    >
      {({ loading }) => (loading ? "Génération PDF..." : "Télécharger Ticket")}
    </PDFDownloadLink>
  );
}