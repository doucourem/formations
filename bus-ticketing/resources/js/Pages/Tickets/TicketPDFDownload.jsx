// TicketBusPro.jsx
import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import QRCode from "qrcode"; // ✔️ Génération QR code en image

// Styles PDF (inchangés)
const styles = StyleSheet.create({
  page: { padding: 0, backgroundColor: "#f2f2f2", fontFamily: "Helvetica" },
  ticketContainer: {
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
  },
  header: {
    backgroundColor: "#1976d2",
    color: "#fff",
    padding: 6,
    textAlign: "center",
    fontSize: 14, // réduit de 18 à 14
    fontWeight: "bold",
  },
  section: { padding: 6, borderBottom: "1px solid #eee" },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginVertical: 1 },
  label: { fontWeight: "bold", fontSize: 10 }, // réduit
  value: { fontWeight: "normal", fontSize: 10 }, // réduit
  statusPaid: { color: "green", fontWeight: "bold", fontSize: 10 },
  statusCancelled: { color: "red", fontWeight: "bold", fontSize: 10 },
  statusReserved: { color: "orange", fontWeight: "bold", fontSize: 10 },
  qrContainer: { alignItems: "center", marginVertical: 6 },
  footer: { fontSize: 8, color: "#555", textAlign: "center", padding: 3, backgroundColor: "#f5f5f5" },
});


const TicketBusPro = ({ ticket }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  // Génération QR code en Base64 pour PDF
  useEffect(() => {
    QRCode.toDataURL(`ticket-${ticket.id}`)
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
  }, [ticket.id]);

  const translateStatus = (status) => {
    switch (status) {
      case "paid": return "Payé";
      case "cancelled": return "Annulé";
      case "reserved": return "Réservé";
      default: return "Inconnu";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "paid": return styles.statusPaid;
      case "cancelled": return styles.statusCancelled;
      case "reserved": return styles.statusReserved;
      default: return {};
    }
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
          </View>

          {/* Vendeur */}
          <View style={styles.section}>
            <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Vendeur</Text>
            <View style={styles.row}><Text style={styles.label}>Nom:</Text><Text style={styles.value}>{ticket.user?.name || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Agence:</Text><Text style={styles.value}>{ticket.user?.agency?.name || "—"}</Text></View>
          </View>

          {/* Prix & Statut */}
          <View style={styles.section}>
            <View style={styles.row}><Text style={styles.label}>Prix:</Text><Text style={styles.value}>{ticket.trip.route.price?.toLocaleString() || "—"} FCFA</Text></View>
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
