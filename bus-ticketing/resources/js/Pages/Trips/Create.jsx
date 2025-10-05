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
  Stack,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Create({ routes = [], buses = [] }) {
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
    let val = value;
    if (type === 'number' || ['base_price', 'seats_available'].includes(name)) {
      val = value === '' ? '' : Number(value);
    }
    setForm({ ...form, [name]: val });
  };

  const handleStopChange = (index, value) => {
    const newStops = [...form.stops];
    newStops[index] = value;
    setForm({ ...form, stops: newStops });
  };

  const addStop = () => setForm({ ...form, stops: [...form.stops, ''] });

  const removeStop = (index) => {
    if (form.stops.length > 1) {
      const newStops = form.stops.filter((_, i) => i !== index);
      setForm({ ...form, stops: newStops });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation simple
    if (
      !form.route_id ||
      !form.bus_id ||
      !form.departure_at ||
      !form.arrival_at ||
      form.base_price === '' ||
      form.seats_available === ''
    ) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    Inertia.post(route('trips.store'), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Créer un trajet avec arrêts
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Route */}
          <FormControl fullWidth required>
            <InputLabel>Route</InputLabel>
            <Select name="route_id" value={form.route_id} onChange={handleChange}>
              {routes.length > 0 ? (
                routes.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {(r.departure_city || '-') + ' → ' + (r.arrival_city || '-')}
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
                    {b.registration_number} ({b.model}) - {b.capacity} places
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

            <Stack spacing={1}>
              {form.stops.map((stop, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
            </Stack>

            <Button variant="outlined" startIcon={<Add />} onClick={addStop} sx={{ mt: 1 }}>
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
