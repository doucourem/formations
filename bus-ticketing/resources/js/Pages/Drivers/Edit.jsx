import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";

export default function Edit({ driver }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    birth_date: "",
    address: "",
    photo: null,
  });

  const [preview, setPreview] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (driver) {
      setForm({
        first_name: driver.first_name || "",
        last_name: driver.last_name || "",
        phone: driver.phone || "",
        email: driver.email || "",
        birth_date: driver.birth_date || "",
        address: driver.address || "",
        photo: null,
      });

      if (driver.photo) {
        setPreview(`/storage/${driver.photo}`);
      }
    }
  }, [driver]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setForm((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const payload = new FormData();
  Object.keys(form).forEach((key) => {
    payload.append(key, form[key] ?? "");
  });

  // ✅ Utiliser Inertia.put pour la mise à jour
  Inertia.put(`/drivers/${driver.id}`, payload, {
    forceFormData: true, // important pour l'upload de fichiers
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "Chauffeur mis à jour avec succès !",
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "Erreur durant la mise à jour.",
        severity: "error",
      });
    },
  });
};


  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Modifier Chauffeur</Typography>}
        />
        <CardContent>
          <Box
  component="form"
  encType="multipart/form-data"   // <-- AJOUT IMPORTANT
  onSubmit={handleSubmit}
  display="flex"
  flexDirection="column"
  gap={2}
>

            {/* PHOTO + PREVIEW */}
            <Box textAlign="center">
              <Avatar
                src={preview}
                sx={{ width: 120, height: 120, mx: "auto", mb: 1 }}
              />
              <Button variant="contained" component="label">
                Changer la photo
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>

            <TextField
              label="Prénom"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Nom"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Téléphone"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              fullWidth
            />

            <TextField
              label="Date de naissance"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.birth_date}
              onChange={(e) => handleChange("birth_date", e.target.value)}
              fullWidth
            />

            <TextField
              label="Adresse"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <Button type="submit" variant="contained" color="primary" size="large">
              Enregistrer les modifications
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GuestLayout>
  );
}
