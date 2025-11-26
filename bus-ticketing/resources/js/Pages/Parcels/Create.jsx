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
  IconButton,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";

export default function Create({ trips }) {
  const generateTracking = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `COLIS-${date}-${rand}`;
  };

  const [form, setForm] = useState({
    trip_id: "",
    tracking_number: generateTracking(),
    sender_name: "",
    sender_phone: "",
    recipient_name: "",
    recipient_phone: "",
    weight_kg: "",
    description: "",
    price: "",
    start_stop_id: "",
    end_stop_id: "",
    status: "pending",
    payment_method: "", // 🔹 nouveau champ paiement
  });

  const PRICE_PER_KG = 1000;

  useEffect(() => {
    const weight = parseFloat(form.weight_kg) || 0;
    setForm((prev) => ({ ...prev, price: weight * PRICE_PER_KG }));
  }, [form.weight_kg]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("parcels.store"), form);
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader title={<Typography variant="h5">Créer un colis 📦</Typography>} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap={3}>

              {/* Voyage */}
              <TextField
                select
                label="Voyage"
                name="trip_id"
                value={form.trip_id}
                onChange={handleChange}
                required
              >
                {Array.isArray(trips) && trips.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {`${t.route?.departureCity?.name || '-'} → ${t.route?.arrivalCity?.name || '-'} (Départ ${t.departure_at})`}
                  </MenuItem>
                ))}
              </TextField>

              {/* Numéro de tracking */}
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  label="Numéro de Tracking"
                  name="tracking_number"
                  value={form.tracking_number}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <IconButton
                  onClick={() => setForm({ ...form, tracking_number: generateTracking() })}
                >
                  <AutorenewIcon />
                </IconButton>
              </Box>

              {/* Stops */}
              {trips.find(t => t.id === form.trip_id)?.route?.stops && (
                <>
                  <TextField
                    select
                    label="Stop de départ"
                    name="start_stop_id"
                    value={form.start_stop_id}
                    onChange={handleChange}
                    required
                  >
                    {trips.find(t => t.id === form.trip_id).route.stops.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.city?.name || '-'} → {s.toCity?.name || '-'}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Stop d'arrivée"
                    name="end_stop_id"
                    value={form.end_stop_id}
                    onChange={handleChange}
                    required
                  >
                    {trips.find(t => t.id === form.trip_id).route.stops.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.city?.name || '-'} → {s.toCity?.name || '-'}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}

              {/* Expéditeur */}
              <Typography variant="h6">Expéditeur</Typography>
              <TextField
                label="Nom de l'expéditeur"
                name="sender_name"
                value={form.sender_name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Téléphone expéditeur"
                name="sender_phone"
                value={form.sender_phone}
                onChange={handleChange}
                required
              />

              {/* Destinataire */}
              <Typography variant="h6">Destinataire</Typography>
              <TextField
                label="Nom du destinataire"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Téléphone destinataire"
                name="recipient_phone"
                value={form.recipient_phone}
                onChange={handleChange}
                required
              />

              {/* Poids */}
              <TextField
                label="Poids (kg)"
                type="number"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                required
              />

              {/* Description */}
              <TextField
                label="Description du colis"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={2}
              />

              {/* Montant calculé */}
              <TextField
                label="Montant (CFA)"
                name="price"
                type="number"
                value={form.price}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: "#f5f5f5" }}
              />

              {/* Paiement */}
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

              {/* Bouton submit */}
              <Button type="submit" variant="contained" color="primary">
                Enregistrer et payer
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
