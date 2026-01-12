import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import { Box, TextField, Button, MenuItem, Typography, Card, CardContent, Divider } from '@mui/material';

export default function Create({ vehicles }) {
  const [form, setForm] = useState({
    vehicle_id: '',
    client_name: '',
    rental_price: '',
    rental_start: '',
    rental_end: '',
    status: 'active',
    photo_before: null,
    photo_after: null,
  });

  const [previewBefore, setPreviewBefore] = useState(null);
  const [previewAfter, setPreviewAfter] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Format non supporté (JPG/PNG seulement)');
      return;
    }

    if (file.size > 20* 1024 * 1024) {
      alert('Image trop lourde (max 2 Mo)');
      return;
    }

    if (type === 'before') {
      setForm({ ...form, photo_before: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewBefore(reader.result);
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, photo_after: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAfter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) data.append(key, form[key]);
    });

    Inertia.post(route('vehicle-rentals.store'), data);
  };

  return (
    <GuestLayout>
      <Typography variant="h5" mb={2}>Nouvelle Location</Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
            <TextField select label="Véhicule" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
              {vehicles.map(v => (
                <MenuItem key={v.id} value={v.id}>{v.registration_number}</MenuItem>
              ))}
            </TextField>

            <TextField label="Client" name="client_name" value={form.client_name} onChange={handleChange} required />
            <TextField label="Prix" name="rental_price" value={form.rental_price} onChange={handleChange} type="number" required />
            <TextField label="Début" type="datetime-local" name="rental_start" value={form.rental_start} onChange={handleChange} required />
            <TextField label="Fin" type="datetime-local" name="rental_end" value={form.rental_end} onChange={handleChange} required />

            <Divider sx={{ my: 2 }} />

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

            <Button type="submit" variant="contained" color="primary">Enregistrer</Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
