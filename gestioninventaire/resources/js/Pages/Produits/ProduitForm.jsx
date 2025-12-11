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
{/* Upload photo amélioré */}
<Box>
  <Typography variant="subtitle1" mb={1}>
    Photo du produit
  </Typography>

  <Box
    sx={{
      border: "2px dashed #ccc",
      borderRadius: 2,
      p: 2,
      textAlign: "center",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#f9f9f9" },
    }}
    onClick={() => document.getElementById("photoInput").click()}
  >
    <Typography color="textSecondary">
      Cliquer pour choisir une image
    </Typography>
    <Typography variant="caption">(JPEG, PNG, max 2MB)</Typography>

    <input
      id="photoInput"
      type="file"
      hidden
      accept="image/*"
      onChange={(e) => {
        if (!e.target.files[0]) return;

        const file = e.target.files[0];
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
      }}
    />
  </Box>

  {preview && (
    <Box
      mt={2}
      sx={{
        position: "relative",
        width: 180,
      }}
    >
      <img
        src={preview}
        alt="preview"
        style={{
          width: "100%",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      />

      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={() => {
          setPhoto(null);
          setPreview(null);
        }}
        sx={{ mt: 1, width: "100%" }}
      >
        Retirer la photo
      </Button>
    </Box>
  )}
</Box>


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
