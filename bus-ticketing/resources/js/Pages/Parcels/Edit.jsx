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

export default function Edit({ parcel, trips, agencies }) {
  const [form, setForm] = useState({
    _method: "put",
    trip_id: parcel.trip_id,
    tracking_number: parcel.tracking_number,
    sender_name: parcel.sender_name,
    sender_phone: parcel.sender_phone || "", // ✅ correction
    recipient_name: parcel.recipient_name,
    recipient_phone: parcel.recipient_phone || "",
    weight_kg: parcel.weight_kg || "",
    merchandise_value: parcel.merchandise_value || "", // ✅ valeur marchandise
    price: parcel.price || "",                             // ✅ prix transport
    description: parcel.description || "",
    status: parcel.status,
    parcel_image: null,
    departure_agency_id: parcel.departure_agency_id || "",
    arrival_agency_id: parcel.arrival_agency_id || "",
  });

  const [imagePreview, setImagePreview] = useState(
    parcel.parcel_image ? `/storage/${parcel.parcel_image}` : null
  );

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

    if (file.size > 2 * 1024 * 1024) {
      alert("Image trop lourde (max 2 Mo)");
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

    Inertia.post(route("parcels.update", parcel.id), data);
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={
            <Typography variant="h5">
              Modifier le colis #{parcel.id} 📦
            </Typography>
          }
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
                {trips.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {`${t.route?.departureCity || "-"} → ${
                      t.route?.arrivalCity || "-"
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
              <TextField
                label="Numéro de tracking"
                value={form.tracking_number}
                disabled
                helperText="Le numéro de tracking ne peut pas être modifié"
              />

              {/* Expéditeur */}
              <Typography variant="h6">Expéditeur</Typography>
              <TextField
                label="Nom"
                name="sender_name"
                value={form.sender_name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Téléphone"
                name="sender_phone"
                value={form.sender_phone}
                onChange={handleChange}
                required
              />

              {/* Destinataire */}
              <Typography variant="h6">Destinataire</Typography>
              <TextField
                label="Nom"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Téléphone"
                name="recipient_phone"
                value={form.recipient_phone}
                onChange={handleChange}
                required
              />

              {/* Poids */}
              <TextField
                type="number"
                label="Poids (kg)"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                required
              />

              {/* Valeur marchandise */}
              <TextField
                type="number"
                label="Valeur de la marchandise (CFA)"
                name="merchandise_value"
                value={form.merchandise_value}
                onChange={handleChange}
                required
              />

              {/* Prix transport */}
              <TextField
                type="number"
                label="Prix du transport (CFA)"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />

              {/* Description */}
              <TextField
                multiline
                rows={3}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
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
                  alt="Aperçu"
                  style={{ maxHeight: 200, borderRadius: 8 }}
                />
              )}

              {/* Actions */}
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => window.history.back()}>
                  Annuler
                </Button>
                <Button variant="contained" type="submit">
                  Mettre à jour
                </Button>
              </Box>

            </Box>
          </form>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
