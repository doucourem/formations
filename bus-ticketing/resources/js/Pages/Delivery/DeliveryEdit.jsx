import React, { useState } from "react";
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
  Divider,
} from "@mui/material";

export default function DeliveryEdit({ delivery, buses, drivers }) {
  const [form, setForm] = useState({
    vehicle_id: delivery.vehicle_id ?? "",
    driver_id: delivery.driver_id ?? "",

    client_name: delivery.client_name ?? "",
    departure_place: delivery.departure_place ?? "",
    arrival_place: delivery.arrival_place ?? "",

    product_name: delivery.product_name ?? "",
    product_lot: delivery.product_lot ?? "",
    quantity_loaded: delivery.quantity_loaded ?? "",
    quantity_delivered: delivery.quantity_delivered ?? "",
    distance_km: delivery.distance_km ?? "",
    price: delivery.price ?? "",

    departure_at: delivery.departure_at ?? "",
    arrival_at: delivery.arrival_at ?? "",
    status: delivery.status ?? "pending",
  });

  // ✅ Gestion propre des champs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: ["price", "quantity_loaded", "quantity_delivered", "distance_km"].includes(name)
        ? value === "" ? "" : Number(value)
        : value,
    }));
  };

  // ✅ Soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    Inertia.post(route("deliveries.update", delivery.id), {
      ...form,
      _method: "PUT",
    });
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Modifier la livraison 📦</Typography>}
        />

        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2.5}>

            {/* ================= Véhicule / Chauffeur ================= */}
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
                  {driver.first_name} {driver.last_name}
                </MenuItem>
              ))}
            </TextField>

            <Divider />

            {/* ================= Client / Itinéraire ================= */}
            <TextField
              label="Client"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              required
            />

            <TextField
              label="Lieu de départ"
              name="departure_place"
              value={form.departure_place}
              onChange={handleChange}
              required
            />

            <TextField
              label="Lieu d’arrivée"
              name="arrival_place"
              value={form.arrival_place}
              onChange={handleChange}
              required
            />

            <Divider />

            {/* ================= Marchandise ================= */}
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
              inputProps={{ min: 0 }}
              required
            />

            <TextField
              label="Quantité livrée"
              type="number"
              name="quantity_delivered"
              value={form.quantity_delivered}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            <Divider />

            {/* ================= Logistique ================= */}
            <TextField
              label="Distance (km)"
              type="number"
              name="distance_km"
              value={form.distance_km}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Prix (CFA)"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <Divider />

            {/* ================= Dates ================= */}
            <TextField
              type="datetime-local"
              label="Départ"
              name="departure_at"
              value={form.departure_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              type="datetime-local"
              label="Arrivée"
              name="arrival_at"
              value={form.arrival_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            {/* ================= Statut ================= */}
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

            {/* ================= Action ================= */}
            <Button type="submit" variant="contained" size="large">
              Enregistrer
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
