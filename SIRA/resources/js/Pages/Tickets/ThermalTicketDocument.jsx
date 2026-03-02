import React, { useEffect, useRef, useState } from "react";
import { PDFViewer, Document, Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Styles ultra-compacts pour ticket thermique
const styles = StyleSheet.create({
  page: { padding: 4, backgroundColor: "#fff", fontFamily: "Helvetica" },
  container: { margin: 0, padding: 2 },
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

const ThermalTicketDocument = ({ ticket, qrCode }) => (
  <Document>
    <Page size={[80 * 3.78, 200]} style={styles.page}>
      <View style={styles.container}>
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
          <Text style={
            ticket?.status === "paid" ? styles.statusPaid :
            ticket?.status === "cancelled" ? styles.statusCancelled :
            ticket?.status === "reserved" ? styles.statusReserved : {}
          }>
            {ticket?.status || "—"}
          </Text>
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

export default function PrintThermalTicket({ ticket }) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    async function generateQr() {
      if (!ticket?.id) return;
      try {
        const dataUrl = await QRCode.toDataURL(`ticket-${ticket.id}`);
        setQrCode(dataUrl);
      } catch (e) {
        console.error(e);
      }
    }
    generateQr();
  }, [ticket?.id]);

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = <ThermalTicketDocument ticket={ticket} qrCode={qrCode} />;
    import("@react-pdf/renderer").then(({ pdf }) => {
      pdf(doc).toBlob().then(blob => {
        const url = URL.createObjectURL(blob);
        iframe.src = url;
        iframe.onload = () => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        };
      });
    });
  };

  return (
    <button onClick={handlePrint} disabled={!ticket?.id || !qrCode}>
      🖨 Imprimer Ticket
    </button>
  );
}