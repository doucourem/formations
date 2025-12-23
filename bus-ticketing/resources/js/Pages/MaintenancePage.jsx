import React, { useState } from "react";
import { 
  Grid, Container, Box, Typography, Button, Paper, 
  Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, IconButton, Stack, LinearProgress 
} from "@mui/material";
import { 
  Build, EventAvailable, WarningAmber, AppRegistration, 
  VerifiedUser, TrendingUp, Engineering, Speed, Close 
} from "@mui/icons-material";
import PageHero from "@/components/PageHero";

function StatWidget({ label, value, icon, color, progress }) {
  return (
    <Paper 
      elevation={3} 
      sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}
    >
      <Box sx={{ fontSize: 40, color }}>{icon}</Box>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      {progress && <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, borderRadius: 1 }} />}
    </Paper>
  );
}

export default function MaintenancePage() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: "linear-gradient(135deg, #f5f7fa, #e4ebf5)", 
      pb: 8 
    }}>
          
      <PageHero 
        title="Garages & Maintenance" 
        subtitle="Suivi en temps réel de votre parc" 
      />

      {/* SECTION 1: STATS */}
      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <StatWidget label="Au Garage" value="8" icon={<Build />} color="#e53935" progress={40}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatWidget label="Entretiens prévus" value="14" icon={<EventAvailable />} color="#1e88e5" progress={70}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatWidget label="Alertes critiques" value="3" icon={<WarningAmber />} color="#fdd835" progress={30}/>
          </Grid>
        </Grid>
      </Container>

      {/* SECTION 2: CTA INSCRIPTION */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, borderRadius: 4, bgcolor: "primary.main", color: "white",
            display: "flex", flexDirection: { xs: "column", md: "row" },
            alignItems: "center", justifyContent: "space-between", gap: 3,
            boxShadow: "0px 10px 30px rgba(25, 118, 210, 0.2)"
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Vous êtes garagiste ?</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Rejoignez notre réseau pour gérer les interventions et booster votre activité.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleOpen}
            startIcon={<AppRegistration />}
            sx={{ 
              background: 'linear-gradient(90deg, #1e88e5, #42a5f5)', 
              color: 'white', px: 5, fontWeight: 'bold',
              '&:hover': { background: 'linear-gradient(90deg, #1565c0, #1e88e5)' }
            }}
          >
            Rejoindre le réseau
          </Button>
        </Paper>
      </Container>

      {/* SECTION 3: AVANTAGES */}
      <Container maxWidth="lg" sx={{ mt: 8, pb: 10 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" sx={{ mb: 6 }}>
          Pourquoi devenir partenaire ?
        </Typography>
        <Grid container spacing={4}>
          {[
            { title: "Nouveaux Clients", desc: "Accès direct aux flottes locales.", icon: <TrendingUp color="primary" fontSize="large" /> },
            { title: "Gestion Digitale", desc: "Plus de papier, tout se passe ici.", icon: <Engineering color="primary" fontSize="large" /> },
            { title: "Paiements Zen", desc: "Facturation simplifiée et sécurisée.", icon: <VerifiedUser color="primary" fontSize="large" /> },
            { title: "Efficacité", desc: "Accords de travaux ultra-rapides.", icon: <Speed color="primary" fontSize="large" /> }
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box
                sx={{ 
                  textAlign: 'center', p: 3, borderRadius: 2, bgcolor: 'white', 
                  boxShadow: 1, transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                }}
              >
                <Box sx={{ p: 2, borderRadius: '50%', display: 'inline-flex', mb: 2, bgcolor:'#f0f0f0' }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* MODAL FORMULAIRE */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Inscription Partenaire Garage
          <IconButton onClick={handleClose} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Remplissez ces informations pour que notre équipe valide votre accès.
            </Typography>
            <TextField label="Nom de l'établissement" fullWidth variant="outlined" placeholder="Ex: Garage du Centre" required />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Numéro SIRET" fullWidth helperText="Ex: 123 456 789 00010" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Téléphone" fullWidth helperText="Ex: +223 70 00 00 00" required />
              </Grid>
            </Grid>
            <TextField label="Adresse complète" fullWidth multiline rows={2} required />
            <TextField label="Email professionnel" fullWidth type="email" placeholder="exemple@garage.com" required />
            <TextField label="Spécialités (Mécanique, Carrosserie...)" fullWidth placeholder="Séparez par des virgules" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button variant="contained" onClick={handleClose} sx={{ px: 4 }}>Envoyer ma demande</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
