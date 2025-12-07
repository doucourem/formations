import React from "react";
import { useForm } from "@inertiajs/react";
import { Box, Button, TextField } from "@mui/material";

export default function BaggageForm({ ticket, onSuccess }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    weight: "",
    price: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("baggage.store", ticket.id), {
      onSuccess: () => {
        reset();           // Réinitialise le formulaire
        onSuccess?.();     // Ferme le modal si onSuccess est fourni
      },
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 2, flexDirection: "column", mt: 2 }}
    >
      <TextField
        label="Poids du bagage (kg)"
        type="number"
        value={data.weight}
        onChange={(e) => setData("weight", e.target.value)}
        error={!!errors.weight}
        helperText={errors.weight}
        required
      />
      <TextField
        label="Prix du bagage"
        type="number"
        value={data.price}
        onChange={(e) => setData("price", e.target.value)}
        error={!!errors.price}
        helperText={errors.price}
        required
      />
      <Button type="submit" variant="contained" color="primary" disabled={processing}>
        Ajouter le bagage
      </Button>
    </Box>
  );
}
