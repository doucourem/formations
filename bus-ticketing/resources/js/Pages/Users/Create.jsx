import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
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
        <Box
          sx={{
            mt: 4,
            p: 3,
            boxShadow: 2,
            borderRadius: 2,
            bgcolor: "white",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Créer un utilisateur
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Confirmer mot de passe"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            {/* Sélecteur de rôle */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Rôle</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={form.role}
                label="Rôle"
                onChange={handleChange}
              >
                <MenuItem value="">Sélectionner un rôle</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="chauffeur">Chauffeur</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Créer
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
