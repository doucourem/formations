import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';

export default function Edit({ bus, agencies }) {
  if (!bus) {
    return <Typography>Chargement du bus...</Typography>;
  }

  const [form, setForm] = useState({
    model: bus.model || '',
    seats: bus.seats || '',
    agency_id: bus.agency_id || '',
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
    Inertia.put(route('buses.update', bus.id), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Modifier le bus #{bus.id}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Modèle"
            name="model"
            placeholder="Modèle du bus"
            value={form.model}
            onChange={handleChange}
            required
          />

          <TextField
            label="Nombre de places"
            name="seats"
            type="number"
            min={1}
            placeholder="Nombre de places"
            value={form.seats}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="contained" color="primary">
            Mettre à jour
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
