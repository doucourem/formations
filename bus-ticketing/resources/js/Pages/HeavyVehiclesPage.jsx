import React, { useState } from "react";
import { 
  Grid, Container, Box, Typography, Button, Stack, 
  Paper, Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, IconButton, MenuItem 
} from "@mui/material";
import { 
  LocalShipping, Timeline, Engineering, BarChart, 
  Add, LocationOn, GasMeter, AppRegistration, 
  Close, WorkspacePremium, Handshake, SupportAgent
} from "@mui/icons-material";
import PageHero from "@/components/PageHero";
import FeatureCard from "@/components/FeatureCard";
import StatWidget from "@/components/StatWidget";
import InventoryList from "@/components/InventoryList";

export default function HeavyVehiclesPage() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box component="main" sx={{ pb: 8, bgcolor: "#f5f7f9", minHeight: "100vh" }}>
      {/* HERO */}
      <PageHero
        title="Gros Porteurs – Flotte, Location & Livraison"
        subtitle="Pour les compagnies : pilotage de flotte, location, livraison et maintenance optimisée"
      />

      <Container maxWidth="lg" sx={{ mt: -6 }}>
        {/* SECTION 1: INDICATEURS CLÉS */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget label="Flotte Totale" value="24" icon={<LocalShipping />} color="primary.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget label="En Mission" value="18" icon={<LocationOn />} color="success.main" trend="75%" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget label="Camions Disponibles" value="6" icon={<Add />} color="warning.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget label="Alertes Techniques" value="2" icon={<Engineering />} color="error.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget label="Livraisons en cours" value="12" icon={<Timeline />} color="info.main" />
          </Grid>
        </Grid>

        {/* SECTION 2: OUTILS D'EXPLOITATION */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ color: "#1e293b" }}>
              Outils d'exploitation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gérez le cycle complet de vos véhicules lourds, locations et livraisons
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Fiches Techniques" 
              description="Gestion complète des fiches techniques de votre flotte" 
              icon={<LocalShipping color="primary" fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Suivi Kilométrique" 
              description="Suivi précis du kilométrage et des trajets" 
              icon={<Timeline color="primary" fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Maintenance Lourde" 
              description="Planification et suivi des interventions" 
              icon={<Engineering color="primary" fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Rentabilité" 
              description="Optimisez vos coûts et marges par trajet" 
              icon={<BarChart color="primary" fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Location de Véhicules" 
              description="Louez vos camions et remorques selon vos besoins" 
              icon={<LocalShipping color="primary" fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Suivi Livraison" 
              description="Suivi en temps réel de toutes vos livraisons" 
              icon={<Timeline color="primary" fontSize="large" />} 
            />
          </Grid>
        </Grid>

        {/* SECTION 3: LISTE DE LA FLOTTE */}
        <Box sx={{ mt: 5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">État actuel de la flotte</Typography>
          </Stack>
          <InventoryList />
        </Box>

        {/* SECTION 4: CTA PARTENAIRE */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 8, p: 4, borderRadius: 4, bgcolor: "#1e293b", color: "white",
            display: "flex", flexDirection: { xs: "column", md: "row" },
            alignItems: "center", justifyContent: "space-between", gap: 3
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Maintenance, Location & Livraison ?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Devenez prestataire ou partenaire pour l'entretien, la location et la livraison de gros porteurs.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleOpen}
            startIcon={<AppRegistration />}
            sx={{ bgcolor: "#3b82f6", fontWeight: "bold", "&:hover": { bgcolor: "#2563eb" } }}
          >
            Rejoindre le réseau
          </Button>
        </Paper>

        {/* SECTION 5: AVANTAGES FOURNISSEURS */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            { title: "Flux constant", desc: "Assurez la disponibilité de vos camions et missions.", icon: <WorkspacePremium color="primary" /> },
            { title: "Partenariat long terme", desc: "Contrats de maintenance et livraison optimisés.", icon: <Handshake color="primary" /> },
            { title: "Support dédié", desc: "Interface directe avec notre équipe logistique.", icon: <SupportAgent color="primary" /> }
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>{item.icon}</Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* MODAL FORMULAIRE PARTENAIRE */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Candidature Partenaire Poids Lourds
          <IconButton onClick={handleClose} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Raison Sociale" fullWidth variant="outlined" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="SIRET" fullWidth /></Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Type de service" fullWidth defaultValue="meca">
                  <MenuItem value="meca">Mécanique Générale PL</MenuItem>
                  <MenuItem value="pneu">Pneumatiques Industriels</MenuItem>
                  <MenuItem value="remorque">Remorquage / Dépannage</MenuItem>
                  <MenuItem value="froid">Maintenance Frigorifique</MenuItem>
                  <MenuItem value="location">Location de Véhicules</MenuItem>
                  <MenuItem value="livraison">Services de Livraison</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField label="Capacité d'accueil (Nombre de baies)" type="number" fullWidth />
            <TextField label="Ville / Zone d'intervention" fullWidth />
            <TextField label="Contact (Email/Tel)" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Fermer</Button>
          <Button variant="contained" onClick={handleClose}>Soumettre mon dossier</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
