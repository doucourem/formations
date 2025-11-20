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

export default function Edit({ parcel, trips }) {
  // 1. Initialisation avec les champs manquants (téléphone et prix)
  const [form, setForm] = useState({
    _method: "put", // Ajouté pour Inertia/Laravel
    trip_id: parcel.trip_id,
    tracking_number: parcel.tracking_number,
    sender_name: parcel.sender_name,
    sender_phone: parcel.sender_phone || "", // Ajouté
    recipient_name: parcel.recipient_name,
    recipient_phone: parcel.recipient_phone || "", // Ajouté
    weight_kg: parcel.weight_kg,
    price: parcel.price || "", // Ajouté
    description: parcel.description || "",
    status: parcel.status,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Utiliser PUT pour la mise à jour (nécessite l'ajout de _method: "put" dans le state Inertia)
    Inertia.post(route("parcels.update", parcel.id), form);
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
                    {/* Correction de l'affichage des villes du voyage */}
                    {t.route?.departureCity?.name || 'Ville de départ inconnue'} ➝ {t.route?.arrivalCity?.name || 'Ville d\'arrivée inconnue'}
                  </MenuItem>
                ))}
              </TextField>

              {/* Champ Numéro de Tracking (Disabled) */}
              <TextField
                label="Numéro de Tracking"
                name="tracking_number"
                value={form.tracking_number}
                disabled
                helperText="Le numéro de tracking ne peut pas être modifié."
              />

              {/* --- Informations Expéditeur --- */}

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

              {/* Champ Poids */}
              <TextField
                type="number"
                label="Poids (kg)"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                required
                inputProps={{ min: "0", step: "any" }} // Accepte les décimaux > 0
              />
              
              {/* Champ Prix (Ajouté) */}
              <TextField
                type="number"
                label="Prix de l'envoi (€ ou devise locale)"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                inputProps={{ min: "0", step: "0.01" }} // Accepte les décimaux > 0
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
                  // Correction de la navigation : Utilisation de window.history.back()
                  onClick={() => window.history.back()}
                >
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