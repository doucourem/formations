import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
} from "@mui/material";

export default function Create({ vehicles, drivers }) {
  const { errors } = usePage().props;

  const [form, setForm] = useState({
    vehicle_id: "",
    driver_id: "",
    client_name: "",
    rental_price: "",
    rental_start: "",
    rental_end: "",
    departure_location: "",
    arrival_location: "",
    status: "active",
    photo_before: null,
    photo_after: null,
  });

  const [previewBefore, setPreviewBefore] = useState(null);
  const [previewAfter, setPreviewAfter] = useState(null);

  // Gestion des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Gestion des fichiers
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Format non supporté (JPG/PNG seulement)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image trop lourde (max 10 Mo)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      type === "before" ? setPreviewBefore(reader.result) : setPreviewAfter(reader.result);
    };
    reader.readAsDataURL(file);

    setForm({ ...form, [type === "before" ? "photo_before" : "photo_after"]: file });
  };

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.vehicle_id || !form.driver_id || !form.client_name) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        data.append(key, form[key]);
      }
    });

    Inertia.post(route("vehicle-rentals.store"), data);
  };

  return (
    <GuestLayout>
      <Typography variant="h5" mb={2}>
        Nouvelle location 🚗
      </Typography>

      <Card>
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
              error={!!errors.vehicle_id}
              helperText={errors.vehicle_id}
            >
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.registration_number}
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
              error={!!errors.driver_id}
              helperText={errors.driver_id}
            >
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.first_name} {d.last_name}
                </MenuItem>
              ))}
            </TextField>

            {/* Client */}
            <TextField
              label="Client"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              required
              error={!!errors.client_name}
              helperText={errors.client_name}
            />

            {/* Prix */}
            <TextField
              label="Prix de location (CFA)"
              name="rental_price"
              type="number"
              value={form.rental_price}
              onChange={handleChange}
              required
              error={!!errors.rental_price}
              helperText={errors.rental_price}
            />

            {/* Dates */}
            <TextField
              label="Début de location"
              type="datetime-local"
              name="rental_start"
              value={form.rental_start}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Fin de location"
              type="datetime-local"
              name="rental_end"
              value={form.rental_end}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Lieux */}
            <TextField
              label="Lieu de départ"
              name="departure_location"
              value={form.departure_location}
              onChange={handleChange}
              required
            />
            <TextField
              label="Lieu d’arrivée"
              name="arrival_location"
              value={form.arrival_location}
              onChange={handleChange}
              required
            />

            <Divider sx={{ my: 2 }} />

            {/* Photos */}
            <Box>
              <Typography>Photo avant la location</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "before")}
              />
              {previewBefore && (
                <img
                  src={previewBefore}
                  alt="Avant"
                  style={{ maxWidth: "100%", marginTop: 8, borderRadius: 8 }}
                />
              )}
            </Box>

            <Box>
              <Typography>Photo après la location</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "after")}
              />
              {previewAfter && (
                <img
                  src={previewAfter}
                  alt="Après"
                  style={{ maxWidth: "100%", marginTop: 8, borderRadius: 8 }}
                />
              )}
            </Box>

            {/* Statut */}
            <TextField
              select
              label="Statut"
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Terminée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
            </TextField>

            {/* Boutons */}
            <Stack direction="row" spacing={2} mt={2}>
              <Button type="submit" variant="contained" color="primary">
                Enregistrer
              </Button>
              <Button
                variant="outlined"
                onClick={() => Inertia.get(route("vehicle-rentals.index"))}
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
