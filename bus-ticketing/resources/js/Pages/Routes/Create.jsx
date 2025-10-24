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
    // Trajet principal
    departure_city_id: "",
    arrival_city_id: "",
    distance: "",
    price: "",
    // Arrêts intermédiaires (stops)
    stops: [],
  });

  /** 🔹 Gérer le changement de champ principal */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || "" : value,
    }));
  };

  /** 🔹 Ajouter un arrêt intermédiaire */
  const handleAddStop = () => {
    setForm((prev) => ({
      ...prev,
      stops: [
        ...form.stops,
        { city_id: "", order: form.stops.length + 1, distance_from_start: "", partial_price: "" },
      ],
    }));
  };

  /** 🔹 Modifier un arrêt existant */
  const handleStopChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.stops];
      updated[index][field] =
        field === "order" || field === "distance" || field === "price"
          ? Number(value) || ""
          : value;
      return { ...prev, stops: updated };
    });
  };

  /** 🔹 Supprimer un arrêt */
  const handleRemoveStop = (index) => {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  /** 🔹 Soumission du formulaire */
  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("busroutes.store"), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Créer un trajet principal
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* 🚌 Trajet principal */}
          <Typography variant="h6">Trajet principal</Typography>

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

          <TextField
            label="Distance totale (km)"
            name="distance"
            type="number"
            value={form.distance}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            required
          />

          <TextField
            label="Prix total (FCFA)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            required
          />

          {/* 🚏 Arrêts intermédiaires */}
          <Typography variant="h6" mt={3}>
            Arrêts intermédiaires (stops)
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
                  labelId={`to-${index}`}
                  value={stop.to_city_id}
                  label="Arrivée"
                  onChange={(e) =>
                    handleStopChange(index, "to_city_id", e.target.value)
                  }
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
                label="Distance (km)"
                type="number"
                value={stop.distance}
                onChange={(e) =>
                  handleStopChange(index, "distance", e.target.value)
                }
                sx={{ width: 120 }}
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Prix (FCFA)"
                type="number"
                value={stop.price}
                onChange={(e) =>
                  handleStopChange(index, "price", e.target.value)
                }
                sx={{ width: 120 }}
                inputProps={{ min: 0 }}
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

          {/* ✅ Soumission */}
          <Button type="submit" variant="contained" color="primary">
            Enregistrer le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
