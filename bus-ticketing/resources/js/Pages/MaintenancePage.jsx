import React, { useState } from "react";
import { 
  Grid, Container, Box, Typography, Button, Paper, 
  Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, IconButton, Stack, MenuItem, Divider, LinearProgress 
} from "@mui/material";
import { 
  EventAvailable, WarningAmber, VerifiedUser, TrendingUp, 
  Engineering, Speed, Close, Handyman, GppGood 
} from "@mui/icons-material";
import SiraLayout from '@/Layouts/SiraLayout';

// Widget de statistiques déporté pour la clarté
function StatWidget({ label, value, icon, color, progress }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 5, textAlign: 'center', border: '1px solid #e2e8f0', bgcolor: 'white', height: '100%' }}>
      <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 3, bgcolor: `${color}10`, color: color, mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b' }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
        {label}
      </Typography>
      {progress && (
        <Box sx={{ px: 2 }}>
           <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
        </Box>
      )}
    </Paper>
  );
}

export default function MaintenancePage() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <SiraLayout>
      {/* Conteneur principal sans padding restrictif au début pour le Hero */}
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 10 }}>
        
        {/* --- HERO SECTION : Pleine largeur --- */}
        <Box sx={{ bgcolor: "#0f172a", color: "white", pt: { xs: 8, md: 10 }, pb: { xs: 12, md: 14 } }}>
          <Container maxWidth="lg">
            <Stack spacing={2}>
              <Typography variant="overline" sx={{ color: "#FCD116", fontWeight: 900, letterSpacing: 2 }}>
                SIRA SÉCURITÉ & MAINTENANCE
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Zéro Panne, <span style={{ color: '#10b981' }}>Zéro Accident</span>
              </Typography>
              <Typography variant="h6" sx={{ color: "slate.400", opacity: 0.8, maxWidth: 650, fontWeight: 400 }}>
                Le réseau numérique de maintenance préventive pour une flotte malienne toujours opérationnelle et sécurisée.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* --- SECTION 1: INDICATEURS (Chevauchement sur le Hero) --- */}
        <Container maxWidth="lg" sx={{ mt: -8 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatWidget label="Immobilisations" value="08" icon={<Handyman />} color="#ef4444" progress={40}/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatWidget label="Entretiens à 7j" value="14" icon={<EventAvailable />} color="#3b82f6" progress={70}/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatWidget label="Alertes Critiques" value="03" icon={<WarningAmber />} color="#f59e0b" progress={30}/>
            </Grid>
          </Grid>
        </Container>

        {/* --- SECTION 2: RÉSEAU DE GARAGES --- */}
        <Container maxWidth="lg" sx={{ mt: 10 }}>
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 8, bgcolor: "white", border: '1px solid #e2e8f0', display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <GppGood sx={{ color: '#10b981' }} />
                  <Typography variant="h5" fontWeight="900" color="#0f172a">Devenez Garage Agréé SIRA</Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
                Intégrez le système national de suivi technique. Accédez aux contrats de maintenance des plus grandes compagnies de transport.
              </Typography>
              <Button variant="contained" size="large" onClick={handleOpen} sx={{ bgcolor: "#0f172a", px: 4, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', "&:hover": { bgcolor: "#1e293b" } }}>
                Inscrire mon garage
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                <Engineering sx={{ fontSize: 180, color: '#f1f5f9' }} />
            </Box>
          </Paper>
        </Container>

        {/* --- SECTION 3: AVANTAGES --- */}
        <Container maxWidth="lg" sx={{ mt: 12 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h4" fontWeight="900" sx={{ mb: 2 }}>La Maintenance 4.0</Typography>
              <Divider sx={{ width: 60, height: 4, bgcolor: "#FCD116", mx: 'auto', borderRadius: 2 }} />
          </Box>
          <Grid container spacing={4}>
            {[
              { title: "Traçabilité", desc: "Historique numérique complet de chaque véhicule.", icon: <VerifiedUser /> },
              { title: "IA Préventive", desc: "Alertes automatiques selon le kilométrage réel.", icon: <Speed /> },
              { title: "Zéro Papier", desc: "Ordres de travaux 100% dématérialisés.", icon: <Engineering /> },
              { title: "Visibilité", desc: "Augmentez votre activité via le portail SIRA.", icon: <TrendingUp /> }
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Stack spacing={2} sx={{ textAlign: 'center', alignItems: 'center' }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: 4, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#10b981' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* --- MODAL FORMULAIRE --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Demande d'Agrément Garage
          <IconButton onClick={handleClose}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Dénomination du Garage" fullWidth required />
            <TextField label="Localisation (Ville / Quartier)" fullWidth required />
            <TextField select label="Spécialisation" fullWidth defaultValue="meca">
              <MenuItem value="meca">Mécanique Générale</MenuItem>
              <MenuItem value="elec">Électricité</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#0f172a', px: 4, borderRadius: 2 }}>Envoyer</Button>
        </DialogActions>
      </Dialog>
    </SiraLayout>
  );
}