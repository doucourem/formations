import React from "react";
import { useForm } from "@inertiajs/react";
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

export default function Edit({ user, agences, flash }) {
  const { data, setData, put, processing, errors } = useForm({
    prenom: user.prenom || "",
    name: user.name || "",
    email: user.email || "",
    password: "",
    password_confirmation: "",
    role: user.role || "",
    agence_id: user.agence_id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("users.update", user.id));
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Modifier l'utilisateur
          </Typography>

          {/* Messages flash */}
          {flash?.success && <Box mb={2} sx={{ color: "green" }}>{flash.success}</Box>}
          {flash?.error && <Box mb={2} sx={{ color: "red" }}>{flash.error}</Box>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Prénom"
              name="prenom"
              value={data.prenom}
              onChange={(e) => setData("prenom", e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.prenom}
              helperText={errors.prenom}
            />

            <TextField
              label="Nom"
              name="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Mot de passe (laisser vide pour ne pas changer)"
              name="password"
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
            />

            <TextField
              label="Confirmer mot de passe"
              name="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation}
            />

            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel id="role-label">Rôle</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={data.role}
                label="Rôle"
                onChange={(e) => setData("role", e.target.value)}
              >
                 <MenuItem value="">Sélectionner un rôle</MenuItem>
                                <MenuItem value="admin">Administrateur</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="manageragence">Chef d'agence</MenuItem>
                                <MenuItem value="agent">Billetaire</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" error={!!errors.agence_id}>
              <InputLabel id="agence-label">Agence</InputLabel>
              <Select
                labelId="agence-label"
                name="agence_id"
                value={data.agence_id}
                label="Agence"
                onChange={(e) => setData("agence_id", e.target.value)}
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
              disabled={processing}
            >
              {processing ? "Mise à jour en cours..." : "Mettre à jour"}
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
