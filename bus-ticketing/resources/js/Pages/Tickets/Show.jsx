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

  return (
    <GuestLayout>
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Détails du ticket #{ticket.id}
        </Typography>

        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>Nom du client :</strong> {ticket.client_name}
            </Typography>

            <Typography variant="body1">
              <strong>NINA :</strong> {ticket.client_nina || "—"}
            </Typography>

            <Typography variant="body1">
              <strong>Siège :</strong> {ticket.seat_number || "—"}
            </Typography>

            <Typography variant="body1">
              <strong>Prix :</strong> {ticket.price} FCFA
            </Typography>

            <Typography variant="body1">
              <strong>Statut :</strong>{" "}
              <span
                style={{
                  color:
                    ticket.status === "paid"
                      ? "green"
                      : ticket.status === "cancelled"
                      ? "red"
                      : "orange",
                  fontWeight: 600,
                }}
              >
                {ticket.status === "paid"
                  ? "Payé"
                  : ticket.status === "cancelled"
                  ? "Annulé"
                  : "Réservé"}
              </span>
            </Typography>

            <Divider />

            <Typography variant="body1">
              <strong>Voyage :</strong>{" "}
              {ticket.trip?.route
                ? `${ticket.trip.route.departureCity?.name} → ${ticket.trip.route.arrivalCity?.name}`
                : "Non spécifié"}
            </Typography>

            <Typography variant="body1">
              <strong>Départ :</strong>{" "}
              {ticket.trip?.departure_at || "Non défini"}
            </Typography>

            <Typography variant="body1">
              <strong>Bus :</strong>{" "}
              {ticket.trip?.bus?.registration_number || "—"}
            </Typography>
          </Stack>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" color="primary" onClick={handleBack}>
              Retour
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() =>
                Inertia.visit(route("ticket.edit", ticket.id))
              }
            >
              Modifier
            </Button>
          </Box>
        </Paper>
      </Box>
    </GuestLayout>
  );
}
