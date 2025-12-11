import React, { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
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
  const isEdit = Boolean(produit?.id);

  const form = useForm({
    name: produit?.name || "",
    sale_price: produit?.sale_price || "",
    photo: null,
    boutiques: produit?.boutiques?.map((b) => b.id) || [],
  });

  const [preview, setPreview] = useState(
    produit?.photo ? `/storage/${produit.photo}` : null
  );

  // Mettre à jour le preview si l'utilisateur choisit une nouvelle photo
  useEffect(() => {
    if (form.data.photo) {
      const objectUrl = URL.createObjectURL(form.data.photo);
      setPreview(objectUrl);

      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [form.data.photo]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      // PUT avec FormData pour le multipart
      form.put(route("produits.update", produit.id), {
        forceFormData: true,
      });
    } else {
      form.post(route("produits.store"), {
        forceFormData: true,
      });
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
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  required
                  fullWidth
                  error={!!form.errors.name}
                  helperText={form.errors.name}
                />

                {/* Prix */}
                <TextField
                  label="Prix de vente"
                  type="number"
                  value={form.data.sale_price}
                  onChange={(e) => form.setData("sale_price", e.target.value)}
                  required
                  fullWidth
                  error={!!form.errors.sale_price}
                  helperText={form.errors.sale_price}
                />

                {/* Boutiques */}
                <FormControl fullWidth>
                  <InputLabel>Boutiques</InputLabel>
                  <Select
                    multiple
                    value={form.data.boutiques}
                    onChange={(e) => form.setData("boutiques", e.target.value)}
                    renderValue={(selected) =>
                      boutiques
                        .filter((b) => selected.includes(b.id))
                        .map((b) => b.name)
                        .join(", ")
                    }
                  >
                    {boutiques.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        <Checkbox checked={form.data.boutiques.includes(b.id)} />
                        <ListItemText primary={b.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Photo */}
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
                        form.setData("photo", e.target.files[0]);
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
                        <Typography variant="caption">
                          (JPEG, PNG, max 2MB)
                        </Typography>
                      </Box>
                    )}

                    {preview && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          form.setData("photo", null);
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
                    onClick={() => router.visit(route("produits.index"))}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={form.processing}
                  >
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
