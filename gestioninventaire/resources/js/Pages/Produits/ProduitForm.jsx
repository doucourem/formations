import React, { useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogContent,
  IconButton,
  Fade,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function ProduitForm({ produit, boutiques }) {
  const isEdit = Boolean(produit?.id);

  const form = useForm({
    name: produit?.name ?? "",
    description: produit?.description ?? "",
    sale_price: produit?.sale_price ?? "",
    photo: null,
    boutiques: produit?.boutiques?.map((b) => b.id) ?? [],
  });

  const [preview, setPreview] = useState(
    produit?.photo ? `/storage/${produit.photo}` : null
  );
  const [uploadError, setUploadError] = useState("");
  const [openZoom, setOpenZoom] = useState(false);
  const [scale, setScale] = useState(1);

  const imageRef = useRef(null);

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
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject();
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

  // Prévisualisation
  useEffect(() => {
    if (form.data.photo) {
      const url = URL.createObjectURL(form.data.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (produit?.photo) {
      setPreview(`/storage/${produit.photo}`);
    } else {
      setPreview(null);
    }
  }, [form.data.photo, produit?.photo]);

  // Zoom
  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => clamp(prev + delta, MIN_ZOOM, MAX_ZOOM));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  form.clearErrors();

  let hasError = false;
  if (!form.data.name.trim()) {
    form.setError("name", "Nom obligatoire");
    hasError = true;
  }
  if (!form.data.sale_price || Number(form.data.sale_price) <= 0) {
    form.setError("sale_price", "Prix invalide");
    hasError = true;
  }
  if (hasError) return;

  const formData = new FormData();
  formData.append("name", form.data.name);
  formData.append("description", form.data.description);
  formData.append("sale_price", form.data.sale_price);

  form.data.boutiques.forEach((id) => formData.append("boutiques[]", id));

  if (form.data.photo) formData.append("photo", form.data.photo);
  if (isEdit) formData.append("_method", "PUT");

  await router.post(
    isEdit ? route("produits.update", produit.id) : route("produits.store"),
    formData,
    { forceFormData: true }
  );
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
            {form.errors.global && (
              <Typography color="error" mb={2}>
                {form.errors.global}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Nom du produit"
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  fullWidth
                  error={!!form.errors.name}
                  helperText={form.errors.name}
                />

                <TextField
                  label="Prix de vente"
                  type="number"
                  value={form.data.sale_price}
                  onChange={(e) => form.setData("sale_price", e.target.value)}
                  fullWidth
                  error={!!form.errors.sale_price}
                  helperText={form.errors.sale_price}
                />

                <TextField
                  label="Description"
                  value={form.data.description}
                  onChange={(e) => form.setData("description", e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
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

                {/* Image upload / modifier / supprimer */}
                <input
                  id="photoInput"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async (e) => {
                    setUploadError("");
                    form.clearErrors("photo");
                    const file = e.target.files?.[0];
                    if (!file) return form.setData("photo", null);
                    if (file.size > 10 * 1024 * 1024) {
                      setUploadError("La taille de l'image ne doit pas dépasser 10 MB");
                      return form.setData("photo", null);
                    }
                    try {
                      const resized = await handleImageResize(file);
                      form.setData("photo", resized);
                    } catch {
                      setUploadError("Erreur lors du traitement de l'image.");
                      form.setData("photo", null);
                    }
                  }}
                />

                {!preview && (
                  <Box textAlign="center">
                    <IconButton
                      sx={{
                        border: "2px dashed #90caf9",
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        transition: "transform 0.2s",
                        "&:active": { transform: "scale(0.95)" },
                      }}
                      onClick={() => document.getElementById("photoInput").click()}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                    <Typography variant="caption" display="block" mt={1}>
                      Ajouter une image
                    </Typography>
                  </Box>
                )}

                {preview && (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      borderRadius: 3,
      overflow: "hidden",
      cursor: "pointer",
    }}
    onClick={() => setOpenZoom(true)} // Clic sur l'image ouvre le zoom
  >
    <img
      src={preview}
      alt="preview"
      style={{
        width: "100%",
        maxHeight: 220,
        objectFit: "cover",
        transition: "transform 0.3s",
      }}
    />
    {/* Actions en haut à droite */}
    <Box
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        display: "flex",
        gap: 1,
      }}
    >
      <IconButton
        color="primary"
        sx={{ bgcolor: "white" }}
        onClick={(e) => {
          e.stopPropagation(); // Empêche le zoom
          document.getElementById("photoInput").click();
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        color="error"
        sx={{ bgcolor: "white" }}
        onClick={(e) => {
          e.stopPropagation();
          setPreview(null);
          form.setData("photo", null);
        }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  </Box>
)}


                <Button type="submit" variant="contained">
                  {isEdit ? "Mettre à jour" : "Créer"}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Zoom Dialog */}
      <Dialog
        open={openZoom}
        onClose={() => setOpenZoom(false)}
        maxWidth="xl"
        PaperProps={{ onClick: (e) => e.stopPropagation() }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          onClick={() => setOpenZoom(false)}
        >
          <img
            ref={imageRef}
            src={preview}
            alt="Zoom"
            onWheel={handleWheelZoom}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              transform: `scale(${scale})`,
              transition: "transform 0.1s",
              borderRadius: 12,
              cursor: "grab",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </GuestLayout>
  );
}
