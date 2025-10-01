import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
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
      Inertia.put(route('tickets.update', ticket.id), form);
    } else {
      Inertia.post(route('tickets.store'), form);
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
          <TextField
            select
            label="Voyage"
            name="trip_id"
            value={form.trip_id}
            onChange={handleChange}
            required
          >
            {trips.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.route?.departureCity?.name || '-'} → {t.route?.arrivalCity?.name || '-'} ({t.departure_at})
              </MenuItem>
            ))}
          </TextField>

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

          <TextField
            select
            label="Statut"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <MenuItem value="booked">Réservé</MenuItem>
            <MenuItem value="paid">Payé</MenuItem>
            <MenuItem value="cancelled">Annulé</MenuItem>
          </TextField>

          <Button type="submit" variant="contained" color="success">
            {ticket?.id ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
