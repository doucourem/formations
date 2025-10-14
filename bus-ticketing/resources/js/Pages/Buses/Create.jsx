import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ agencies = [] }) {
  const [form, setForm] = useState({
    registration_number: "",
    model: "",
    capacity: "",
    status: "active",
    agency_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationErrors = {};
    if (!form.registration_number)
      validationErrors.registration_number = "Le numéro d’immatriculation est obligatoire.";
    if (!form.model) validationErrors.model = "Le modèle est obligatoire.";
    if (!form.capacity) validationErrors.capacity = "Le nombre de places est obligatoire.";
   
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    Inertia.post(route("buses.store"), form, {
      onFinish: () => setLoading(false),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <DirectionsBusIcon color="primary" />
                <Typography variant="h5">Créer un nouveau bus</Typography>
              </Stack>
            }
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Formulaire
              </Button>
            }
          />
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Numéro d’immatriculation */}
              <TextField
                label="Numéro d’immatriculation"
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                required
                error={!!errors.registration_number}
                helperText={errors.registration_number}
              />

              {/* Modèle */}
              <TextField
                label="Modèle"
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                error={!!errors.model}
                helperText={errors.model}
              />

              {/* Nombre de places */}
              <TextField
                label="Nombre de places"
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                required
                error={!!errors.capacity}
                helperText={errors.capacity}
              />

              {/* Statut */}
              <FormControl fullWidth required>
                <InputLabel>Statut</InputLabel>
                <Select name="status" value={form.status} onChange={handleChange}>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>

              {/* Agence */}
            

              {/* Bouton de soumission */}
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Créer le bus"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
