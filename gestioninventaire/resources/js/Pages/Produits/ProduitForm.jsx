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
  Card,
  CardContent,
  CardHeader,
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
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={isEdit ? "Modifier le produit" : "Créer un produit"}
            sx={{ bgcolor: "#f5f5f5", textAlign: "center" }}
          />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
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
                <Box>
                  <Typography variant="subtitle1" mb={1}>
                    Photo du produit
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 300,
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      border: "2px dashed #90caf9",
                      cursor: "pointer",
                      textAlign: "center",
                      position: "relative",
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                    onClick={() => document.getElementById("photoInput").click()}
                  >
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

                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: 220,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Box sx={{ p: 4 }}>
                        <Typography color="textSecondary">
                          Cliquer pour choisir une image
                        </Typography>
                        <Typography variant="caption">(JPEG, PNG, max 2MB)</Typography>
                      </Box>
                    )}

                    {preview && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhoto(null);
                          setPreview(null);
                        }}
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          minWidth: "unset",
                          padding: "4px 8px",
                          fontSize: "0.7rem",
                        }}
                      >
                        ✕
                      </Button>
                    )}
                  </Box>
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
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
