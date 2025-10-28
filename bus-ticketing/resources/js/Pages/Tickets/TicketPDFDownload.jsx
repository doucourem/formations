// TicketBusPro.jsx
import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Styles PDF
const styles = StyleSheet.create({
  page: { padding: 0, backgroundColor: "#f2f2f2", fontFamily: "Helvetica" },
  ticketContainer: { margin: 10, borderRadius: 10, overflow: "hidden", backgroundColor: "#fff", border: "1px solid #ccc" },
  header: { backgroundColor: "#1976d2", color: "#fff", padding: 6, textAlign: "center", fontSize: 14, fontWeight: "bold" },
  section: { padding: 6, borderBottom: "1px solid #eee" },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginVertical: 1 },
  label: { fontWeight: "bold", fontSize: 10 },
  value: { fontWeight: "normal", fontSize: 10 },
  statusPaid: { color: "green", fontWeight: "bold", fontSize: 10 },
  statusCancelled: { color: "red", fontWeight: "bold", fontSize: 10 },
  statusReserved: { color: "orange", fontWeight: "bold", fontSize: 10 },
  qrContainer: { alignItems: "center", marginVertical: 6 },
  footer: { fontSize: 8, color: "#555", textAlign: "center", padding: 3, backgroundColor: "#f5f5f5" },
});

const TicketBusPro = ({ ticket }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(`ticket-${ticket.id}`).then(setQrCodeDataUrl).catch(console.error);
  }, [ticket.id]);

  const translateStatus = (status) => {
    return status === "paid" ? "Payé" : status === "cancelled" ? "Annulé" : status === "reserved" ? "Réservé" : "Inconnu";
  };

  const getStatusStyle = (status) => {
    return status === "paid" ? styles.statusPaid : status === "cancelled" ? styles.statusCancelled : status === "reserved" ? styles.statusReserved : {};
  };

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.ticketContainer}>
          <Text style={styles.header}>🚌 Ticket Bus #{ticket.id}</Text>

          {/* Client */}
          <View style={styles.section}>
            <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Client</Text>
            <View style={styles.row}><Text style={styles.label}>Nom:</Text><Text style={styles.value}>{ticket.client_name || "—"}</Text></View>
          </View>

          {/* Voyage */}
          <View style={styles.section}>
            <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Voyage</Text>
            <View style={styles.row}><Text style={styles.label}>Trajet:</Text><Text style={styles.value}>{ticket.trip?.route ? `${ticket.trip.route.departureCity} → ${ticket.trip.route.arrivalCity}` : "Non défini"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Départ:</Text><Text style={styles.value}>{ticket.trip?.departure_time || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Arrivée:</Text><Text style={styles.value}>{ticket.trip?.arrival_time || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Bus:</Text><Text style={styles.value}>{ticket.trip?.bus?.plate_number || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Siège:</Text><Text style={styles.value}>{ticket.seat_number || "—"}</Text></View>

            {/* Trajet réservé */}
            {ticket.start_stop && ticket.end_stop && (
              <View style={{ marginBottom: 4 }}>
                <View style={styles.row}><Text style={styles.label}>Trajet réservé:</Text></View>
                <View style={styles.row}><Text style={styles.value}>{ticket.start_stop.city_name || "?"} → {ticket.end_stop.to_city_name || "?"}</Text></View>
              </View>
            )}
          </View>

          {/* Vendeur */}
          <View style={styles.section}>
            <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Vendeur</Text>
            <View style={styles.row}><Text style={styles.label}>Nom:</Text><Text style={styles.value}>{ticket.user?.name || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Agence:</Text><Text style={styles.value}>{ticket.user?.agency?.name || "—"}</Text></View>
          </View>

          {/* Prix & Statut */}
          <View style={styles.section}>
            <View style={styles.row}><Text style={styles.label}>Prix:</Text><Text style={styles.value}>{ticket.price?.toLocaleString() || "—"} FCFA</Text></View>
            <View style={styles.row}><Text style={styles.label}>Statut:</Text><Text style={getStatusStyle(ticket.status)}>{translateStatus(ticket.status)}</Text></View>
          </View>

          {/* QR Code */}
          {qrCodeDataUrl && (
            <View style={styles.qrContainer}>
              <Text style={{ marginBottom: 4 }}>Scanner pour valider</Text>
              <Image src={qrCodeDataUrl} style={{ width: 80, height: 80 }} />
            </View>
          )}

          <Text style={styles.footer}>Merci de votre confiance !</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function TicketBusProDownload({ ticket }) {
  return (
    <PDFDownloadLink document={<TicketBusPro ticket={ticket} />} fileName={`ticket_bus_${ticket.id}.pdf`}>
      {({ loading }) => (loading ? "Génération PDF..." : "Télécharger Ticket")}
    </PDFDownloadLink>
  );
}
