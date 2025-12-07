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
    payment_method: "",
    parcel_image: null,
    status: "pending", // valeur par défaut
  });

  const [imagePreview, setImagePreview] = useState(null);
  const PRICE_PER_KG = 12000;

  useEffect(() => {
    const weight = parseFloat(form.weight_kg) || 0;
    setForm((prev) => ({ ...prev, price: weight * PRICE_PER_KG }));
  }, [form.weight_kg]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

    if (!form.trip_id) {
      alert("Veuillez sélectionner un voyage.");
      return;
    }
    if (form.weight_kg <= 0) {
      alert("Le poids doit être supérieur à 0.");
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
                      {`${t.route?.departureCity?.name || "-"} → ${
                        t.route?.arrivalCity?.name || "-"
                      } (Départ ${t.departure_at})`}
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
