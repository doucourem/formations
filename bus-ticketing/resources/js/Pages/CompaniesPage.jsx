import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { 
  Grid, Container, Box, Typography, Button, Paper, 
  Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, IconButton, Stack, MenuItem, Divider
} from "@mui/material";
import { 
  DirectionsBus, ConfirmationNumber, Map, TrendingUp, 
  Close, Public, WhatsApp, Store, GppGood 
} from "@mui/icons-material";

export default function CompaniesPage({ auth }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ bgcolor: "#FDFDFD", minHeight: "100vh", pb: 10 }}>
      
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Plateforme Nationale Intégrée</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 font-bold text-sm text-slate-700">
            <Link href={route('companies')} className="text-green-600">Compagnies</Link>
            <Link href={route('maintenance')} className="hover:text-green-600 transition">Maintenance</Link>
            <Link href={route('heavyVehicles')} className="hover:text-green-600 transition">Gros Porteurs</Link>
            {auth?.user ? (
              <Link href={route('dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-slate-800 transition">Dashboard</Link>
            ) : (
              <Link href={route('login')} className="border-2 border-slate-900 px-6 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition">Connexion</Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <Box sx={{ 
        bgcolor: "#0f172a", color: "white", 
        pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 },
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Drapeau National en bordure haute */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', display: 'flex' }}>
            <Box sx={{ flex: 1, bgcolor: '#009132' }} />
            <Box sx={{ flex: 1, bgcolor: '#FCD116' }} />
            <Box sx={{ flex: 1, bgcolor: '#CE1126' }} />
        </Box>

        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="overline" sx={{ letterSpacing: 4, color: "#10b981", fontWeight: 900 }}>
              SIRA MALI NUMÉRIQUE
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '4rem' } }}>
              L'Elite du Transport Malien
            </Typography>
            <Typography variant="h6" sx={{ color: "slate.400", maxWidth: 700, opacity: 0.8, fontWeight: 400 }}>
              Rejoignez le réseau national interconnecté. Gérez votre flotte, vos lignes et votre billetterie avec la puissance du numérique.
            </Typography>
            <Button 
              variant="contained" size="large" onClick={handleOpen}
              sx={{ 
                bgcolor: "#10b981", px: 5, py: 2, borderRadius: '12px', 
                fontWeight: 'bold', textTransform: 'none', fontSize: '1.1rem',
                "&:hover": { bgcolor: "#059669" }
              }}
            >
              Affilier ma compagnie
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* --- SECTION 1: FONCTIONNALITÉS --- */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {[
            { title: "Gestion Flotte", desc: "Suivi technique et administratif de vos véhicules (Bus & Cars).", icon: <DirectionsBus fontSize="large" sx={{ color: '#10b981' }} /> },
            { title: "Réseau de Lignes", desc: "Planification des itinéraires nationaux et transfrontaliers.", icon: <Map fontSize="large" sx={{ color: '#10b981' }} /> },
            { title: "E-Billetterie", desc: "Vente omnicanale sécurisée via Mobile Money et WhatsApp.", icon: <ConfirmationNumber fontSize="large" sx={{ color: '#10b981' }} /> },
            { title: "Data & Analyse", desc: "Rapports consolidés pour optimiser votre rentabilité.", icon: <TrendingUp fontSize="large" sx={{ color: '#10b981' }} /> }
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ 
                p: 4, borderRadius: 5, height: '100%', textAlign: 'center', 
                border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', borderColor: '#10b981' }
              }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="subtitle1" fontWeight="900" sx={{ textTransform: 'uppercase' }} gutterBottom>{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* --- SECTION 2: CANAUX DE VENTE --- */}
        <Box sx={{ mt: 12, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="900" sx={{ mb: 2 }}>Distribution Multi-Canal</Typography>
          <Divider sx={{ width: 60, height: 4, bgcolor: "#FCD116", mx: 'auto', mb: 6, borderRadius: 2 }} />
          
          <Grid container spacing={4}>
            {[
              { title: "Portail SIRA", desc: "Visibilité nationale sur la plateforme.", icon: <Public sx={{ fontSize: 40 }} /> },
              { title: "Bot WhatsApp", desc: "Réservation instantanée par messagerie.", icon: <WhatsApp sx={{ fontSize: 40 }} /> },
              { title: "Guichets Partenaires", desc: "Point de vente physique interconnecté.", icon: <Store sx={{ fontSize: 40 }} /> }
            ].map((canal, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Stack direction="row" spacing={2} sx={{ p: 3, bgcolor: 'white', borderRadius: 4, alignItems: 'center', textAlign: 'left', border: '1px solid #f1f5f9' }}>
                   <Box sx={{ color: "#10b981" }}>{canal.icon}</Box>
                   <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{canal.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{canal.desc}</Typography>
                   </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* --- MODAL D'AFFILIATION --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Demande d'Affiliation SIRA
          <IconButton onClick={handleClose}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: 'none' }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField label="Nom de la Compagnie" fullWidth placeholder="Ex: SONEF, GANA, Nour..." />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Nombre de Bus" type="number" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Zone d'activité" fullWidth defaultValue="nat">
                  <MenuItem value="nat">National (Mali)</MenuItem>
                  <MenuItem value="inter">Sous-Région (UEMOA/CEDEAO)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField label="Contact Responsable" fullWidth />
            <TextField label="Téléphone Mobile (WhatsApp)" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={handleClose} sx={{ fontWeight: 'bold', color: 'slate.500' }}>Annuler</Button>
          <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#0f172a', px: 4, borderRadius: 3, fontWeight: 'bold' }}>
            Soumettre le dossier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}