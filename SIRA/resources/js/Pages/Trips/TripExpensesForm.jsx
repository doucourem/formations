import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

export default function TripExpensesForm({ trip }) {
  const [chauffeur, setChauffeur] = useState(trip?.chauffeur_cost || 0);
  const [fuel, setFuel] = useState(trip?.fuel_cost || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    Inertia.post(route("trips.expenses.store", trip.id), {
      chauffeur_cost: chauffeur,
      fuel_cost: fuel,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Frais du trajet #{trip.id}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <TextField
          label="Coût Chauffeur (FCFA)"
          type="number"
          value={chauffeur}
          onChange={(e) => setChauffeur(parseFloat(e.target.value))}
          fullWidth
        />

        <TextField
          label="Carburant (FCFA)"
          type="number"
          value={fuel}
          onChange={(e) => setFuel(parseFloat(e.target.value))}
          fullWidth
        />

        <Button type="submit" variant="contained" color="primary">
          Enregistrer
        </Button>
      </Stack>
    </Box>
  );
}
