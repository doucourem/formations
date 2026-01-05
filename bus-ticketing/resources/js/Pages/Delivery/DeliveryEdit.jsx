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
} from "@mui/material";

export default function DeliveryEdit({ delivery, buses, drivers }) {
  const [form, setForm] = useState({
    vehicle_id: delivery.vehicle_id ?? "",
    driver_id: delivery.driver_id ?? "",
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

  // ✅ Gestion du changement de champ
 const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]:
      ["price","quantity_loaded","quantity_delivered","distance_km"].includes(name)
        ? value === "" ? "" : parseFloat(value)
        : value,
  }));
};


  // ✅ Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    Inertia.post(route("deliveries.update", delivery.id), {
      ...form,
      _method: "PUT",
    });
  };

  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Modifier la livraison 📦</Typography>}
        />

        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
            {/* Véhicule */}
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

            {/* Chauffeur */}
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

            {/* Produit */}
            <TextField
              label="Produit"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
            />

            {/* Lot */}
            <TextField
              label="Lot produit"
              name="product_lot"
              value={form.product_lot}
              onChange={handleChange}
            />

            {/* Quantité chargée */}
            <TextField
              label="Quantité chargée"
              type="number"
              name="quantity_loaded"
              value={form.quantity_loaded}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              required
            />

            {/* Quantité livrée */}
            <TextField
              label="Quantité livrée"
              type="number"
              name="quantity_delivered"
              value={form.quantity_delivered}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            {/* Distance */}
            <TextField
              label="Distance (km)"
              type="number"
              name="distance_km"
              value={form.distance_km}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            {/* ✅ Prix manuel */}
           <TextField
  label="Prix (CFA)"
  type="number"
  name="price"
  value={form.price}
  onChange={handleChange}
  required
  inputProps={{ min: 0, step: 0.01 }}
/>


            {/* Départ */}
            <TextField
              type="datetime-local"
              label="Départ"
              name="departure_at"
              value={form.departure_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Arrivée */}
            <TextField
              type="datetime-local"
              label="Arrivée"
              name="arrival_at"
              value={form.arrival_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            {/* Statut */}
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

            {/* Bouton submit */}
            <Button type="submit" variant="contained">
              Enregistrer
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
