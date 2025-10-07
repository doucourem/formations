import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
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

export default function Edit({ routeData, cities }) {
  const [form, setForm] = useState({
    departure_city_id: routeData.departure_city_id || "",
    arrival_city_id: routeData.arrival_city_id || "",
    distance: routeData.distance || "",
    price: routeData.price || "",
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
    Inertia.put(route("routes.update", routeData.id), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Modifier le trajet #{routeData.id}
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
            Mettre à jour
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
