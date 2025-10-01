import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create() {
  const [form, setForm] = useState({
    name: "",
    city: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("agencies.store"), form);
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Créer une Agence
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom de l'agence"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Ville"
              name="city"
              value={form.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Créer
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
