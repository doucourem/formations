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
  IconButton,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";

export default function Create({ trips = [], agencies = [] }) {

  const generateTracking = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const time = Date.now().toString().slice(-4);
    return `COL-${date}-${rand}${time}`;
  };

  const [form, setForm] = useState({
    trip_id: "", // 👈 optionnel
    tracking_number: generateTracking(),
    sender_name: "",
    sender_phone: "",
    recipient_name: "",
    recipient_phone: "",
    weight_kg: "",
    description: "",
    merchandise_value: "",
    price: "",
    payment_method: "",
    parcel_image: null,
    status: "pending",
    departure_agency_id: "",
    arrival_agency_id: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Format non supporté (JPG / PNG)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Image trop lourde (max 20 Mo)");
      return;
    }

    setForm((prev) => ({ ...prev, parcel_image: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {

    if (form.departure_agency_id === form.arrival_agency_id)
      return "Les agences doivent être différentes";

    if (!form.weight_kg || Number(form.weight_kg) <= 0)
      return "Poids invalide";

    if (!form.merchandise_value || Number(form.merchandise_value) <= 0)
      return "Valeur marchandise obligatoire";

    if (!form.price || Number(form.price) <= 0)
      return "Prix transport invalide";

    if (!form.sender_phone || form.sender_phone.length < 8)
      return "Téléphone expéditeur invalide";

    if (!form.recipient_phone || form.recipient_phone.length < 8)
      return "Téléphone destinataire invalide";

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "")
        data.append(key, value);
    });

    Inertia.post(route("parcels.store"), data, {
      forceFormData: true,
    });
  };

  const formInvalid = validate() !== null;

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader title={<Typography variant="h5">Créer un colis 📦</Typography>} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap={3}>

              {/* Voyage OPTIONNEL */}
              <TextField
                select
                label="Voyage (optionnel)"
                name="trip_id"
                value={form.trip_id}
                onChange={handleChange}
              >
                <MenuItem value="">Aucun voyage</MenuItem>
                {trips.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {`${t.route?.departureCity || "-"} → ${t.route?.arrivalCity || "-"} (${t.departure_at})`}
                  </MenuItem>
                ))}
              </TextField>

              {/* Agences */}
              <TextField
                select
                label="Agence départ"
                name="departure_agency_id"
                value={form.departure_agency_id}
                onChange={handleChange}
                required
              >
                {agencies.map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Agence arrivée"
                name="arrival_agency_id"
                value={form.arrival_agency_id}
                onChange={handleChange}
                required
              >
                {agencies
                  .filter((a) => a.id !== form.departure_agency_id)
                  .map((a) => (
                    <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                  ))}
              </TextField>

              {/* Tracking */}
              <Box display="flex" gap={1}>
                <TextField
                  label="Tracking"
                  value={form.tracking_number}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <IconButton
                  onClick={() =>
                    setForm((p) => ({ ...p, tracking_number: generateTracking() }))
                  }
                >
                  <AutorenewIcon />
                </IconButton>
              </Box>

              <Typography variant="h6">Expéditeur</Typography>
              <TextField label="Nom" name="sender_name" value={form.sender_name} onChange={handleChange} required />
              <TextField label="Téléphone" name="sender_phone" value={form.sender_phone} onChange={handleChange} required />

              <Typography variant="h6">Destinataire</Typography>
              <TextField label="Nom" name="recipient_name" value={form.recipient_name} onChange={handleChange} required />
              <TextField label="Téléphone" name="recipient_phone" value={form.recipient_phone} onChange={handleChange} required />

              <TextField label="Poids (kg)" type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange} required />
              <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} />
              <TextField label="Valeur marchandise (CFA)" type="number" name="merchandise_value" value={form.merchandise_value} onChange={handleChange} required />
              <TextField label="Prix transport (CFA)" type="number" name="price" value={form.price} onChange={handleChange} required />

              <TextField type="file" InputLabelProps={{ shrink: true }} onChange={handleFileChange} />

              {imagePreview && (
                <img src={imagePreview} alt="Aperçu" style={{ maxHeight: 200, borderRadius: 8 }} />
              )}

              <TextField
                select
                label="Paiement"
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                required
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="orange_money">Orange Money</MenuItem>
                <MenuItem value="wave">Wave</MenuItem>
              </TextField>

              <Button type="submit" variant="contained" disabled={formInvalid}>
                Enregistrer et payer
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
