import React, { useEffect, useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

// 🔹 Styles compactes pour A6
const styles = StyleSheet.create({
  page: { padding: 6, backgroundColor: "#fff", fontFamily: "Helvetica" },
  ticketContainer: { margin: 0, padding: 6 },
  header: { backgroundColor: "#1976d2", color: "#fff", padding: 4, textAlign: "center", fontSize: 10, fontWeight: "bold" },
  section: { paddingVertical: 2 },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginVertical: 1 },
  label: { fontWeight: "bold", fontSize: 7 },
  value: { fontSize: 7 },
  statusPaid: { color: "green", fontWeight: "bold", fontSize: 7 },
  statusCancelled: { color: "red", fontWeight: "bold", fontSize: 7 },
  statusReserved: { color: "orange", fontWeight: "bold", fontSize: 7 },
  qrContainer: { alignItems: "center", marginVertical: 4 },
  footer: { fontSize: 5, color: "#555", textAlign: "center", padding: 2, backgroundColor: "#f5f5f5" },
});

const TicketBusPro = ({ ticket }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(`ticket-${ticket.id}`).then(setQrCodeDataUrl).catch(console.error);
  }, [ticket.id]);

  const translateStatus = (status) => {
    return status === "paid"
      ? "Payé"
      : status === "cancelled"
      ? "Annulé"
      : status === "reserved"
      ? "Réservé"
      : "Inconnu";
  };

  const getStatusStyle = (status) => {
    return status === "paid"
      ? styles.statusPaid
      : status === "cancelled"
      ? styles.statusCancelled
      : status === "reserved"
      ? styles.statusReserved
      : {};
  };

  return (
    <Document>
      {/* Page A6 compacte */}
      <Page size={[148, 105]} style={styles.page}> {/* 105x148 mm = A6 */}
        <View style={styles.ticketContainer}>
          <Text style={styles.header}>🚌 Ticket Bus #{ticket.id}</Text>

          {/* Client */}
          <View style={styles.section}>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginBottom: 1 }}>Client</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>{ticket.client_name || "—"}</Text>
            </View>
          </View>

          {/* Voyage */}
          <View style={styles.section}>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginBottom: 1 }}>Voyage</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Trajet:</Text>
              <Text style={styles.value}>
                {ticket.trip?.route ? `${ticket.trip.route.departureCity} → ${ticket.trip.route.arrivalCity}` : "Non défini"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Départ:</Text>
              <Text style={styles.value}>{ticket.trip?.departure_time || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Arrivée:</Text>
              <Text style={styles.value}>{ticket.trip?.arrival_time || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Bus:</Text>
              <Text style={styles.value}>{ticket.trip?.bus?.plate_number || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Siège:</Text>
              <Text style={styles.value}>{ticket.seat_number || "—"}</Text>
            </View>

            {ticket.start_stop && ticket.end_stop && (
              <View style={{ marginTop: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>Trajet réservé:</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.value}>
                    {ticket.start_stop.city_name || "?"} → {ticket.end_stop.to_city_name || "?"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Vendeur */}
          <View style={styles.section}>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginBottom: 1 }}>Vendeur</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>{ticket.user?.name || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Agence:</Text>
              <Text style={styles.value}>{ticket.user?.agency?.name || "—"}</Text>
            </View>
          </View>

          {/* Prix & Statut */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Prix:</Text>
              <Text style={styles.value}>{ticket.price?.toLocaleString() || "—"} FCFA</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Statut:</Text>
              <Text style={getStatusStyle(ticket.status)}>{translateStatus(ticket.status)}</Text>
            </View>
          </View>

          {/* QR Code */}
          {qrCodeDataUrl && (
            <View style={styles.qrContainer}>
              <Text style={{ fontSize: 6, marginBottom: 1 }}>Scanner pour valider</Text>
              <Image src={qrCodeDataUrl} style={{ width: 60, height: 60 }} />
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>Merci de votre confiance !</Text>
        </View>
      </Page>
    </Document>
  );
};

// 🔹 Composant téléchargement PDF
export default function TicketBusProDownload({ ticket }) {
  return (
    <PDFDownloadLink document={<TicketBusPro ticket={ticket} />} fileName={`ticket_bus_${ticket.id}.pdf`}>
      {({ loading }) => (loading ? "Génération PDF..." : "Télécharger Ticket")}
    </PDFDownloadLink>
  );
}
