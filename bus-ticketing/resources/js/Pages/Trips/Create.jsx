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
    stops: [
      { city_id: "", distance_from_start: "", partial_price: "" },
    ],
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val =
      type === "number" || ["base_price", "seats_available"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value;
    setForm({ ...form, [name]: val });
  };

  const handleStopChange = (index, field, value) => {
    const updated = [...form.stops];
    updated[index][field] = value;
    setForm({ ...form, stops: updated });
  };

  const addStop = () => {
    setForm({
      ...form,
      stops: [
        ...form.stops,
        { city_id: "", distance_from_start: "", partial_price: "" },
      ],
    });
  };

  const removeStop = (index) => {
    const updated = form.stops.filter((_, i) => i !== index);
    setForm({ ...form, stops: updated });
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
              {routes.length > 0 ? (
                routes.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {(r.departure_city || "-") +
                      " → " +
                      (r.arrival_city|| "-")}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">Aucune route disponible</MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Bus */}
          <FormControl fullWidth required>
            <InputLabel>Bus</InputLabel>
            <Select name="bus_id" value={form.bus_id} onChange={handleChange}>
              {buses.length > 0 ? (
                buses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.registration_number} ({b.model}) – {b.capacity} places
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">Aucun bus disponible</MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Dates */}
          <TextField
            label="Départ"
            name="departure_at"
            type="datetime-local"
            value={form.departure_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Arrivée"
            name="arrival_at"
            type="datetime-local"
            value={form.arrival_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* Prix et places */}
          <TextField
            label="Prix de base"
            name="base_price"
            type="number"
            value={form.base_price}
            onChange={handleChange}
            inputProps={{ step: 0.01, min: 0 }}
            required
          />
          <TextField
            label="Places disponibles"
            name="seats_available"
            type="number"
            value={form.seats_available}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            required
          />

          {/* Arrêts intermédiaires */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Arrêts intermédiaires
            </Typography>

            <Stack spacing={2}>
              {form.stops.map((stop, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Ville</InputLabel>
                    <Select
                      value={stop.city_id}
                      onChange={(e) =>
                        handleStopChange(index, "city_id", e.target.value)
                      }
                    >
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
                    sx={{ width: 120 }}
                  />

                  <TextField
                    label="Prix partiel (FCFA)"
                    type="number"
                    value={stop.partial_price}
                    onChange={(e) =>
                      handleStopChange(index, "partial_price", e.target.value)
                    }
                    sx={{ width: 140 }}
                  />

                  <IconButton
                    color="error"
                    onClick={() => removeStop(index)}
                    disabled={form.stops.length === 1}
                  >
                    <Remove />
                  </IconButton>
                </Box>
              ))}
            </Stack>

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
