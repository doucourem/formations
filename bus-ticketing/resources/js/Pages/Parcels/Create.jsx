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

export default function Create({ trips, agencies }) {
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
    merchandise_value: "", // ✅ valeur marchandise
    price: "",              // ✅ prix transport
    payment_method: "",
    parcel_image: null,
    status: "pending",
    departure_agency_id: "",
    arrival_agency_id: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: ["price", "merchandise_value", "weight_kg"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Format non supporté (JPG / PNG uniquement)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Image trop lourde (max 20 Mo)");
      return;
    }

    setForm({ ...form, parcel_image: file });

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.departure_agency_id === form.arrival_agency_id) {
      alert("Les agences de départ et d'arrivée doivent être différentes");
      return;
    }

    if (form.weight_kg <= 0) {
      alert("Le poids doit être supérieur à 0");
      return;
    }

    if (form.merchandise_value <= 0) {
      alert("La valeur de la marchandise est obligatoire");
      return;
    }

    if (form.price <= 0) {
      alert("Le prix du transport est invalide");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) data.append(key, form[key]);
    });

    Inertia.post(route("parcels.store"), data);
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Créer un colis 📦</Typography>}
        />
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
                {Array.isArray(trips) &&
                  trips.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {`${t.route?.departureCity || "-"} → ${
                        t.route?.arrivalCity|| "-"
                      } (Départ ${t.departure_at})`}
                    </MenuItem>
                  ))}
              </TextField>

              {/* Agences */}
              <TextField
                select
                label="Agence de départ"
                name="departure_agency_id"
                value={form.departure_agency_id}
                onChange={handleChange}
                required
              >
                {agencies.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Agence d'arrivée"
                name="arrival_agency_id"
                value={form.arrival_agency_id}
                onChange={handleChange}
                required
              >
                {agencies
                  .filter((a) => a.id !== form.departure_agency_id)
                  .map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
              </TextField>

              {/* Tracking */}
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  label="Numéro de tracking"
                  value={form.tracking_number}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <IconButton
                  onClick={() =>
                    setForm({ ...form, tracking_number: generateTracking() })
                  }
                >
                  <AutorenewIcon />
                </IconButton>
              </Box>

              {/* Expéditeur */}
              <Typography variant="h6">Expéditeur</Typography>
              <TextField
                label="Nom expéditeur"
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
                label="Nom destinataire"
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

              {/* Valeur marchandise */}
              <TextField
                label="Valeur de la marchandise (CFA)"
                name="merchandise_value"
                type="number"
                value={form.merchandise_value}
                onChange={handleChange}
                required
              />

              {/* Prix transport */}
              <TextField
                label="Prix du transport (CFA)"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
              />

              {/* Image */}
              <TextField
                type="file"
                label="Photo du colis"
                InputLabelProps={{ shrink: true }}
                onChange={handleFileChange}
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Aperçu colis"
                  style={{ maxHeight: 200, borderRadius: 8 }}
                />
              )}

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

              <Button type="submit" variant="contained">
                Enregistrer et payer
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
