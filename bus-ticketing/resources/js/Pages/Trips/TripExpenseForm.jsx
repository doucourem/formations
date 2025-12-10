import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Divider,
  MenuItem
} from "@mui/material";

export default function TripExpenseForm({ trip }) {
  const [type, setType] = useState("toll"); // type de dépense par défaut
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    Inertia.post(route("trip-expenses.store"), {
      trip_id: trip.id,
      type,
      amount,
      description,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Ajouter une dépense pour le trajet #{trip.id}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <TextField
          select
          label="Type de dépense"
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
        >
          <MenuItem value="toll">Péages</MenuItem>
          <MenuItem value="meal">Restauration</MenuItem>
          <MenuItem value="maintenance">Entretien</MenuItem>
          <MenuItem value="other">Autres</MenuItem>
        </TextField>

        <TextField
          label="Montant (FCFA)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          fullWidth
        />

        <TextField
          label="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        <Button type="submit" variant="contained" color="primary">
          Ajouter la dépense
        </Button>
      </Stack>
    </Box>
  );
}
