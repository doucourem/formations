import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Button, Container, Box, CssBaseline,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Divider, createTheme, ThemeProvider, Card, Grid
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { motion } from "framer-motion";
import { FaBus, FaClock, FaShieldAlt, FaMobileAlt, FaTicketAlt } from "react-icons/fa";
import Logo from "@/Assets/logo.png";

export default function HomePage() {
  const whatsappNumber = "+2239X000000";
  const encodedMessage = encodeURIComponent("Je souhaite réserver un billet de bus");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  const [darkMode, setDarkMode] = useState(false);

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
    {/* Logo */}
    <Box display="flex" alignItems="center" mr={2}>
      <img src={Logo} alt="Logo" style={{ height: 40, width: "auto" }} />
    </Box>

    {/* Titre */}
    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
      FasoBillet
    </Typography>

    {/* Bouton dark mode */}
    <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  </Toolbar>
</AppBar>


      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box textAlign="center" py={8} sx={{
            borderRadius: 5,
            background: darkMode
              ? "linear-gradient(135deg,#111,#222)"
              : "linear-gradient(135deg,#e6fff0,#ffffff)",
            boxShadow: 6,
            mb: 4
          }}>
            <Typography variant="h3" fontWeight="900" color="success.main">🎫 Votre Billet en 3 Minutes</Typography>
            <Typography variant="h5" mt={2} color="text.secondary">Réservation ultra-rapide via WhatsApp</Typography>
            <Button variant="contained" color="success" size="large" href={whatsappLink} target="_blank" startIcon={<WhatsAppIcon />}
              sx={{
                mt: 4, py: 1.5, px: 5, borderRadius: "20px", fontSize: "1.05rem", fontWeight: 800,
                boxShadow: "0 6px 12px rgba(0,168,89,0.3)",
                "&:hover": { transform: "scale(1.03)", boxShadow: "0 8px 16px rgba(0,200,117,0.4)" }
              }}>
              Envoyer "Billet" sur WhatsApp
            </Button>
          </Box>
        </motion.div>

        {/* PUBLICITÉ / PROMO */}
        <Box
          my={3}
          p={3}
          textAlign="center"
          sx={{
            borderRadius: 3,
            background: darkMode ? "#1A1A1A" : "#E6F7FF",
            boxShadow: 3,
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
            }
          }}
          onClick={() => window.open("https://www.toppromo.com", "_blank")}
        >
          <Typography variant="h5" fontWeight="700" color={darkMode ? "#00a859" : "#0077B6"}>
            🚀 Promo spéciale : Réservez maintenant et obtenez 10% de réduction !
          </Typography>
          <Typography variant="body2" mt={1} color="text.secondary">
            Offre valable jusqu’au 31 décembre 2025. Cliquez pour profiter.
          </Typography>
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

        {/* PARTENAIRES */}
{/* AVIS SUR LES COMPAGNIES */}
<Box py={4}>
  <Typography variant="h4" fontWeight="700" mb={2} textAlign="center">
    🚌 Avis sur les compagnies
  </Typography>
  <Grid container spacing={3} justifyContent="center">
    {[
      { company: "Sonef", review: "Bus ultraconfortable et personnel courtois." },
      { company: "STM", review: "Horaires respectés et prise en charge rapide." },
      { company: "Toupac", review: "Billets fiables et service professionnel." },
      { company: "Aga Transport", review: "Trajets agréables et sécurité assurée." }
    ].map((a, i) => (
      <Grid item xs={12} sm={6} md={3} key={i}>
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card sx={{ p: 2, textAlign: "center", boxShadow: 2, borderRadius: 2 }}>
            <Typography fontWeight="bold">{a.company}</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              “{a.review}”
            </Typography>
          </Card>
        </motion.div>
      </Grid>
    ))}
  </Grid>
</Box>

        {/* AVIS */}
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

        {/* AVANTAGES */}
        <Box py={4} textAlign="center">
          <Typography variant="h4" fontWeight="700" mb={2}>✅ Pourquoi Choisir FasoBillet ?</Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
            {advantages.map((a,i)=>
              <Card key={i} sx={{ p:2, minWidth:130, borderRadius:3, display:"flex", flexDirection:"column", alignItems:"center", boxShadow:3 }}>
                <Box fontSize="2rem" mb={1}>{a.icon}</Box>
                <Typography fontWeight="bold">{a.title}</Typography>
              </Card>
            )}
          </Box>
        </Box>

        {/* RESERVATION */}
        <Box py={4} textAlign="center">
          <Typography variant="h4" fontWeight="700" mb={2}>📝 Réserver Maintenant</Typography>
          <Card sx={{ borderRadius:"16px", p:3.5, display:"inline-block", boxShadow:5 }}>
            <Typography mb={1.5}>Cliquez ci-dessous pour commencer votre réservation via WhatsApp</Typography>
            <Button variant="contained" color="success" size="large" href={whatsappLink} target="_blank" startIcon={<WhatsAppIcon />}
              sx={{ mt:2, py:1.5, px:5, borderRadius:"20px", fontWeight:700, fontSize:"1rem", boxShadow:"0 8px 20px rgba(0,168,89,0.4)", "&:hover":{ transform:"scale(1.05)" } }}>
              Envoyer "Billet" sur WhatsApp
            </Button>
            <Typography mt={1.5} fontSize="0.85rem" color="text.secondary">Numéro WhatsApp officiel : <strong>{whatsappNumber}</strong></Typography>
          </Card>
        </Box>
{/* BOUTON ABONNEMENT VERS LA PAGE /abonnements */}
<Box py={4} textAlign="center">
  <Typography variant="h4" fontWeight="700" mb={2}>📦 Abonnement FasoBillet</Typography>
  <Card sx={{ borderRadius:"16px", p:3.5, display:"inline-block", boxShadow:5 }}>
    <Typography mb={1.5}>
      Profitez de tous les avantages : réservation automatique, suivi des billets, et offres exclusives.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      size="large"
      href="/abonnements"  // <-- redirige vers la page abonnements
      startIcon={<WhatsAppIcon />}
      sx={{
        mt:2,
        py:1.5,
        px:5,
        borderRadius:"20px",
        fontWeight:700,
        fontSize:"1rem",
        boxShadow:"0 8px 20px rgba(0,0,255,0.4)",
        "&:hover":{ transform:"scale(1.05)" }
      }}
    >
      S'abonner
    </Button>
  </Card>
</Box>

        {/* FOOTER */}
        <Divider sx={{ my:3 }} />
        <Box textAlign="center" py={2}>
          <Typography variant="body2">Email : contact@billetrapide-mali.ml</Typography>
          <Typography variant="body2" mt={0.5}>Adresse : Bamako, Mali</Typography>
          <Typography variant="body2" mt={0.5}>© {new Date().getFullYear()} FasoBillet — Tous droits réservés.</Typography>
        </Box>
      </Container>

      {/* FLOATING WHATSAPP BUTTON */}
      <Button variant="contained" color="success" href={whatsappLink} target="_blank" startIcon={<WhatsAppIcon />}
        sx={{ position:"fixed", bottom:20, right:20, borderRadius:"50px", py:1.5, px:3, fontWeight:700, boxShadow:"0 6px 12px rgba(0,168,89,0.3)" }}>
        WhatsApp
      </Button>
    </ThemeProvider>
  );
}
