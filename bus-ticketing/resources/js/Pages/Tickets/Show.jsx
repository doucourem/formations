import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Box, Typography, Paper, Stack, Divider, Button } from "@mui/material";
import { Inertia } from "@inertiajs/inertia";

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

  const translateStatus = (status) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "cancelled":
        return "Annulé";
      case "reserved":
        return "Réservé";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "green";
      case "cancelled":
        return "red";
      case "reserved":
        return "orange";
      default:
        return "black";
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Détails du ticket #{ticket.id}
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Stack spacing={2}>
            {/* Infos client */}
            <Typography variant="h6">Informations client</Typography>
            <Typography variant="body1">
              <strong>Nom :</strong> {ticket.client_name || "—"}
            </Typography>
            <Typography variant="body1">
              <strong>NINA :</strong> {ticket.client_nina || "—"}
            </Typography>

            <Divider />

            {/* Infos utilisateur/vendeur */}
            <Typography variant="h6">Informations utilisateur / vendeur</Typography>
            <Typography variant="body1">
              <strong>Nom :</strong> {ticket.user?.name || "—"}
            </Typography>
            <Typography variant="body1">
              <strong>Email :</strong> {ticket.user?.email || "—"}
            </Typography>
            <Typography variant="body1">
              <strong>Agence :</strong> {ticket.user?.agency?.name || "—"}
            </Typography>

            <Divider />

            {/* Infos ticket */}
            <Typography variant="h6">Informations du ticket</Typography>
            <Typography variant="body1">
              <strong>Siège :</strong> {ticket.seat_number || "—"}
            </Typography>
            <Typography variant="body1">
              <strong>Prix :</strong> {ticket.price || "—"} FCFA
            </Typography>
            <Typography variant="body1">
              <strong>Statut :</strong>{" "}
              <span style={{ color: getStatusColor(ticket.status), fontWeight: 600 }}>
                {translateStatus(ticket.status)}
              </span>
            </Typography>

            <Divider />

            {/* Infos voyage */}
            <Typography variant="h6">Informations voyage</Typography>
            <Typography variant="body1">
              <strong>Voyage :</strong>{" "}
              {ticket.trip?.route
                ? `${ticket.trip.route.departureCity} → ${ticket.trip.route.arrivalCity}`
                : "Non spécifié"}
            </Typography>
            <Typography variant="body1">
              <strong>Départ :</strong> {ticket.trip?.departure_time || "Non défini"}
            </Typography>
            <Typography variant="body1">
              <strong>Arrivée :</strong> {ticket.trip?.arrival_time || "Non défini"}
            </Typography>
            <Typography variant="body1">
              <strong>Bus :</strong> {ticket.trip?.bus?.plate_number || "—"}
            </Typography>
          </Stack>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" color="primary" onClick={handleBack}>
              Retour
            </Button>

            <Button variant="contained" color="success" onClick={handleEdit}>
              Modifier
            </Button>
          </Box>
        </Paper>
      </Box>
    </GuestLayout>
  );
}
