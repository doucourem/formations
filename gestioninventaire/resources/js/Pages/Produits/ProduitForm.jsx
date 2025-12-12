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

  // Fonction pour redimensionner l'image
  const handleImageResize = (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = width * ratio;
        height = height * ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Erreur de conversion de l'image"));
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.8
        );
      };

      img.onerror = () => reject(new Error("Impossible de charger l'image"));
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (form.data.photo) {
      const objectUrl = URL.createObjectURL(form.data.photo);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [form.data.photo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      form.put(route("produits.update", produit.id), { forceFormData: true });
    } else {
      form.post(route("produits.store"), { forceFormData: true });
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
                <TextField
                  label="Nom du produit"
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  required
                  fullWidth
                  error={!!form.errors.name}
                  helperText={form.errors.name}
                />

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
                      onChange={async (e) => {
                        if (!e.target.files[0]) return;
                        const file = e.target.files[0];

                        if (!file.type.startsWith("image/")) {
                          alert("Veuillez choisir une image valide (JPEG, PNG)");
                          return;
                        }

                        try {
                          const resizedFile = await handleImageResize(file, 800, 800);
                          form.setData("photo", resizedFile);
                        } catch (err) {
                          console.error(err);
                          alert("Erreur lors de la préparation de l'image");
                        }
                      }}
                    />

                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: 220,
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
                          pointerEvents: "auto",
                        }}
                      >
                        ✕
                      </Button>
                    )}
                  </Box>
                </Box>

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
