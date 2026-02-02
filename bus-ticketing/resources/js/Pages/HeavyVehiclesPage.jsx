import React, { useState } from "react";
import { Link } from "@inertiajs/react"; // Importation pour la navigation Inertia
import { 
  Grid, Container, Box, Typography, Button, Stack, 
  Paper, Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, IconButton, MenuItem, Divider
} from "@mui/material";
// Remplacez ShieldCheck par GppGood (qui est l'écusson de validation standard)
import { 
  LocalShipping, Timeline, Engineering, BarChart, 
  Add, LocationOn, Close, WorkspacePremium, 
  Handshake, SupportAgent, Assignment, Analytics,
  GppGood // <-- Utilisez ceci à la place
} from "@mui/icons-material";

// Vos composants personnalisés
import PageHero from "@/components/PageHero";
import FeatureCard from "@/components/FeatureCard";
import StatWidget from "@/components/StatWidget";
import InventoryList from "@/components/InventoryList";

export default function HeavyVehiclesPage({ auth }) { // On récupère auth des props
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box component="main" sx={{ pb: 8, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      
      {/* --- NAVIGATION BAR (Tailwind + Inertia) --- */}
      <nav className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <GppGood className="text-white" size={24} />
            </div>
            <div className="leading-none">
              <span className="text-2xl font-black tracking-tighter uppercase">
                SIRA MALI <span className="text-green-600 font-extrabold text-sm align-top italic">NUMÉRIQUE</span>
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Plateforme Nationale Intégrée
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 font-bold text-sm text-slate-700">
            <Link href={route('companies')} className="hover:text-green-600 transition">Compagnies</Link>
            <Link href={route('maintenance')} className="hover:text-green-600 transition">Maintenance</Link>
            <Link href={route('heavyVehicles')} className="hover:text-green-600 transition">Gros Porteurs</Link>
            {auth?.user ? (
              <Link href={route('dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-slate-800 transition">
                Dashboard
              </Link>
            ) : (
              <Link href={route('login')} className="border-2 border-slate-900 px-6 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION SIRA --- */}
      <Box sx={{ 
        bgcolor: "#0f172a", color: "white", 
        pt: { xs: 8, md: 10 }, pb: { xs: 12, md: 14 },
        position: 'relative',
        backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)'
      }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: "#10b981", fontWeight: 900, letterSpacing: 2 }}>
            SIRA LOGISTIQUE
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, mt: 1, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Gestion des Gros Porteurs
          </Typography>
          <Typography variant="h6" sx={{ color: "slate.400", opacity: 0.8, maxWidth: 600, fontWeight: 400, mb: 4 }}>
            Centralisez le pilotage de votre flotte lourde, optimisez vos contrats de location et suivez vos livraisons en temps réel.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8 }}>
        
        {/* --- SECTION 1: INDICATEURS --- */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {[
            { label: "Flotte Totale", value: "24", icon: <LocalShipping />, color: "#3b82f6" },
            { label: "En Mission", value: "18", icon: <LocationOn />, color: "#10b981" },
            { label: "Livraisons", value: "12", icon: <Assignment />, color: "#6366f1" },
            { label: "Alertes", value: "02", icon: <Engineering />, color: "#ef4444" }
          ].map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper sx={{ p: 3, borderRadius: 5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                 <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1.5, bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 3 }}>
                       {stat.icon}
                    </Box>
                    <Box>
                       <Typography variant="h4" fontWeight="900">{stat.value}</Typography>
                       <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{stat.label}</Typography>
                    </Box>
                 </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* --- SECTION 2: TABLEAU DE BORD FLOTTE --- */}
        <Paper sx={{ p: 4, borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', mb: 8 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight="900">État Actuel de la Flotte</Typography>
              <Typography variant="caption" color="text.secondary">Mise à jour via SIRA GPS</Typography>
            </Box>
            <Button startIcon={<Add />} variant="outlined" sx={{ borderRadius: 3, fontWeight: 'bold' }}>
              Ajouter un véhicule
            </Button>
          </Stack>
          <InventoryList />
        </Paper>

        {/* --- SECTION 3: CTA RÉSEAU --- */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, borderRadius: 8, 
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
            color: "white"
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight="900" gutterBottom>
                Développez votre activité Logistique
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.7 }}>
                Intégrez le réseau SIRA pour accéder aux flux de transport nationaux.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleOpen}
                sx={{ bgcolor: "#10b981", px: 6, py: 2, borderRadius: 4, fontWeight: "bold", "&:hover": { bgcolor: "#059669" } }}
              >
                Rejoindre le réseau
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* --- DIALOG SIRA STYLE --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Partenariat SIRA Logistique
          <IconButton onClick={handleClose}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField label="Raison Sociale" fullWidth />
            <TextField select label="Type de Partenariat" fullWidth defaultValue="livraison">
              <MenuItem value="livraison">Services de Livraison / Fret</MenuItem>
              <MenuItem value="location">Location de Véhicules</MenuItem>
              <MenuItem value="meca">Garage Partenaire</MenuItem>
            </TextField>
            <TextField label="Zone d'intervention" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Annuler</Button>
          <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#0f172a' }}>Envoyer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}