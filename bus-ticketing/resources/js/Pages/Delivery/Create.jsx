import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { Box, Card, CardHeader, CardContent, TextField, MenuItem, Button, Typography } from "@mui/material";

export default function DeliveryCreate({ vehicles, drivers, rate_per_km = 1000 }) {
  const [form, setForm] = useState({
    vehicle_id: "", driver_id: "", product_name: "", product_lot: "",
    quantity_loaded: "", distance_km: "", price: "", departure_at: "", arrival_at: ""
  });

  useEffect(() => {
    const distance = parseFloat(form.distance_km) || 0;
    const qty = parseFloat(form.quantity_loaded) || 0;
    setForm((prev) => ({ ...prev, price: distance * rate_per_km * qty }));
  }, [form.distance_km, form.quantity_loaded]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); Inertia.post(route("deliveries.store"), form); };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <CardHeader title={<Typography variant="h5">Créer une livraison 🚛</Typography>} />
        <CardContent>
          <Box component="form" display="grid" gap={2} onSubmit={handleSubmit}>
            <TextField select label="Véhicule" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
              {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.registration_number} ({v.model})</MenuItem>)}
            </TextField>

            <TextField select label="Chauffeur" name="driver_id" value={form.driver_id} onChange={handleChange} required>
              {drivers.map(d => <MenuItem key={d.id} value={d.id}>{d.first_name} ({d.last_name})</MenuItem>)}
            </TextField>

            <TextField label="Produit" name="product_name" value={form.product_name} onChange={handleChange} required />
            <TextField label="Lot / Référence" name="product_lot" value={form.product_lot} onChange={handleChange} />
            <TextField label="Quantité chargée" type="number" name="quantity_loaded" value={form.quantity_loaded} onChange={handleChange} required />
            <TextField label="Distance (km)" type="number" name="distance_km" value={form.distance_km} onChange={handleChange} required />
            <TextField label="Prix (CFA)" name="price" value={form.price} InputProps={{ readOnly: true }} />
            <TextField type="datetime-local" label="Départ" name="departure_at" value={form.departure_at} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
            <TextField type="datetime-local" label="Arrivée prévue" name="arrival_at" value={form.arrival_at} onChange={handleChange} InputLabelProps={{ shrink: true }} />

            <Button type="submit" variant="contained" color="primary">Enregistrer la livraison</Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
