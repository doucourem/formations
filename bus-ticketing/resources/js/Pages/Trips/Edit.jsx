import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

export default function Edit({ trip, routes, buses }) {
  const [form, setForm] = useState({
    route_id: trip.route_id || '',
    bus_id: trip.bus_id || '',
    departure_at: trip.departure_at || '',
    arrival_at: trip.arrival_at || '',
    base_price: trip.base_price || '',
    seats_available: trip.seats_available || ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route('trips.update', trip.id), form);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Éditer le trajet #{trip.id}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Sélecteur de route */}
        <FormControl fullWidth>
          <InputLabel id="route-label">Route</InputLabel>
          <Select
            labelId="route-label"
            name="route_id"
            value={form.route_id}
            onChange={handleChange}
            required
          >
            {routes.map(r => (
              <MenuItem key={r.id} value={r.id}>
                {r.departureCity?.name || '-'} → {r.arrivalCity?.name || '-'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sélecteur de bus */}
        <FormControl fullWidth>
          <InputLabel id="bus-label">Bus</InputLabel>
          <Select
            labelId="bus-label"
            name="bus_id"
            value={form.bus_id}
            onChange={handleChange}
            required
          >
            {buses.map(b => (
              <MenuItem key={b.id} value={b.id}>
                {b.name || b.id}
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
          label="Prix"
          name="base_price"
          type="number"
          value={form.base_price}
          onChange={handleChange}
          required
        />

        <TextField
          label="Places disponibles"
          name="seats_available"
          type="number"
          value={form.seats_available}
          onChange={handleChange}
          required
        />

        <Button type="submit" variant="contained" color="success">
          Mettre à jour
        </Button>
      </Box>
    </Box>
  );
}
