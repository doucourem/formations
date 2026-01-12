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
  Divider,
} from "@mui/material";

export default function DeliveryCreate({ vehicles, drivers }) {
  const [form, setForm] = useState({
    vehicle_id: "",
    driver_id: "",
    payment_method: "",
    client_name: "",
    departure_place: "",
    arrival_place: "",
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

    Inertia.post(route("deliveries.store"), {
      ...form,
      quantity_loaded: Number(form.quantity_loaded),
      distance_km: Number(form.distance_km),
      price: Number(form.price),
    });
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3, mb: 4 }}>
        <CardHeader
          title={
            <Typography variant="h5">
              Créer une livraison 🚛
            </Typography>
          }
          subheader="Informations générales de la livraison"
        />

        <CardContent>
          <Box
            component="form"
            display="grid"
            gap={2.5}
            onSubmit={handleSubmit}
          >
            {/* ================= Véhicule & Chauffeur ================= */}
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

            <Divider sx={{ my: 2 }} />

            {/* ================= Client & Itinéraire ================= */}
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

            <Divider sx={{ my: 2 }} />

            {/* ================= Marchandise ================= */}
            <TextField
              label="Produit"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
            />

            <TextField
              label="Lot / Référence"
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
              inputProps={{ min: 0 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* ================= Logistique ================= */}
            <TextField
              label="Distance (km)"
              type="number"
              name="distance_km"
              value={form.distance_km}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Prix (CFA)"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* ================= Dates ================= */}
            <TextField
              type="datetime-local"
              label="Date & heure de départ"
              name="departure_at"
              value={form.departure_at}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="datetime-local"
              label="Date & heure d’arrivée prévue"
              name="arrival_at"
              value={form.arrival_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
     <TextField
                select
                label="Mode de paiement"
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                required
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="orange_money">Orange Money</MenuItem>
                <MenuItem value="wave">Wave</MenuItem>
              </TextField>
            {/* ================= Action ================= */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Enregistrer la livraison
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
