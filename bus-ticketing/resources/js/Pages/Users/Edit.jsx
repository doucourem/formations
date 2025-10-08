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

export default function Edit({ user, agences }) {
  const [form, setForm] = useState({
    prenom: user.prenom || "",
    name: user.name || "",
    email: user.email || "",
    password: "",
    password_confirmation: "",
    role: user.role || "",
    agence_id: user.agence_id || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route("users.update", user.id), form);
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
            Modifier l'utilisateur
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Prénom"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

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
              label="Mot de passe (laisser vide pour ne pas changer)"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Confirmer mot de passe"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              fullWidth
              margin="normal"
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

            {/* Sélecteur d'agence */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="agence-label">Agence</InputLabel>
              <Select
                labelId="agence-label"
                name="agence_id"
                value={form.agence_id}
                label="Agence"
                onChange={handleChange}
              >
                <MenuItem value="">Sélectionner une agence</MenuItem>
                {agences.map((agence) => (
                  <MenuItem key={agence.id} value={agence.id}>
                    {agence.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Mettre à jour
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
