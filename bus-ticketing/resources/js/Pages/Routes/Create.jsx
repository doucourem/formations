import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

export default function Create({ cities }) {
  const [form, setForm] = useState({
    departure_city_id: "",
    arrival_city_id: "",
    distance: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("routes.store"), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Créer un trajet
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Ville de départ */}
          <FormControl fullWidth>
            <InputLabel id="departure-label">Ville de départ</InputLabel>
            <Select
              labelId="departure-label"
              name="departure_city_id"
              value={form.departure_city_id}
              label="Ville de départ"
              onChange={handleChange}
              required
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ville d'arrivée */}
          <FormControl fullWidth>
            <InputLabel id="arrival-label">Ville d'arrivée</InputLabel>
            <Select
              labelId="arrival-label"
              name="arrival_city_id"
              value={form.arrival_city_id}
              label="Ville d'arrivée"
              onChange={handleChange}
              required
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Distance */}
          <TextField
            label="Distance (km)"
            name="distance"
            type="number"
            value={form.distance}
            onChange={handleChange}
            required
            inputProps={{ min: 0 }}
          />

          {/* Prix */}
          <TextField
            label="Prix (FCFA)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            inputProps={{ min: 0 }}
          />

          <Button type="submit" variant="contained" color="primary">
            Créer
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
