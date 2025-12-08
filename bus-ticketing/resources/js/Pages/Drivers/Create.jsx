import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { useForm } from "@inertiajs/react";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert
} from "@mui/material";

export default function Create() {
  const {
    data,
    setData,
    post,
    processing,
    errors,
    recentlySuccessful
  } = useForm({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    birth_date: "",
    address: "",
    photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/drivers");
  };

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Ajouter un Chauffeur</Typography>}
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

            <TextField
              label="Prénom"
              value={data.first_name}
              onChange={(e) => setData("first_name", e.target.value)}
              error={!!errors.first_name}
              helperText={errors.first_name}
              fullWidth
            />

            <TextField
              label="Nom"
              value={data.last_name}
              onChange={(e) => setData("last_name", e.target.value)}
              error={!!errors.last_name}
              helperText={errors.last_name}
              fullWidth
            />

            <TextField
              label="Téléphone"
              value={data.phone}
              onChange={(e) => setData("phone", e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />

            <TextField
              label="Date de naissance"
              type="date"
              value={data.birth_date}
              onChange={(e) => setData("birth_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Adresse"
              value={data.address}
              onChange={(e) => setData("address", e.target.value)}
              fullWidth
              multiline
              rows={2}
            />

            <Button variant="contained" component="label">
              Photo du chauffeur
              <input
                type="file"
                hidden
                onChange={(e) => setData("photo", e.target.files[0])}
              />
            </Button>
            {errors.photo && (
              <Typography color="error" variant="body2">{errors.photo}</Typography>
            )}

            <Button type="submit" variant="contained" color="primary" disabled={processing}>
              Enregistrer
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar validation */}
      <Snackbar
        open={recentlySuccessful}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">Chauffeur ajouté avec succès !</Alert>
      </Snackbar>
    </GuestLayout>
  );
}
