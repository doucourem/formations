import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box, TextField, Button, MenuItem,
  Typography, Card, CardContent,
  Divider, Stack
} from "@mui/material";

export default function Edit({ rental, vehicles, drivers }) {
  const { errors } = usePage().props;

  const formatDateInput = (date) => (date ? new Date(date).toISOString().slice(0, 16) : "");

  const [form, setForm] = useState({
    vehicle_id: rental.vehicle_id,
    driver_id: rental.driver_id,
    client_name: rental.client_name,
    rental_price: rental.rental_price,
    rental_start: formatDateInput(rental.rental_start),
    rental_end: formatDateInput(rental.rental_end),
    departure_location: rental.departure_location || "",
    arrival_location: rental.arrival_location || "",
    status: rental.status || "active",
    photo_before: null,
    photo_after: null,
  });

  const [previewBefore, setPreviewBefore] = useState(rental.photo_before_url || null);
  const [previewAfter, setPreviewAfter] = useState(rental.photo_after_url || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Format non supporté (JPG/PNG seulement)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image trop lourde (max 2 Mo)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      type === "before" ? setPreviewBefore(reader.result) : setPreviewAfter(reader.result);
    };
    reader.readAsDataURL(file);

    setForm({ ...form, [type === "before" ? "photo_before" : "photo_after"]: file });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("_method", "PUT");

    Object.keys(form).forEach((key) => {
      if (form[key] !== null) data.append(key, form[key]);
    });

    Inertia.post(route("vehicle-rentals.update", rental.id), data);
  };

  return (
    <GuestLayout>
      <Typography variant="h5" mb={2}>Modifier la location 🚗</Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
            {/* Véhicule */}
            <TextField select label="Véhicule" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required error={!!errors.vehicle_id} helperText={errors.vehicle_id?.[0]}>
              {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.registration_number}</MenuItem>)}
            </TextField>

            {/* Chauffeur */}
            <TextField select label="Chauffeur" name="driver_id" value={form.driver_id} onChange={handleChange} required error={!!errors.driver_id} helperText={errors.driver_id?.[0]}>
              {drivers.map(d => <MenuItem key={d.id} value={d.id}>{d.first_name} {d.last_name}</MenuItem>)}
            </TextField>

            {/* Client */}
            <TextField label="Client" name="client_name" value={form.client_name} onChange={handleChange} required error={!!errors.client_name} helperText={errors.client_name?.[0]} />

            {/* Prix */}
            <TextField label="Prix de location (CFA)" name="rental_price" type="number" value={form.rental_price} onChange={handleChange} required error={!!errors.rental_price} helperText={errors.rental_price?.[0]} />

            {/* Dates */}
            <TextField label="Début de location" type="datetime-local" name="rental_start" value={form.rental_start} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
            <TextField label="Fin de location" type="datetime-local" name="rental_end" value={form.rental_end} onChange={handleChange} InputLabelProps={{ shrink: true }} required />

            {/* Lieux */}
            <TextField label="Lieu de départ" name="departure_location" value={form.departure_location} onChange={handleChange} required />
            <TextField label="Lieu d’arrivée" name="arrival_location" value={form.arrival_location} onChange={handleChange} required />

            <Divider sx={{ my: 2 }} />

            {/* Photos */}
            <Box>
              <Typography>Photo avant</Typography>
              <input type="file" accept="image/*" onChange={e => handleFileChange(e, "before")} />
              {previewBefore && <img src={previewBefore} alt="Avant" style={{ maxWidth: "100%", marginTop: 8, borderRadius: 8 }} />}
            </Box>

            <Box>
              <Typography>Photo après</Typography>
              <input type="file" accept="image/*" onChange={e => handleFileChange(e, "after")} />
              {previewAfter && <img src={previewAfter} alt="Après" style={{ maxWidth: "100%", marginTop: 8, borderRadius: 8 }} />}
            </Box>

            {/* Statut */}
            <TextField select label="Statut" name="status" value={form.status} onChange={handleChange} required>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Terminée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </TextField>

            {/* Boutons */}
            <Stack direction="row" spacing={2} mt={2}>
              <Button type="submit" variant="contained" color="primary">Mettre à jour</Button>
              <Button variant="outlined" onClick={() => Inertia.get(route("vehicle-rentals.index"))}>Annuler</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
