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
  IconButton,
  Stack,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export default function Edit({ routeData, cities }) {
  const [form, setForm] = useState({
    departure_city_id: routeData.departure_city_id || "",
    arrival_city_id: routeData.arrival_city_id || "",
    distance: routeData.distance || "",
    price: routeData.price || "",
    stops: routeData.stops || [], // arrêts existants
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...form.stops];
    updatedStops[index][field] =
      field === "order" || field === "distance_from_start" || field === "partial_price"
        ? Number(value)
        : value;
    setForm({ ...form, stops: updatedStops });
  };

  const addStop = () => {
    setForm({
      ...form,
      stops: [
        ...form.stops,
        {
          city_id: "",
          order: form.stops.length + 1,
          distance_from_start: "",
          partial_price: "",
        },
      ],
    });
  };

  const removeStop = (index) => {
    const updatedStops = form.stops.filter((_, i) => i !== index);
    setForm({ ...form, stops: updatedStops });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route("routes.update", routeData.id), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Modifier le trajet #{routeData.id}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {/* --- DÉPART / ARRIVÉE --- */}
          <Stack spacing={2}>
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
              label="Distance (km)"
              name="distance"
              type="number"
              value={form.distance}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Prix total (FCFA)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />
          </Stack>

          {/* --- ARRÊTS INTERMÉDIAIRES --- */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Points d'arrêt intermédiaires
            </Typography>

            {form.stops.map((stop, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Ville */}
                  <FormControl sx={{ flex: 2 }}>
                    <InputLabel id={`city-${index}`}>Ville</InputLabel>
                    <Select
                      labelId={`city-${index}`}
                      value={stop.city_id}
                      label="Ville"
                      onChange={(e) =>
                        handleStopChange(index, "city_id", e.target.value)
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

                  {/* Ordre */}
                  <TextField
                    label="Ordre"
                    type="number"
                    value={stop.order}
                    onChange={(e) =>
                      handleStopChange(index, "order", e.target.value)
                    }
                    sx={{ width: 100 }}
                  />

                  {/* Distance */}
                  <TextField
                    label="Distance (km)"
                    type="number"
                    value={stop.distance_from_start || ""}
                    onChange={(e) =>
                      handleStopChange(index, "distance_from_start", e.target.value)
                    }
                    sx={{ width: 120 }}
                  />

                  {/* Prix partiel */}
                  <TextField
                    label="Prix partiel"
                    type="number"
                    value={stop.partial_price || ""}
                    onChange={(e) =>
                      handleStopChange(index, "partial_price", e.target.value)
                    }
                    sx={{ width: 120 }}
                  />

                  {/* Supprimer */}
                  <IconButton
                    color="error"
                    onClick={() => removeStop(index)}
                    sx={{ mt: 1 }}
                  >
                    <Remove />
                  </IconButton>
                </Stack>
              </Box>
            ))}

            <Button
              variant="outlined"
              color="primary"
              startIcon={<Add />}
              onClick={addStop}
            >
              Ajouter un arrêt
            </Button>
          </Box>

          {/* --- SUBMIT --- */}
          <Button type="submit" variant="contained" color="success" size="large">
            Mettre à jour le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
