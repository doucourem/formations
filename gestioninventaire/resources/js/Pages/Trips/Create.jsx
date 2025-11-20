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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import GuestLayout from "@/Layouts/GuestLayout";

export default function CreateTrip({ routes = [], buses = [] }) {
  const [form, setForm] = useState({
    route_id: "",
    bus_id: "",
    departure_at: "",
    arrival_at: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Supprimer l'erreur si l'utilisateur corrige le champ
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationErrors = {};

    // Champs obligatoires
    if (!form.route_id) validationErrors.route_id = "La route est obligatoire.";
    if (!form.bus_id) validationErrors.bus_id = "Le bus est obligatoire.";
    if (!form.departure_at) validationErrors.departure_at = "La date de départ est obligatoire.";
    if (!form.arrival_at) validationErrors.arrival_at = "La date d’arrivée est obligatoire.";

    // Comparer les dates
    if (form.departure_at && form.arrival_at) {
      const departure = new Date(form.departure_at);
      const arrival = new Date(form.arrival_at);
      if (arrival <= departure) {
        validationErrors.arrival_at = "La date d’arrivée doit être après la date de départ.";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    Inertia.post(route("trips.store"), form, {
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
                <Typography variant="h5">Créer un nouveau trajet</Typography>
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
              {/* Route */}
              <FormControl fullWidth required error={!!errors.route_id}>
                <InputLabel>Route</InputLabel>
                <Select name="route_id" value={form.route_id} onChange={handleChange}>
                  <MenuItem value="">Choisir une route</MenuItem>
                  {routes.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.departure_city} → {r.arrival_city}
                    </MenuItem>
                  ))}
                </Select>
                {errors.route_id && (
                  <Typography color="error" variant="caption">{errors.route_id}</Typography>
                )}
              </FormControl>

              {/* Bus */}
              <FormControl fullWidth required error={!!errors.bus_id}>
                <InputLabel>Bus</InputLabel>
                <Select name="bus_id" value={form.bus_id} onChange={handleChange}>
                  <MenuItem value="">Choisir un bus</MenuItem>
                  {buses.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.registration_number} ({b.model}) — {b.capacity} places
                    </MenuItem>
                  ))}
                </Select>
                {errors.bus_id && (
                  <Typography color="error" variant="caption">{errors.bus_id}</Typography>
                )}
              </FormControl>

              {/* Dates */}
              <TextField
                label="Heure de départ"
                name="departure_at"
                type="datetime-local"
                value={form.departure_at}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.departure_at}
                helperText={errors.departure_at}
                required
              />

              <TextField
                label="Heure d’arrivée"
                name="arrival_at"
                type="datetime-local"
                value={form.arrival_at}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.arrival_at}
                helperText={errors.arrival_at}
                required
              />

              {/* Bouton */}
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Créer le trajet"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
