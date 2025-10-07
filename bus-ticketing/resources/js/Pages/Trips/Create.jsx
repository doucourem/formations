import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ routes = [], buses = [], cities = [] }) {
  const [form, setForm] = useState({
    route_id: "",
    bus_id: "",
    departure_at: "",
    arrival_at: "",
    base_price: "",
    seats_available: "",
    stops: [{ city_id: "", distance_from_start: "", partial_price: "" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...form.stops];
    updatedStops[index][field] = value;
    setForm({ ...form, stops: updatedStops });
  };

  const addStop = () => {
    setForm({
      ...form,
      stops: [...form.stops, { city_id: "", distance_from_start: "", partial_price: "" }],
    });
  };

  const removeStop = (index) => {
    if (form.stops.length === 1) return;
    setForm({ ...form, stops: form.stops.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.route_id ||
      !form.bus_id ||
      !form.departure_at ||
      !form.arrival_at ||
      form.base_price === "" ||
      form.seats_available === ""
    ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    Inertia.post(route("trips.store"), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Créer un trajet avec arrêts
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Route */}
          <FormControl fullWidth required>
            <InputLabel>Route</InputLabel>
            <Select name="route_id" value={form.route_id} onChange={handleChange}>
              <MenuItem value="">Choisir une route</MenuItem>
              {routes.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.departure_city} → {r.arrival_city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Bus */}
          <FormControl fullWidth required>
            <InputLabel>Bus</InputLabel>
            <Select name="bus_id" value={form.bus_id} onChange={handleChange}>
              <MenuItem value="">Choisir un bus</MenuItem>
              {buses.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.registration_number} ({b.model}) — {b.capacity} places
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dates */}
          <TextField
            label="Heure de départ"
            name="departure_at"
            type="datetime-local"
            value={form.departure_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Heure d’arrivée"
            name="arrival_at"
            type="datetime-local"
            value={form.arrival_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* Prix & Places */}
          <TextField
            label="Prix de base (FCFA)"
            name="base_price"
            type="number"
            inputProps={{ step: 0.01, min: 0 }}
            value={form.base_price}
            onChange={handleChange}
            required
          />

          <TextField
            label="Places disponibles"
            name="seats_available"
            type="number"
            inputProps={{ min: 0 }}
            value={form.seats_available}
            onChange={handleChange}
            required
          />

          {/* Arrêts */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Arrêts intermédiaires
            </Typography>

            {form.stops.map((stop, index) => (
              <Stack key={index} direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Ville</InputLabel>
                  <Select
                    value={stop.city_id}
                    onChange={(e) => handleStopChange(index, "city_id", e.target.value)}
                  >
                    <MenuItem value="">Sélectionner une ville</MenuItem>
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Distance (km)"
                  type="number"
                  value={stop.distance_from_start}
                  onChange={(e) =>
                    handleStopChange(index, "distance_from_start", e.target.value)
                  }
                  sx={{ width: 130 }}
                />

                <TextField
                  label="Prix partiel (FCFA)"
                  type="number"
                  value={stop.partial_price}
                  onChange={(e) => handleStopChange(index, "partial_price", e.target.value)}
                  sx={{ width: 150 }}
                />

                <IconButton
                  color="error"
                  onClick={() => removeStop(index)}
                  disabled={form.stops.length === 1}
                >
                  <Remove />
                </IconButton>
              </Stack>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addStop}
              sx={{ mt: 1 }}
            >
              Ajouter un arrêt
            </Button>
          </Box>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Créer le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
