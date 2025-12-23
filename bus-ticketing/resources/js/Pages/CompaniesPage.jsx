import React, { useState } from "react";
import { 
  Grid, Container, Box, Typography, Button, Paper, 
  Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, IconButton, Stack, MenuItem 
} from "@mui/material";
import { 
  BusAlert, ConfirmationNumber, Route, QueryStats, 
  AppRegistration, Close, Language, WhatsApp, Storefront 
} from "@mui/icons-material";
import PageHero from "@/components/PageHero";
import FeatureCard from "@/components/FeatureCard";

export default function CompaniesPage() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ bgcolor: "#f4f7f6", minHeight: "100vh", pb: 10 }}>
      <PageHero
        title="Compagnies de transport"
        subtitle="Gérez vos bus, trajets et ventes de billets en toute simplicité"
        buttonText="Affilier ma compagnie"
        buttonLink="#"
      />

      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 4 } }}>
        {/* --- SECTION 1: FONCTIONNALITÉS --- */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {[
            { title: "Gestion de la flotte", desc: "Ajoutez et gérez vos bus et véhicules depuis une seule plateforme.", icon: <BusAlert color="primary" /> },
            { title: "Gestion des trajets", desc: "Créez vos itinéraires, horaires et tarifs rapidement.", icon: <Route color="primary" /> },
            { title: "Vente de billets", desc: "Suivez les ventes effectuées en ligne et via WhatsApp.", icon: <ConfirmationNumber color="primary" /> },
            { title: "Statistiques", desc: "Analysez vos revenus et performances.", icon: <QueryStats color="primary" /> }
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <FeatureCard title={feature.title} description={feature.desc} icon={feature.icon} />
            </Grid>
          ))}
        </Grid>

        {/* --- SECTION 2: APPEL À L'INSCRIPTION --- */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: { xs: 6, md: 8 }, p: { xs: 3, md: 5 }, borderRadius: 4, 
            background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)", 
            color: "white", textAlign: "center"
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Digitalisez votre billetterie dès aujourd'hui
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: "auto" }}>
            Augmentez votre taux de remplissage en vendant vos billets sur notre réseau web et mobile. Une gestion simplifiée pour un profit optimisé.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleOpen}
            startIcon={<AppRegistration />}
            sx={{ 
              bgcolor: "white", color: "#1b5e20", fontWeight: "bold", px: 6,
              width: { xs: '100%', sm: 'auto' },
              "&:hover": { bgcolor: "#f0f0f0" } 
            }}
          >
            Affilier ma compagnie
          </Button>
        </Paper>

        {/* --- SECTION 3: CANAUX DE VENTE --- */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 6 }}>
          {[
            { title: "Vente en Ligne", desc: "Vos billets disponibles 24h/7j sur le web.", icon: <Language /> },
            { title: "WhatsApp Bot", desc: "Réservation automatique via messagerie.", icon: <WhatsApp /> },
            { title: "Réseau d'Agences", desc: "Distribution via nos points de vente partenaires.", icon: <Storefront /> }
          ].map((canal, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Box sx={{ color: "success.main", mb: 1 }}>{canal.icon}</Box>
                <Typography variant="subtitle1" fontWeight="bold">{canal.title}</Typography>
                <Typography variant="body2" color="text.secondary">{canal.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- MODAL D'INSCRIPTION COMPAGNIE --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Devenir Compagnie Partenaire
          <IconButton onClick={handleClose} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Nom de la Compagnie" fullWidth />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nombre de bus" type="number" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Zone principale" fullWidth defaultValue="nat">
                  <MenuItem value="nat">National</MenuItem>
                  <MenuItem value="inter">Inter-urbain</MenuItem>
                  <MenuItem value="sous">Sous-régional</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField label="Responsable Commercial" fullWidth />
            <TextField label="Téléphone de contact" fullWidth />
            <TextField label="Email (Administration)" fullWidth type="email" />
            <TextField label="Principales destinations" placeholder="Ex: Bamako - Kayes, Dakar - Bamako..." multiline rows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button variant="contained" color="success" onClick={handleClose}>Demander une démo</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
