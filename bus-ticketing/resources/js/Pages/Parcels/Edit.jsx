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

export default function Edit({ parcel, trips }) {
  const [form, setForm] = useState({
    _method: "put", 
    trip_id: parcel.trip_id,
    tracking_number: parcel.tracking_number,
    sender_name: parcel.sender_name,
    sender_phone: parcel.sender_phone || "",
    recipient_name: parcel.recipient_name,
    recipient_phone: parcel.recipient_phone || "",
    weight_kg: parcel.weight_kg,
    price: parcel.price || "",
    description: parcel.description || "",
    status: parcel.status,
    parcel_image: null, // Nouveau fichier sélectionné
  });

  // Aperçu image
  const [imagePreview, setImagePreview] = useState(parcel.parcel_image ? `/storage/${parcel.parcel_image}` : null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Gestion fichier image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Format non supporté (JPG/PNG seulement).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image trop lourde (max 2 Mo).");
      return;
    }

    setForm({ ...form, parcel_image: file });

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
          title={<Typography variant="h5">Modifier le colis #{parcel.id} 📦</Typography>}
        />

        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap={3}>
              {/* Voyage */}
              <TextField
                select
                label="Voyage (Trip)"
                name="trip_id"
                value={form.trip_id}
                onChange={handleChange}
                required
              >
                {trips.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.route?.departureCity?.name || 'Ville départ'} ➝ {t.route?.arrivalCity?.name || 'Ville arrivée'}
                  </MenuItem>
                ))}
              </TextField>

              {/* Numéro de Tracking */}
              <TextField
                label="Numéro de Tracking"
                name="tracking_number"
                value={form.tracking_number}
                disabled
                helperText="Le numéro de tracking ne peut pas être modifié."
              />

              {/* Expéditeur */}
              <TextField
                label="Nom de l'expéditeur"
                name="sender_name"
                value={form.sender_name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Téléphone de l'expéditeur"
                name="sender_phone"
                value={form.sender_phone}
                onChange={handleChange}
                required
              />

              {/* Destinataire */}
              <TextField
                label="Nom du destinataire"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Téléphone du destinataire"
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
                inputProps={{ min: "0", step: "any" }}
              />

              {/* Prix */}
              <TextField
                type="number"
                label="Prix de l'envoi"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                inputProps={{ min: "0", step: "0.01" }}
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

              {/* Image du colis */}
              <Box>
                <TextField
                  type="file"
                  label="Photo du colis"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleFileChange}
                />
                {imagePreview && (
                  <Box mt={1} display="flex" flexDirection="column" alignItems="center">
                    <img
                      src={imagePreview}
                      alt="Aperçu colis"
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                    />
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => {
                        setForm({ ...form, parcel_image: null });
                        setImagePreview(null);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Supprimer l’image
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Actions */}
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => window.history.back()}>
                  Annuler
                </Button>
                <Button variant="contained" type="submit" color="primary">
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
