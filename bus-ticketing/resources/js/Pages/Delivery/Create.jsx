import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

export default function DeliveryCreate({ vehicles, drivers }) {
  const [form, setForm] = useState({
    vehicle_id: "",
    driver_id: "",
    product_name: "",
    product_lot: "",
    quantity_loaded: "",
    distance_km: "",
    price: "",
    departure_at: "",
    arrival_at: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Debug (optionnel)
    console.log("Form envoyé :", form);

    Inertia.post(route("deliveries.store"), {
      ...form,
      quantity_loaded: Number(form.quantity_loaded),
      distance_km: Number(form.distance_km),
      price: Number(form.price),
    });
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Créer une livraison 🚛</Typography>}
        />

        <CardContent>
          <Box
            component="form"
            display="grid"
            gap={2}
            onSubmit={handleSubmit}
          >
            {/* Véhicule */}
            <TextField
              select
              label="Véhicule"
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleChange}
              required
            >
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.registration_number} ({v.model})
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
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.first_name} {d.last_name}
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
              label="Lot / Référence"
              name="product_lot"
              value={form.product_lot}
              onChange={handleChange}
            />

            {/* Quantité */}
            <TextField
              label="Quantité chargée"
              type="number"
              name="quantity_loaded"
              value={form.quantity_loaded}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />

            {/* Distance */}
            <TextField
              label="Distance (km)"
              type="number"
              name="distance_km"
              value={form.distance_km}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />

            {/* Prix */}
            <TextField
              label="Prix (CFA)"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />

            {/* Départ */}
            <TextField
              type="datetime-local"
              label="Départ"
              name="departure_at"
              value={form.departure_at}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />

            {/* Arrivée */}
            <TextField
              type="datetime-local"
              label="Arrivée prévue"
              name="arrival_at"
              value={form.arrival_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <Button type="submit" variant="contained" color="primary">
              Enregistrer la livraison
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
