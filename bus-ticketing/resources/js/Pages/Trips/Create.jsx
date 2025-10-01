import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
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
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import GuestLayout from '@/Layouts/GuestLayout';
export default function CreateTripWithStops({ routes, buses }) {
  const [form, setForm] = useState({
    route_id: '',
    bus_id: '',
    departure_at: '',
    arrival_at: '',
    base_price: '',
    seats_available: '',
    stops: [''], // tableau pour les arrêts intermédiaires
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]:
        type === 'number' || name === 'base_price' || name === 'seats_available'
          ? Number(value)
          : value,
    });
  };

  const handleStopChange = (index, value) => {
    const newStops = [...form.stops];
    newStops[index] = value;
    setForm({ ...form, stops: newStops });
  };

  const addStop = () => {
    setForm({ ...form, stops: [...form.stops, ''] });
  };

  const removeStop = (index) => {
    const newStops = form.stops.filter((_, i) => i !== index);
    setForm({ ...form, stops: newStops });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('trips.store'), form);
  };

  return (
        <GuestLayout>
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Créer un trajet avec arrêts
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Select Route */}
        <FormControl fullWidth required>
          <InputLabel id="route-label">Route</InputLabel>
          <Select
            labelId="route-label"
            name="route_id"
            value={form.route_id}
            label="Route"
            onChange={handleChange}
          >
            {routes.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.departureCity?.name || '-'} → {r.arrivalCity?.name || '-'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select Bus */}
        <FormControl fullWidth required>
          <InputLabel id="bus-label">Bus</InputLabel>
          <Select
            labelId="bus-label"
            name="bus_id"
            value={form.bus_id}
            label="Bus"
            onChange={handleChange}
          >
            {buses.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name || `Bus #${b.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

          {form.stops.map((stop, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                label={`Arrêt #${index + 1}`}
                value={stop}
                onChange={(e) => handleStopChange(index, e.target.value)}
                fullWidth
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

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addStop}
            sx={{ mt: 1 }}
          >
            Ajouter un arrêt
          </Button>
        </Box>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Créer le trajet
        </Button>
      </Box>
    </Box>
        </GuestLayout>
  );
}
