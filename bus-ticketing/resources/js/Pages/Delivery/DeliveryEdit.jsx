import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";

export default function DeliveryEdit({ delivery, buses, drivers }) {
  const [form, setForm] = useState({
    vehicle_id: delivery.vehicle_id || "",
    driver_id: delivery.driver_id || "",
    product_name: delivery.product_name || "",
    product_lot: delivery.product_lot || "",
    quantity_loaded: delivery.quantity_loaded || 0,
    quantity_delivered: delivery.quantity_delivered || 0,
    distance_km: delivery.distance_km || 0,
    price: delivery.price || 0,
    departure_at: delivery.departure_at || "",
    arrival_at: delivery.arrival_at || "",
    status: delivery.status || "pending",
  });

  // Recalcul automatique du prix si tu veux
  const PRICE_PER_KM = 1200; // exemple
  useEffect(() => {
    const qty = parseFloat(form.quantity_loaded) || 0;
    const distance = parseFloat(form.distance_km) || 0;
    setForm((prev) => ({ ...prev, price: qty * distance * PRICE_PER_KM }));
  }, [form.quantity_loaded, form.distance_km]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });
    Inertia.post(route("deliveries.update", delivery.id), data, {
      _method: "PUT",
      onSuccess: () => alert("Livraison mise à jour avec succès !"),
    });
  };

  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader title={<Typography variant="h5">Modifier la livraison 📦</Typography>} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap={2}>
              <TextField
                select
                label="Véhicule"
                name="vehicle_id"
                value={form.vehicle_id}
                onChange={handleChange}
                required
              >
                {buses.map((bus) => (
                  <MenuItem key={bus.id} value={bus.id}>
                    {bus.registration_number} ({bus.vehicle_type || bus.model})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Chauffeur"
                name="driver_id"
                value={form.driver_id}
                onChange={handleChange}
                required
              >
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Produit"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
              />

              <TextField
                label="Lot produit"
                name="product_lot"
                value={form.product_lot}
                onChange={handleChange}
              />

              <TextField
                label="Quantité chargée"
                type="number"
                name="quantity_loaded"
                value={form.quantity_loaded}
                onChange={handleChange}
                required
              />

              <TextField
                label="Quantité livrée"
                type="number"
                name="quantity_delivered"
                value={form.quantity_delivered}
                onChange={handleChange}
              />

              <TextField
                label="Distance (km)"
                type="number"
                name="distance_km"
                value={form.distance_km}
                onChange={handleChange}
              />

              <TextField
                label="Prix (CFA)"
                type="number"
                name="price"
                value={form.price}
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Départ"
                type="datetime-local"
                name="departure_at"
                value={form.departure_at}
                onChange={handleChange}
                required
              />

              <TextField
                label="Arrivée"
                type="datetime-local"
                name="arrival_at"
                value={form.arrival_at}
                onChange={handleChange}
              />

              <TextField
                select
                label="Statut"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="in_transit">En transit</MenuItem>
                <MenuItem value="delivered">Livré</MenuItem>
              </TextField>

              <Button type="submit" variant="contained" color="primary">
                Enregistrer
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
