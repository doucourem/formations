import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Box, Typography, Paper, Stack, Divider, Button } from "@mui/material";
import { Inertia } from "@inertiajs/inertia";
import TicketPDFDownload from "./TicketPDFDownload";



export default function Show({ ticket }) {
  if (!ticket) {
    return (
      <GuestLayout>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Ticket introuvable
          </Typography>
        </Box>
      </GuestLayout>
    );
  }

  const handleBack = () => Inertia.visit(route("ticket.index"));
  const handleEdit = () => Inertia.visit(route("ticket.edit", ticket.id));
  const handlePrint = () => window.print();

  const translateStatus = (status) => {
    switch (status) {
      case "paid": return "Payé";
      case "cancelled": return "Annulé";
      case "reserved": return "Réservé";
      default: return "Inconnu";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "green";
      case "cancelled": return "red";
      case "reserved": return "orange";
      default: return "gray";
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom align="center">
          🎟️ Ticket #{ticket.id}
        </Typography>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
            border: "2px dashed gray",
            "@media print": {
              boxShadow: "none",
              border: "none",
            },
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h6" color="primary" align="center">
              🎫 Informations client
            </Typography>
            <Typography><strong>Nom :</strong> {ticket.client_name || "—"}</Typography>

            <Divider />

            <Typography variant="h6" color="primary" align="center">
              👤 Informations utilisateur / vendeur
            </Typography>
            <Typography><strong>Nom :</strong> {ticket.user?.name || "—"}</Typography>
            <Typography><strong>Email :</strong> {ticket.user?.email || "—"}</Typography>
            <Typography><strong>Agence :</strong> {ticket.user?.agency?.name || "—"}</Typography>

            <Divider />

            <Typography variant="h6" color="primary" align="center">
              🚌 Informations du voyage
            </Typography>
            <Typography>
              <strong>Trajet :</strong>{" "}
              {ticket.trip?.route
                ? `${ticket.trip.route.departureCity} → ${ticket.trip.route.arrivalCity}`
                : "Non défini"}
            </Typography>
            <Typography><strong>Départ :</strong> {ticket.trip?.departure_time || "—"}</Typography>
            <Typography><strong>Arrivée :</strong> {ticket.trip?.arrival_time || "—"}</Typography>
            <Typography><strong>Bus :</strong> {ticket.trip?.bus?.plate_number || "—"}</Typography>
            <Typography><strong>Siège :</strong> {ticket.seat_number || "—"}</Typography>
            <Typography><strong>Prix :</strong> {ticket.trip.route.price?.toLocaleString() || "—"} FCFA</Typography>
            <Typography>
              <strong>Statut :</strong>{" "}
              <span style={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>
                {translateStatus(ticket.status)}
              </span>
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              "@media print": { display: "none" },
            }}
          >
            <Button variant="outlined" color="primary" onClick={handleBack}>
              Retour
            </Button>
            <Button variant="contained" color="success" onClick={handleEdit}>
              Modifier
            </Button>
            <Button variant="contained" color="secondary">
             <TicketPDFDownload ticket={ticket} />
            </Button>
          </Box>
        </Paper>
      </Box>
    </GuestLayout>
  );
}
