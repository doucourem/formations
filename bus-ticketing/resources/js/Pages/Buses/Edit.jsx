import React, { useState, useEffect } from 'react';
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

export default function Edit({ bus, agencies = [] }) {
  const [form, setForm] = useState({
    registration_number: '',
    model: '',
    capacity: '',
    status: 'active',
    agency_id: '',
  });

  // Initialiser le formulaire avec les données du bus
  useEffect(() => {
    if (bus) {
      setForm({
        registration_number: bus.registration_number || '',
        model: bus.model || '',
        capacity: bus.capacity || '',
        status: bus.status || 'active',
        agency_id: bus.agency_id || '',
      });
    }
  }, [bus]);

  if (!bus) {
    return <Typography>Chargement du bus...</Typography>;
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.registration_number || !form.model || !form.capacity || !form.agency_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

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

          <FormControl fullWidth required>
            <InputLabel>Agence</InputLabel>
            <Select
              name="agency_id"
              value={form.agency_id}
              onChange={handleChange}
            >
              {agencies.length > 0 ? (
                agencies.map((agency) => (
                  <MenuItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">Aucune agence disponible</MenuItem>
              )}
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary">
            Mettre à jour
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
