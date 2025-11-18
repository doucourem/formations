import React from "react";
import QRCode from "qrcode.react";

const Ticket = ({ trip, paymentMethod }) => {
  const departureCity = trip?.route?.departureCity?.name || "N/A";
  const arrivalCity = trip?.route?.arrivalCity?.name || "N/A";
  const busName = trip?.bus?.registration_number || "N/A";
  const departureTime = trip?.departure_at
    ? new Date(trip.departure_at).toLocaleString()
    : "N/A";
  const arrivalTime = trip?.arrival_at
    ? new Date(trip.arrival_at).toLocaleString()
    : "N/A";
  const price = trip?.route?.price || "N/A";

  const qrValue = `TripID:${trip?.id}|${departureCity}->${arrivalCity}|${departureTime}`;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎫 Billet de Voyage</h1>

      <div style={styles.section}>
        <strong>ID Réservation:</strong> {trip?.id}
      </div>

      <div style={styles.section}>
        <strong>Itinéraire:</strong> {departureCity} → {arrivalCity}
      </div>

      <div style={styles.section}>
        <strong>Départ:</strong> {departureTime} <br />
        <strong>Arrivée:</strong> {arrivalTime}
      </div>

      <div style={styles.section}>
        <strong>Bus:</strong> {busName} <br />
        <strong>Prix:</strong> {price} FCFA
      </div>

      <div style={styles.section}>
        <strong>Mode de paiement:</strong> {paymentMethod || "N/A"}
      </div>

      <div style={styles.qr}>
        <QRCode value={qrValue} size={200} />
      </div>

      <div style={styles.footer}>
        Merci et bon voyage ! 🚌 <br />
        Ce billet est à présenter à l'embarquement.
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: "2px dashed #333",
    padding: 20,
    maxWidth: 500,
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.4,
    color: "#333",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  qr: {
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    color: "#555",
  },
};

export default Ticket;
