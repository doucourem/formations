import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import { Box, TextField, Button, MenuItem, Typography, Card, CardContent, Divider } from '@mui/material';

export default function Edit({ rental, vehicles }) {
  // 🔹 Helper pour formater les dates au format YYYY-MM-DDTHH:MM
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const iso = date.toISOString(); // ex: 2026-01-12T14:30:00.000Z
    return iso.slice(0, 16);        // YYYY-MM-DDTHH:MM
  };

  const [form, setForm] = useState({
    vehicle_id: rental.vehicle_id,
    client_name: rental.client_name,
    rental_price: rental.rental_price,
    rental_start: formatDateTimeLocal(rental.rental_start),
    rental_end: formatDateTimeLocal(rental.rental_end),
    status: rental.status,
    photo_before: null,
    photo_after: null,
  });

  const [previewBefore, setPreviewBefore] = useState(rental.photo_before_url);
  const [previewAfter, setPreviewAfter] = useState(rental.photo_after_url);

  // ✅ Gestion des changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ Gestion upload photo
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Format non supporté (JPG/PNG seulement)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop lourde (max 2 Mo)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'before') {
        setForm({ ...form, photo_before: file });
        setPreviewBefore(reader.result);
      } else {
        setForm({ ...form, photo_after: file });
        setPreviewAfter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ Soumission formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation date de fin > date de début
    if (form.rental_end <= form.rental_start) {
      alert('La date de fin doit être après la date de début !');
      return;
    }

    const data = new FormData();
    data.append('_method', 'PUT');
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) data.append(key, form[key]);
    });

    Inertia.post(route('vehicle-rentals.update', rental.id), data);
  };

  return (
    <GuestLayout>
      <Typography variant="h5" mb={2}>Modifier Location</Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
            {/* Véhicule */}
            <TextField select label="Véhicule" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
              {vehicles.map(v => (
                <MenuItem key={v.id} value={v.id}>{v.registration_number}</MenuItem>
              ))}
            </TextField>

            {/* Client et Prix */}
            <TextField label="Client" name="client_name" value={form.client_name} onChange={handleChange} required />
            <TextField label="Prix" name="rental_price" value={form.rental_price} onChange={handleChange} type="number" required />

            {/* Dates */}
            <TextField
              label="Début"
              type="datetime-local"
              name="rental_start"
              value={form.rental_start}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fin"
              type="datetime-local"
              name="rental_end"
              value={form.rental_end}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Photos avant/après */}
            <Box>
              <Typography>Photo avant la location</Typography>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'before')} />
              {previewBefore && <img src={previewBefore} alt="Avant" style={{ maxWidth: 200, marginTop: 5 }} />}
            </Box>

            <Box>
              <Typography>Photo après la location</Typography>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'after')} />
              {previewAfter && <img src={previewAfter} alt="Après" style={{ maxWidth: 200, marginTop: 5 }} />}
            </Box>

            {/* Statut */}
            <TextField select label="Statut" name="status" value={form.status} onChange={handleChange} required>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Terminée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" color="primary">Mettre à jour</Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
