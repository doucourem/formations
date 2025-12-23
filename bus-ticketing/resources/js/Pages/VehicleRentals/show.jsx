import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import { Box, Typography, Button, Stack, Divider } from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
export default function VehicleRentalShow() {
  // On récupère les props envoyées par le contrôleur Laravel
  const { rental } = usePage().props;

  if (!rental) return <p>Location non trouvée</p>;

  return (
    <GuestLayout>
    <Box sx={{ maxWidth: 600, margin: "0 auto", mt: 4, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Détails de la location
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1}>
        <Typography><strong>ID :</strong> {rental.id}</Typography>
        <Typography><strong>Véhicule :</strong> {rental.vehicle_name}</Typography>
        <Typography><strong>Client :</strong> {rental.customer_name}</Typography>
        <Typography><strong>Date de début :</strong> {rental.start_date}</Typography>
        <Typography><strong>Date de fin :</strong> {rental.end_date}</Typography>
        <Typography><strong>Statut :</strong> {rental.status}</Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" onClick={() => Inertia.get(route("vehicle-rentals.index"))}>
        Retour à la liste
      </Button>
    </Box>
    </GuestLayout>
  );
}
