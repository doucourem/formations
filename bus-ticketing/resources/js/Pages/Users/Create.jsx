import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("users.store"), form);
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Créer un utilisateur
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField label="Nom" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Confirmer mot de passe" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Rôle" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal" />

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Créer
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
