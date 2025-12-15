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
  const isEdit = Boolean(produit?.id); // Détermine si c’est une édition

  const form = useForm({
    name: produit?.name ?? "",
    description: produit?.description ?? "",
    sale_price: produit?.sale_price ?? 0,
    photo: null,
    boutiques: produit?.boutiques?.map((b) => b.id) ?? [],
  });

  const [preview, setPreview] = useState(
    produit?.photo ? `/storage/${produit.photo}` : null
  );
  const [error, setError] = useState("");
  const [openZoom, setOpenZoom] = useState(false);
  const [scale, setScale] = useState(1);

  // Redimensionnement image avant upload
  const handleImageResize = (file, maxWidth = 800, maxHeight = 800) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width *= ratio;
        height *= ratio;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Erreur lors du traitement de l'image");
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.8
        );
      };
      img.onerror = reject;
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Preview image
  useEffect(() => {
    if (form.data.photo) {
      const objectUrl = URL.createObjectURL(form.data.photo);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [form.data.photo]);

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation côté client
    let hasError = false;
    if (!form.data.name.trim()) {
      form.setError("name", "Le nom du produit est obligatoire");
      hasError = true;
    } else form.setError("name", "");

    if (!form.data.sale_price || Number(form.data.sale_price) <= 0) {
      form.setError("sale_price", "Le prix doit être supérieur à 0");
      hasError = true;
    } else form.setError("sale_price", "");

    if (hasError) return;

    // Soumission Inertia
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
                {/* Nom */}
                <TextField
                  label="Nom du produit"
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
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
                  fullWidth
                  error={!!form.errors.sale_price}
                  helperText={form.errors.sale_price}
                />

                {/* Description */}
                <TextField
                  label="Description"
                  value={form.data.description}
                  onChange={(e) => form.setData("description", e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                />

                {/* Boutiques multi-select */}
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
                      border: "2px dashed #90caf9",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                    onClick={() => document.getElementById("photoInput").click()}
                  >
                    <input
                      id="photoInput"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={async (e) => {
                        setError("");
                        if (!e.target.files[0]) return;
                        const file = e.target.files[0];
                        if (file.size > 10 * 1024 * 1024) {
                          setError("Image max 10MB");
                          return;
                        }
                        try {
                          const resized = await handleImageResize(file);
                          form.setData("photo", resized);
                        } catch {
                          setError("Erreur image");
                        }
                      }}
                    />
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScale(1);
                          setOpenZoom(true);
                        }}
                        style={{
                          width: "100%",
                          maxHeight: 220,
                          objectFit: "cover",
                          cursor: "zoom-in",
                        }}
                      />
                    ) : (
                      <Box sx={{ p: 4 }}>
                        <Typography>Cliquer pour choisir une image</Typography>
                      </Box>
                    )}
                  </Box>
                  {error && (
                    <Typography color="error" variant="caption">
                      {error}
                    </Typography>
                  )}
                </Box>

                {/* Actions */}
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => router.visit(route("produits.index"))}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="contained" disabled={form.processing}>
                    {isEdit ? "Mettre à jour" : "Créer"}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Zoom Modal */}
      {openZoom && (
        <Box
          onClick={() => setOpenZoom(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <img
            src={preview}
            alt="Zoom"
            onWheel={handleWheelZoom}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              transform: `scale(${scale})`,
              transition: "transform 0.1s",
              borderRadius: 12,
              cursor: "grab",
            }}
          />
        </Box>
      )}
    </GuestLayout>
  );
}
