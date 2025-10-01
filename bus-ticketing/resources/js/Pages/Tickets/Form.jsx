import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

export default function TicketForm({ ticket, trips }) {
  const [form, setForm] = useState({
    trip_id: ticket?.trip_id || '',
    client_name: ticket?.client_name || '',
    client_nina: ticket?.client_nina || '',
    seat_number: ticket?.seat_number || '',
    price: ticket?.price || '',
    status: ticket?.status || 'booked',
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
    if (ticket?.id) {
      Inertia.put(route('ticket.update', ticket.id), form);
    } else {
      Inertia.post(route('ticket.store'), form);
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          {ticket?.id ? `Éditer le ticket #${ticket.id}` : 'Créer un ticket'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Voyage */}
          <FormControl fullWidth>
            <InputLabel id="trip-label">Voyage</InputLabel>
            <Select
              labelId="trip-label"
              name="trip_id"
              value={form.trip_id || ''}
              label="Voyage"
              onChange={handleChange}
              required
            >
              {trips.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {(t.route?.departureCity?.name || '-') +
                    ' → ' +
                    (t.route?.arrivalCity?.name || '-') +
                    ` (${t.departure_at})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Nom du client"
            name="client_name"
            value={form.client_name}
            onChange={handleChange}
            required
          />

          <TextField
            label="NINA"
            name="client_nina"
            value={form.client_nina}
            onChange={handleChange}
          />

          <TextField
            label="Siège"
            name="seat_number"
            value={form.seat_number}
            onChange={handleChange}
          />

          <TextField
            label="Prix"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
          />

          {/* Statut */}
          <FormControl fullWidth>
            <InputLabel id="status-label">Statut</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={form.status}
              label="Statut"
              onChange={handleChange}
              required
            >
              <MenuItem value="booked">Réservé</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="success">
            {ticket?.id ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
