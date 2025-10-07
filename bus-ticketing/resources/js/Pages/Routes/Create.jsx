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
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

export default function Create({ cities }) {
  const [form, setForm] = useState({
    departure_city_id: "",
    arrival_city_id: "",
    distance: "",
    price: "",
    stops: [], // Liste des arrêts intermédiaires
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleAddStop = () => {
    setForm({
      ...form,
      stops: [
        ...form.stops,
        { city_id: "", order: form.stops.length + 1, distance_from_start: "", partial_price: "" },
      ],
    });
  };

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...form.stops];
    updatedStops[index][field] = field === "order" ? Number(value) : value;
    setForm({ ...form, stops: updatedStops });
  };

  const handleRemoveStop = (index) => {
    const updatedStops = form.stops.filter((_, i) => i !== index);
    setForm({ ...form, stops: updatedStops });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("routes.store"), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Créer un itinéraire
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

          {/* Distance totale */}
          <TextField
            label="Distance totale (km)"
            name="distance"
            type="number"
            value={form.distance}
            onChange={handleChange}
            required
            inputProps={{ min: 0 }}
          />

          {/* Prix total */}
          <TextField
            label="Prix total (FCFA)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            inputProps={{ min: 0 }}
          />

          {/* Arrêts intermédiaires */}
          <Typography variant="h6" mt={2}>
            Arrêts intermédiaires
          </Typography>

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
              <FormControl sx={{ flex: 1, minWidth: 150 }}>
                <InputLabel id={`city-${index}`}>Ville</InputLabel>
                <Select
                  labelId={`city-${index}`}
                  value={stop.city_id}
                  label="Ville"
                  onChange={(e) => handleStopChange(index, "city_id", e.target.value)}
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Ordre"
                type="number"
                value={stop.order}
                onChange={(e) => handleStopChange(index, "order", e.target.value)}
                sx={{ width: 90 }}
              />

              <TextField
                label="Distance (km)"
                type="number"
                value={stop.distance_from_start}
                onChange={(e) => handleStopChange(index, "distance_from_start", e.target.value)}
                sx={{ width: 120 }}
              />

              <TextField
                label="Prix partiel (FCFA)"
                type="number"
                value={stop.partial_price}
                onChange={(e) => handleStopChange(index, "partial_price", e.target.value)}
                sx={{ width: 150 }}
              />

              <IconButton color="error" onClick={() => handleRemoveStop(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Add />}
              onClick={handleAddStop}
            >
              Ajouter un arrêt
            </Button>
          </Stack>

          <Button type="submit" variant="contained" color="primary">
            Enregistrer l'itinéraire
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
