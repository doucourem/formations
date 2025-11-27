import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { Card, CardContent, CardHeader, TextField, Button, Box, Typography } from "@mui/material";

export default function Edit({ driver }) {
  // Initialiser le formulaire avec les valeurs existantes du chauffeur
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (driver) {
      setForm({
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        phone: driver.phone || '',
        email: driver.email || ''
      });
    }
  }, [driver]);

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(`/drivers/${driver.id}`, form);
  }

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 500, mx: "auto", mt: 4, borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Modifier Chauffeur</Typography>}
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Prénom"
              value={form.first_name}
              onChange={e => setForm({ ...form, first_name: e.target.value })}
              variant="outlined"
              fullWidth
              required
            />
            <TextField
              label="Nom"
              value={form.last_name}
              onChange={e => setForm({ ...form, last_name: e.target.value })}
              variant="outlined"
              fullWidth
              required
            />
            <TextField
              label="Téléphone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              variant="outlined"
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              variant="outlined"
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Enregistrer les modifications
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
