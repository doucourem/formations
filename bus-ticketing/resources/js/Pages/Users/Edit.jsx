import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Edit({ user }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
    password_confirmation: "",
    role: user.role || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route("users.update", user.id), form);
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Modifier l'utilisateur
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField label="Nom" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Mot de passe (laisser vide pour ne pas changer)" name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Confirmer mot de passe" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Rôle" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal" />

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Mettre à jour
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
