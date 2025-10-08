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
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ routes = [], buses = [] }) {
  const [form, setForm] = useState({
    route_id: "",
    bus_id: "",
    departure_at: "",
    arrival_at: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.route_id || !form.bus_id || !form.departure_at || !form.arrival_at) {
      alert("Veuillez remplir les champs obligatoires : route, bus, heures de départ et d’arrivée.");
      return;
    }

    Inertia.post(route("trips.store"), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Créer un trajet
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

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Créer le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
