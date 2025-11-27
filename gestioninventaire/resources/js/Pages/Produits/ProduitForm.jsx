import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";

export default function ProduitForm({ produit, boutiques }) {
  const [name, setName] = useState(produit?.name || "");
  const [salePrice, setSalePrice] = useState(produit?.sale_price || "");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(
    produit?.photo ? `/storage/${produit.photo}` : null
  );

  const [selectedBoutiques, setSelectedBoutiques] = useState(
    produit?.boutiques?.map((b) => b.id) || []
  );

  const isEdit = Boolean(produit?.id);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("sale_price", salePrice);

    if (photo) formData.append("photo", photo);

    selectedBoutiques.forEach((id) => {
      formData.append("boutiques[]", id);
    });

    if (isEdit) {
      formData.append("_method", "PUT");
      Inertia.post(route("produits.update", produit.id), formData);
    } else {
      Inertia.post(route("produits.store"), formData);
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

            {/* Nom */}
            <TextField
              label="Nom du produit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            {/* Prix */}
            <TextField
              label="Prix de vente"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
              fullWidth
            />

            {/* Sélection boutiques */}
            <FormControl fullWidth>
              <InputLabel>Boutiques</InputLabel>
              <Select
                multiple
                value={selectedBoutiques}
                onChange={(e) => setSelectedBoutiques(e.target.value)}
                renderValue={(selected) =>
                  boutiques
                    .filter((b) => selected.includes(b.id))
                    .map((b) => b.name)
                    .join(", ")
                }
              >
                {boutiques.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    <Checkbox checked={selectedBoutiques.includes(b.id)} />
                    <ListItemText primary={b.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Upload photo */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setPhoto(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />

            {preview && (
              <img
                src={preview}
                style={{ width: 150, borderRadius: 10, marginTop: 10 }}
              />
            )}

            {/* Boutons */}
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
