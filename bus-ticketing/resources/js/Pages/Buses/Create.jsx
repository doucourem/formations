import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

export default function Create({ agencies = [] }) {
  const [form, setForm] = useState({
    registration_number: '',
    model: '',
    capacity: '',
    status: 'active',
    agency_id: '',
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

    // Vérification des champs obligatoires
    if (!form.registration_number || !form.model || !form.capacity) {
      alert('Veuillez remplir tous les champs obligatoires bbb');
      return;
    }

    // Envoi via Inertia
    Inertia.post(route('buses.store'), form);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Créer un bus
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Numéro d'immatriculation"
            name="registration_number"
            value={form.registration_number}
            onChange={handleChange}
            required
          />

          <TextField
            label="Modèle"
            name="model"
            value={form.model}
            onChange={handleChange}
            required
          />

          <TextField
            label="Nombre de places"
            name="capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={handleChange}
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Statut</InputLabel>
            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary">
            Créer
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
