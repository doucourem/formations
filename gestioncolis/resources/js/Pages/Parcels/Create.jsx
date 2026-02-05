import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout"; // Utilisation du layout Pro
import {
  Box, Card, CardHeader, CardContent, Button, TextField, MenuItem,
  Typography, IconButton, Grid, Divider, InputAdornment, Paper
} from "@mui/material";
import {
  Autorenew as AutorenewIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon
} from "@mui/icons-material";

export default function Create({ trips, agencies }) {
  const generateTracking = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    return `FL-${date}-${rand}`; // Format FasoLogistique : FL-YYMMDD-XXXX
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
    status: "pending",
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["price", "weight_kg"].includes(name) ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, parcel_image: file });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.departure_agency_id === form.arrival_agency_id) {
      alert("L'agence de départ et d'arrivée doivent être différentes !");
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
      <Box sx={{ maxWidth: 1000, mx: "auto", py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="800" color="#1A237E">
            Nouveau Colis
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Réf: <span style={{ color: '#FFD600' }}>{form.tracking_number}</span>
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* --- SECTION LOGISTIQUE --- */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 4, mb: 3 }}>
                <CardHeader 
                  avatar={<ShippingIcon color="primary" />} 
                  title="Détails du Transport" 
                  titleTypographyProps={{ fontWeight: 'bold' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        select fullWidth label="Affecter à un voyage (Optionnel)"
                        name="trip_id" value={form.trip_id} onChange={handleChange}
                      >
                        <MenuItem value=""><em>Aucun voyage pour le moment</em></MenuItem>
                        {trips.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {`${t.route?.departureCity?.name} → ${t.route?.arrivalCity?.name} (${t.departure_at})`}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4 }}>
                <CardHeader 
                   avatar={<PersonIcon color="primary" />} 
                   title="Informations Expéditeur & Destinataire" 
                   titleTypographyProps={{ fontWeight: 'bold' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><TextField fullWidth label="Nom Expéditeur" name="sender_name" onChange={handleChange} required /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Tel Expéditeur" name="sender_phone" onChange={handleChange} required /></Grid>
                    <Grid item xs={12}><Divider sx={{ my: 1 }}>Destinataire</Divider></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Nom Destinataire" name="recipient_name" onChange={handleChange} required /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Tel Destinataire" name="recipient_phone" onChange={handleChange} required /></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* --- SECTION COLIS & PAIEMENT (SIDEBAR) --- */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, mb: 3, bgcolor: '#f8f9fa' }}>
                <CardHeader title="Caractéristiques" titleTypographyProps={{ fontWeight: 'bold' }} />
                <CardContent sx={{ display: 'grid', gap: 2 }}>
                  <TextField 
                    fullWidth label="Nombre de colis / Poids" name="weight_kg" type="number" 
                    onChange={handleChange} required 
                  />
                  <TextField 
                    fullWidth multiline rows={3} label="Description du contenu" 
                    name="description" onChange={handleChange} 
                  />
                  
                  <Box sx={{ textAlign: 'center', p: 2, border: '2px dashed #ccc', borderRadius: 2 }}>
                    {!imagePreview ? (
                      <Button component="label" startIcon={<UploadIcon />}>
                        Photo du colis
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                      </Button>
                    ) : (
                      <Box>
                        <img src={imagePreview} style={{ width: '100%', borderRadius: 8 }} />
                        <Button color="error" size="small" onClick={() => setImagePreview(null)}>Changer</Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, bgcolor: '#1A237E', color: 'white' }}>
                <CardHeader 
                  avatar={<PaymentIcon sx={{ color: '#FFD600' }} />} 
                  title="Encaissement" 
                />
                <CardContent sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    fullWidth label="Prix Total" name="price" type="number"
                    variant="filled" onChange={handleChange} required
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ color: 'white' }}>CFA</InputAdornment>,
                      style: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }
                    }}
                  />
                  <TextField
                    select fullWidth label="Mode de paiement" name="payment_method"
                    variant="filled" value={form.payment_method} onChange={handleChange} required
                    InputProps={{ style: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' } }}
                  >
                    <MenuItem value="cash">Espèces</MenuItem>
                    <MenuItem value="orange_money">Orange Money</MenuItem>
                    <MenuItem value="wave">Wave</MenuItem>
                  </TextField>
                  <Button 
                    type="submit" variant="contained" fullWidth size="large"
                    sx={{ bgcolor: '#FFD600', color: '#1A237E', fontWeight: 'bold', mt: 2, '&:hover': { bgcolor: '#FFC107' } }}
                  >
                    Valider l'Expédition
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