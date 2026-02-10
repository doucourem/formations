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
  Alert,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ agences, flash }) {
  const { data, setData, post, processing, errors } = useForm({
    prenom: "",
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
    agence_id: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("users.store"));
  };

  // Liste complète des profils
  const roles = [
    { value: "super_admin", label: "Super Administrateur" },
    { value: "admin", label: "Administrateur" },
    { value: "garage", label: "Garagiste" },
    { value: "manager", label: "Manager" },
    { value: "manageragence", label: "Chef d'agence" },
    { value: "agent", label: "Billetaire" },
    { value: "chauffeur", label: "Chauffeur" },
    { value: "logistique", label: "Responsable logistique" },
      { value: "etat", label: "Etat malien " },
  ];

  // Rôles qui doivent sélectionner une agence
  const rolesAvecAgence = ["manageragence", "agent","chauffeur","logistique","admin","super_admin"];

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Créer un utilisateur
          </Typography>

          {/* Messages flash */}
          {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
          {flash?.error && <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
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
              label="Mot de passe"
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

            {/* Sélection du rôle */}
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
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && <Typography color="error" variant="caption">{errors.role}</Typography>}
            </FormControl>

            {/* Sélection de l'agence si le rôle nécessite une agence */}
            {rolesAvecAgence.includes(data.role) && (
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
                {errors.agence_id && <Typography color="error" variant="caption">{errors.agence_id}</Typography>}
              </FormControl>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={processing}
            >
              {processing ? "Création en cours..." : "Créer"}
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
