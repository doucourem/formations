import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Button, Container, Box, CssBaseline,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Divider, createTheme, ThemeProvider, Card, Grid, Stack // <-- Ajout de Stack ici
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"; // Import manquant
import BuildIcon from "@mui/icons-material/Build"; // Import manquant
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // Import manquant
import HandshakeIcon from "@mui/icons-material/Handshake"; // Import manquant pour la section partenaire

import { motion } from "framer-motion";
import { FaBus, FaClock, FaShieldAlt, FaMobileAlt, FaTicketAlt } from "react-icons/fa";
import Logo from "@/Assets/logo.png";

export default function HomePage() {
  const whatsappNumber = "+2239X000000";
  const encodedMessage = encodeURIComponent("Je souhaite réserver un billet de bus");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  const [darkMode, setDarkMode] = useState(false);

  // Définition des types de partenaires pour la section Espace Partenaires
  const partnerTypes = [
    { 
      title: "Compagnies", 
      desc: "Vendez vos billets en ligne et gérez vos trajets.", 
      path: "/compagnies", 
      icon: <DirectionsBusIcon fontSize="large" />,
      color: "#00a859"
    },
    { 
      title: "Garages", 
      desc: "Devenez centre agréé pour la maintenance de notre flotte.", 
      path: "/maintenance", 
      icon: <BuildIcon fontSize="large" />,
      color: "#d32f2f"
    },
    { 
      title: "Logistique", 
      desc: "Solutions dédiées pour le transport de gros porteurs.", 
      path: "/gros-porteurs", 
      icon: <LocalShippingIcon fontSize="large" />,
      color: "#1976d2"
    }
  ];

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#00a859" },
      success: { main: "#00a859" },
      background: { default: darkMode ? "#0B0F12" : "#FAFAFA" },
    },
    typography: { fontFamily: "Inter, sans-serif" },
  });

  const tariffs = [
    { from: "Bamako", to: "Kayes", price: "9 000 FCFA" },
    { from: "Bamako", to: "Mopti", price: "10 000 FCFA" },
    { from: "Bamako", to: "Sikasso", price: "7 000 FCFA" },
    { from: "Bamako", to: "Abidjan", price: "35 000 FCFA" },
    { from: "Bamako", to: "Dakar", price: "45 000 FCFA" },
  ];

  const testimonials = [
    { name: "Aminata", comment: "Service rapide et fiable !" },
    { name: "Moussa", comment: "Réservation en 3 minutes. Super pratique." },
    { name: "Fatou", comment: "Paiement sécurisé et billet reçu instantanément." },
  ];

  const advantages = [
    { icon: <FaClock />, title: "Rapide" },
    { icon: <FaShieldAlt />, title: "Sécurisé" },
    { icon: <FaMobileAlt />, title: "Mobile Money" },
    { icon: <FaTicketAlt />, title: "Billet Numérique" },
    { icon: <FaBus />, title: "Compagnies Fiables" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* HEADER */}
      <AppBar position="sticky" color="primary" elevation={3}>
        <Toolbar>
          <Box display="flex" alignItems="center" mr={2}>
            <img src={Logo} alt="Logo" style={{ height: 40, width: "auto" }} />
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            FasoBillet
          </Typography>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box textAlign="center" py={10} sx={{
            borderRadius: 5,
            background: darkMode
              ? "linear-gradient(135deg,#111,#222)"
              : "linear-gradient(135deg,#e6fff0,#ffffff)",
            boxShadow: 6,
            mb: 4
          }}>
            <Typography variant="h2" fontWeight="900" color="success.main" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Voyagez l'esprit libre
            </Typography>
            <Typography variant="h5" mt={2} color="text.secondary">Votre billet de bus au Mali, réservé en un clic.</Typography>
            <Button variant="contained" color="success" size="large" href={whatsappLink} target="_blank" startIcon={<WhatsAppIcon />}
              sx={{
                mt: 4, py: 1.5, px: 5, borderRadius: "20px", fontSize: "1.05rem", fontWeight: 800,
                boxShadow: "0 6px 12px rgba(0,168,89,0.3)",
                "&:hover": { transform: "scale(1.03)", boxShadow: "0 8px 16px rgba(0,200,117,0.4)" }
              }}>
              Réserver sur WhatsApp
            </Button>
          </Box>
        </motion.div>

        {/* SECTION PARTENAIRES (Ajoutée ici avec Stack corrigé) */}
        <Box py={6}>
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <HandshakeIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="800">Espace Partenaires</Typography>
          </Stack>
          
          <Grid container spacing={3}>
  {partnerTypes.map((partner, i) => (
    <Grid item xs={12} md={4} key={i}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider',
          transition: '0.3s', '&:hover': { boxShadow: 10, transform: 'translateY(-5px)', borderColor: partner.color }
        }}
      >
        <Box sx={{ color: partner.color, mb: 2 }}>{partner.icon}</Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>{partner.title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>{partner.desc}</Typography>
        <Button 
          variant="outlined" 
          fullWidth 
          href={partner.path}
          sx={{ color: partner.color, borderColor: partner.color, fontWeight: 'bold' }}
        >
          Rejoindre le réseau
        </Button>
      </Paper>
    </Grid>
  ))}
</Grid>

        </Box>

        {/* TARIFS */}
        <Box py={4}>
          <Typography variant="h4" fontWeight="700" mb={2} textAlign="center">💰 Tarifs & Trajets</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkMode ? "#1C1C1C" : "#f0f4f8" }}>
                  <TableCell sx={{ fontWeight:700 }}>Départ</TableCell>
                  <TableCell sx={{ fontWeight:700 }}>Destination</TableCell>
                  <TableCell sx={{ fontWeight:700 }}>Prix</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tariffs.map((r,i)=>(
                  <TableRow key={i} sx={{ "&:hover": { backgroundColor: darkMode?"#222":"#f5fff8", transform:"scale(1.02)", transition:"0.2s" } }}>
                    <TableCell>{r.from}</TableCell>
                    <TableCell>{r.to}</TableCell>
                    <TableCell sx={{ fontWeight:600 }}>{r.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* AVIS CLIENTS */}
        <Box py={4} sx={{ backgroundColor: darkMode?"#111":"#f0f4f8", borderRadius:3 }}>
          <Typography variant="h4" fontWeight="700" mb={2} textAlign="center">⭐ Avis des Clients</Typography>
          <Grid container spacing={2} justifyContent="center">
            {testimonials.map((t,i)=>
              <Grid item xs={12} sm={4} key={i}>
                <motion.div whileHover={{ scale:1.03 }}>
                  <Card sx={{ p:2.5, textAlign:"center", boxShadow:3 }}>
                    <Typography fontWeight="bold">{t.name}</Typography>
                    <Typography fontSize="0.9rem" mt={1}>{t.comment}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* FOOTER */}
        <Divider sx={{ my:3 }} />
        <Box textAlign="center" py={2}>
          <Typography variant="body2">Email : contact@billetrapide-mali.ml</Typography>
          <Typography variant="body2" mt={0.5}>Adresse : Bamako, Mali</Typography>
          <Typography variant="body2" mt={0.5}>© {new Date().getFullYear()} FasoBillet — Tous droits réservés.</Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}