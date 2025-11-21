import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function ProduitForm({ produit }) {
  const [name, setName] = useState(produit?.name || "");
  const isEdit = Boolean(produit?.id);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { name };

    if (isEdit) {
      Inertia.put(route("produits.update", produit.id), payload);
    } else {
      Inertia.post(route("produits.store"), payload);
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
        <Typography variant="h4" mb={3}>
          {isEdit ? "Modifier le produit" : "Créer un produit"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nom du produit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                variant="outlined"
                onClick={() => Inertia.visit(route("produits.index"))}
              >
                Annuler
              </Button>

              <Button type="submit" variant="contained" color="primary">
                {isEdit ? "Mettre à jour" : "Créer"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </GuestLayout>
  );
}
