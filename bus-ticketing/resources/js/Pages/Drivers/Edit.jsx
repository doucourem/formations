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
  // Protection si driver n'est pas encore chargé
  if (!driver) {
    return <GuestLayout><div>Chargement...</div></GuestLayout>;
  }

  // Formulaire
  const [form, setForm] = useState({
    first_name: driver.first_name || "",
    last_name: driver.last_name || "",
    phone: driver.phone || "",
    email: driver.email || "",
    birth_date: driver.birth_date || "",
    address: driver.address || "",
    photo: null,
  });

  // Preview photo
  const [preview, setPreview] = useState(driver.photo || null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Mise à jour des champs
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

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    Inertia.put(route("drivers.update", driver.id), payload, {
      forceFormData: true,
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: "Chauffeur mis à jour avec succès !",
          severity: "success",
        });
      },
      onError: (errors) => {
        const message = errors ? Object.values(errors).join(", ") : "Erreur lors de la mise à jour.";
        setSnackbar({
          open: true,
          message,
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
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {/* Photo + Preview */}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GuestLayout>
  );
}
