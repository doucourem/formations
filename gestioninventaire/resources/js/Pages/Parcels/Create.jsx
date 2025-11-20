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

export default function Create({ trips }) {
  // 1. Mise à jour du state pour inclure le prix et les téléphones
  const [form, setForm] = useState({
    trip_id: "",
    tracking_number: "",
    sender_name: "",
    sender_phone: "", // Ajouté
    recipient_name: "",
    recipient_phone: "", // Ajouté
    weight_kg: "",
    description: "",
    price: "", // Ajouté
    status: "pending",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("parcels.store"), form);
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

              {/* Champ Voyage (Trip) */}
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
                    {(t.route?.departureCity?.name || "Départ non défini") +
                      " → " +
                      (t.route?.arrivalCity?.name || "Arrivée non définie") +
                      ` (Départ : ${t.departure_at})`}
                  </MenuItem>
                ))}
              </TextField>

              {/* Champ Numéro de Tracking */}
              <TextField
                label="Numéro de Tracking"
                name="tracking_number"
                value={form.tracking_number}
                onChange={handleChange}
                required
              />
              
              {/* --- Informations Expéditeur --- */}
              <Typography variant="h6" sx={{ mt: 1, mb: -1 }}>Expéditeur</Typography>
              <TextField
                label="Nom de l'expéditeur"
                name="sender_name"
                value={form.sender_name}
                onChange={handleChange}
                required
              />

              {/* Champ Téléphone Expéditeur (Ajouté) */}
              <TextField
                label="Téléphone de l'expéditeur"
                name="sender_phone"
                value={form.sender_phone}
                onChange={handleChange}
                required
              />

              {/* --- Informations Destinataire --- */}
              <Typography variant="h6" sx={{ mt: 1, mb: -1 }}>Destinataire</Typography>
              <TextField
                label="Nom du destinataire"
                name="recipient_name"
                value={form.recipient_name}
                onChange={handleChange}
                required
              />

              {/* Champ Téléphone Destinataire (Ajouté) */}
              <TextField
                label="Téléphone du destinataire"
                name="recipient_phone"
                value={form.recipient_phone}
                onChange={handleChange}
                required
              />

              {/* --- Détails Colis --- */}
              <Typography variant="h6" sx={{ mt: 1, mb: -1 }}>Détails du colis</Typography>
              
              {/* Champ Poids */}
              <TextField
                type="number"
                label="Poids (kg)"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                required
                inputProps={{ min: "0", step: "0.1" }} // Ajout de propriétés numériques
              />

              {/* Champ Prix (Ajouté) */}
              <TextField
                type="number"
                label="Prix de l'envoi (€ ou devise locale)"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                inputProps={{ min: "0", step: "0.01" }} // Ajout de propriétés numériques
              />

              {/* Champ Description */}
              <TextField
                multiline
                rows={3}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />

              {/* Champ Statut */}
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

              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  // 2. Correction : Utiliser window.history.back() ou Inertia.back()
                  onClick={() => window.history.back()} 
                >
                  Annuler
                </Button>

                <Button variant="contained" type="submit" color="primary">
                  Enregistrer
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}