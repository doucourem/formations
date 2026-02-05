import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout"; // Changement pour le layout pro
import {
  Box, Card, CardHeader, CardContent, Button, TextField, MenuItem,
  Typography, Grid, Divider, InputAdornment, Chip
} from "@mui/material";
import { 
  Save as SaveIcon, 
  ArrowBack as BackIcon, 
  Info as InfoIcon,
  LocalShipping as ShippingIcon 
} from "@mui/icons-material";

export default function Edit({ parcel, trips, agencies }) {
  const [form, setForm] = useState({
    _method: "put",
    trip_id: parcel.trip_id || "",
    tracking_number: parcel.tracking_number,
    sender_name: parcel.sender_name,
    sender_phone: parcel.sender_phone || "",
    recipient_name: parcel.recipient_name,
    recipient_phone: parcel.recipient_phone || "",
    weight_kg: parcel.weight_kg,
    price: parcel.price || "",
    description: parcel.description || "",
    status: parcel.status,
    parcel_image: null,
  });

  const [imagePreview, setImagePreview] = useState(
    parcel.parcel_image ? `/storage/${parcel.parcel_image}` : null
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["price", "weight_kg"].includes(name) ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
    // On utilise POST avec _method: "put" pour gérer l'upload de fichiers en multipart
    Inertia.post(route("parcels.update", parcel.id), data);
  };

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 1100, mx: "auto", py: 3 }}>
        {/* En-tête de page */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="800" color="#1A237E">
              Modifier l'expédition
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Réf: <strong>{parcel.tracking_number}</strong>
            </Typography>
          </Box>
          <Button startIcon={<BackIcon />} onClick={() => window.history.back()}>
            Retour
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Colonne Gauche : Information Transport & Client */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid #e0e0e0' }} elevation={0}>
                <CardHeader title="Logistique et Destination" titleTypographyProps={{ fontWeight: 700 }} />
                <Divider />
              
              </Card>

              <Card sx={{ borderRadius: 4, border: '1px solid #e0e0e0' }} elevation={0}>
                <CardHeader title="Parties Prenantes" titleTypographyProps={{ fontWeight: 700 }} />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><TextField fullWidth label="Expéditeur" name="sender_name" value={form.sender_name} onChange={handleChange} required /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Tel. Expéditeur" name="sender_phone" value={form.sender_phone} onChange={handleChange} required /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Destinataire" name="recipient_name" value={form.recipient_name} onChange={handleChange} required /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Tel. Destinataire" name="recipient_phone" value={form.recipient_phone} onChange={handleChange} required /></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Colonne Droite : Statut, Photo et Prix */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 4, mb: 3, bgcolor: '#F4F7FA' }} elevation={0}>
                <CardHeader title="Contrôle du Colis" titleTypographyProps={{ fontWeight: 700 }} />
                <CardContent sx={{ display: 'grid', gap: 2 }}>
                  <TextField select fullWidth label="État actuel" name="status" value={form.status} onChange={handleChange}>
                    <MenuItem value="pending">🟡 En attente</MenuItem>
                    <MenuItem value="in_transit">🔵 En transit</MenuItem>
                    <MenuItem value="delivered">🟢 Livré</MenuItem>
                  </TextField>

                  <TextField fullWidth label="Quantité / Poids" name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} required />
                  
                  <TextField fullWidth multiline rows={2} label="Observations" name="description" value={form.description} onChange={handleChange} />

                  <Box>
                    <Typography variant="caption" display="block" mb={1} fontWeight="bold">Photo de preuve :</Typography>
                    <input type="file" onChange={handleFileChange} />
                    {imagePreview && (
                      <Box mt={2} sx={{ position: 'relative' }}>
                        <img src={imagePreview} alt="Colis" style={{ width: '100%', borderRadius: 8 }} />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, bgcolor: '#1A237E', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Facturation</Typography>
                  <TextField
                    fullWidth label="Montant Total" name="price" type="number"
                    variant="filled" value={form.price} onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>CFA</InputAdornment>,
                      style: { color: 'white' }
                    }}
                  />
                  <Button 
                    fullWidth size="large" type="submit" variant="contained" 
                    startIcon={<SaveIcon />}
                    sx={{ mt: 3, bgcolor: '#FFD600', color: '#1A237E', fontWeight: 'bold', '&:hover': { bgcolor: '#FFC107' } }}
                  >
                    Mettre à jour le flux
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </GuestLayout>
  );
}