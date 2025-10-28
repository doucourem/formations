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
  Divider,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

export default function Edit({ routeData, cities }) {
  const [form, setForm] = useState({
    id: routeData.id,
    departure_city_id: routeData.departure_city_id || "",
    arrival_city_id: routeData.arrival_city_id || "",
    distance: routeData.distance || "",
    price: routeData.price || "",
    stops: routeData.stops || [],
  });

  /** 🔹 Gérer le changement des champs principaux */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || "" : value,
    }));
  };

  /** 🔹 Ajouter un nouvel arrêt (sans id => sera créé côté backend) */
  const handleAddStop = () => {
    setForm((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          id: null,
          city_id: "",
          to_city_id: "",
          order: prev.stops.length + 1,
          distance_from_start: "",
          partial_price: "",
        },
      ],
    }));
  };

  /** 🔹 Modifier un arrêt */
  const handleStopChange = (index, field, value) => {
    setForm((prev) => {
      const updatedStops = [...prev.stops];
      updatedStops[index][field] =
        ["order", "distance_from_start", "partial_price"].includes(field)
          ? Number(value) || ""
          : value;
      return { ...prev, stops: updatedStops };
    });
  };

  /** 🔹 Supprimer un arrêt (frontend seulement) */
  const handleRemoveStop = (index) => {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  /** 🔹 Soumettre la mise à jour */
  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route("busroutes.update", form.id), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Modifier le trajet
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* 🚌 Trajet principal */}
          <Typography variant="h6" mt={2}>
            Trajet principal
          </Typography>

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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Distance totale (km)"
              name="distance"
              type="number"
              value={form.distance}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              fullWidth
              required
            />

            <TextField
              label="Prix total (FCFA)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              fullWidth
              required
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* 🚏 Arrêts intermédiaires */}
          <Typography variant="h6">Arrêts intermédiaires</Typography>

          {form.stops.map((stop, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
                p: 1.5,
                border: "1px solid #ddd",
                borderRadius: 2,
              }}
            >
              {/* ID caché pour l’arrêt existant */}
              <input type="hidden" value={stop.id || ""} name={`stops[${index}][id]`} />

              <FormControl sx={{ flex: 1, minWidth: 140 }}>
                <InputLabel id={`from-${index}`}>Départ</InputLabel>
                <Select
                  labelId={`from-${index}`}
                  value={stop.city_id || ""}
                  label="Départ"
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

              <FormControl sx={{ flex: 1, minWidth: 140 }}>
                <InputLabel id={`to-${index}`}>Arrivée</InputLabel>
                <Select
                  labelId={`to-${index}`}
                  value={stop.to_city_id || ""}
                  label="Arrivée"
                  onChange={(e) =>
                    handleStopChange(index, "to_city_id", e.target.value)
                  }
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
                value={stop.distance_from_start || ""}
                onChange={(e) =>
                  handleStopChange(index, "distance_from_start", e.target.value)
                }
                sx={{ width: 160 }}
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Prix partiel (FCFA)"
                type="number"
                value={stop.partial_price || ""}
                onChange={(e) =>
                  handleStopChange(index, "partial_price", e.target.value)
                }
                sx={{ width: 160 }}
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Mettre à jour le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
