import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  Box, Container, Grid, Typography, Paper, Stack,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, MenuItem, Divider
} from "@mui/material";
import {
  LocalShipping, LocationOn, Engineering, Assignment,
  Add, Close, GppGood, Analytics, Timeline, SupportAgent
} from "@mui/icons-material";

import InventoryList from "@/components/InventoryList";

export default function HeavyVehiclesPage({ auth }) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <GppGood className="text-white" />
            </div>
            <div>
              <div className="text-xl font-black">SIRA MALI <span className="text-green-600">NUMÉRIQUE</span></div>
              <div className="text-xs text-slate-400">Plateforme Nationale</div>
            </div>
          </div>

          <div className="hidden lg:flex gap-6 font-bold">
            <Link href={route("heavyVehicles")}>Gros Porteurs</Link>
            <Link href={route("maintenance")}>Maintenance</Link>
            {auth?.user ? (
              <Link href={route("dashboard")} className="px-5 py-2 bg-slate-900 text-white rounded-full">
                Dashboard
              </Link>
            ) : (
              <Link href={route("login")} className="px-5 py-2 border rounded-full">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <Box sx={{ bgcolor: "#0f172a", color: "white", py: 10 }}>
        <Container>
          <Typography variant="overline" sx={{ color: "#10b981", fontWeight: 800 }}>
            SIRA LOGISTIQUE
          </Typography>
          <Typography variant="h3" fontWeight={900}>
            Gestion Nationale des Gros Porteurs
          </Typography>
          <Typography sx={{ opacity: 0.8, maxWidth: 600, mt: 2 }}>
            Supervision en temps réel des flottes lourdes, contrats, maintenance et performance logistique.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ mt: -6 }}>

        {/* ================= KPI ================= */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {[
            { label: "Flotte Totale", value: "24", icon: <LocalShipping />, color: "#3b82f6" },
            { label: "En Mission", value: "18", icon: <LocationOn />, color: "#10b981" },
            { label: "Livraisons", value: "12", icon: <Assignment />, color: "#6366f1" },
            { label: "Alertes", value: "02", icon: <Engineering />, color: "#ef4444" },
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                  <Box>
                    <Typography variant="h4" fontWeight={900}>{kpi.value}</Typography>
                    <Typography variant="caption">{kpi.label}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ================= TABLE FLOTTE ================= */}
        <Paper sx={{ p: 4, borderRadius: 6, mb: 8 }}>
          <Stack direction="row" justifyContent="space-between" mb={3}>
            <Typography fontWeight={900}>État de la Flotte</Typography>
            <Button startIcon={<Add />} variant="outlined">Ajouter</Button>
          </Stack>
          <InventoryList />
        </Paper>

        {/* ================= ANALYTICS ================= */}
        <Paper sx={{ p: 4, borderRadius: 6, mb: 8 }}>
          <Typography fontWeight={900} mb={2}>Analytique & Performance</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Analytics /> Taux d’utilisation : <b>78%</b>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Timeline /> Retards moyens : <b>1.4h</b>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Engineering /> Maintenance préventive : <b>OK</b>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= CTA ================= */}
        <Paper sx={{ p: 6, bgcolor: "#0f172a", color: "white", borderRadius: 6 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight={900}>
                Rejoignez le Réseau Logistique SIRA
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Accédez aux marchés nationaux et contrats institutionnels.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Button
                variant="contained"
                sx={{ bgcolor: "#10b981" }}
                onClick={() => setOpen(true)}
              >
                Rejoindre
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* ================= DIALOG ================= */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Partenariat SIRA
          <IconButton onClick={() => setOpen(false)} sx={{ float: "right" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <TextField label="Raison sociale" fullWidth />
            <TextField select label="Type de partenariat" fullWidth>
              <MenuItem value="transport">Transport</MenuItem>
              <MenuItem value="location">Location</MenuItem>
              <MenuItem value="garage">Garage</MenuItem>
            </TextField>
            <TextField label="Zone d’intervention" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained">Envoyer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
