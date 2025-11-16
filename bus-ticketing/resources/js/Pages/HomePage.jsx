import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Button, Container, Box, CssBaseline,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Divider, createTheme, ThemeProvider, Card, CardContent, Grid
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { motion } from "framer-motion";
import { FaBus, FaClock, FaShieldAlt, FaMobileAlt, FaTicketAlt } from "react-icons/fa";

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
          <IconButton edge="start" color="inherit"><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>Billet Rapide Mali</Typography>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box textAlign="center" py={10} sx={{
            borderRadius: 5,
            background: darkMode
              ? "linear-gradient(135deg,#111,#222)"
              : "linear-gradient(135deg,#e6fff0,#ffffff)",
            boxShadow: 6,
            mb: 6
          }}>
            <Typography variant="h2" fontWeight="900" color="success.main">🎫 Votre Billet en 3 Minutes</Typography>
            <Typography variant="h5" mt={2} color="text.secondary">Réservation ultra-rapide via WhatsApp</Typography>
            <Button variant="contained" color="success" size="large" href={whatsappLink} target="_blank" startIcon={<WhatsAppIcon />}
              sx={{
                mt: 5, py: 1.8, px: 5, borderRadius: "20px", fontSize: "1.1rem", fontWeight: 800,
                boxShadow: "0 8px 20px rgba(0,168,89,0.4)",
                "&:hover": { transform: "scale(1.05)", boxShadow: "0 10px 25px rgba(0,200,117,0.5)" }
              }}>
              Envoyer "Billet" sur WhatsApp
            </Button>
          </Box>
        </motion.div>

        {/* TARIFS */}
        <Box py={4}>
          <Typography variant="h4" fontWeight="700" mb={3} textAlign="center">💰 Tarifs & Trajets</Typography>
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
        <Box py={4}>
          <Typography variant="h4" fontWeight="700" mb={3} textAlign="center">🚌 Compagnies Partenaires</Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={3}>
            {["Sonef","STM","Toupac","Aga Transport"].map(c=>
              <Card key={c} sx={{ p:2, minWidth:120, textAlign:"center", borderRadius:3, boxShadow:3, "&:hover":{transform:"translateY(-3px)", boxShadow:"0 8px 20px rgba(0,0,0,0.2)", transition:"0.3s"} }}>
                <Typography fontWeight="bold">{c}</Typography>
              </Card>
            )}
          </Box>
        </Box>

        {/* AVIS */}
        <Box py={4} sx={{ backgroundColor: darkMode?"#111":"#f0f4f8", borderRadius:3 }}>
          <Typography variant="h4" fontWeight="700" mb={3} textAlign="center">⭐ Avis des Clients</Typography>
          <Grid container spacing={3} justifyContent="center">
            {testimonials.map((t,i)=>
              <Grid item xs={12} sm={4} key={i}>
                <motion.div whileHover={{ scale:1.03 }}>
                  <Card sx={{ p:3, textAlign:"center", boxShadow:3 }}>
                    <Typography fontWeight="bold">{t.name}</Typography>
                    <Typography fontSize="0.95rem" mt={1}>{t.comment}</Typography>
                  </Card>
                </motion.div>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* AVANTAGES */}
        <Box py={4} textAlign="center">
          <Typography variant="h4" fontWeight="700" mb={3}>✅ Pourquoi Choisir Billet Rapide Mali ?</Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3}>
            {advantages.map((a,i)=>
              <Card key={i} sx={{ p:2, minWidth:140, borderRadius:3, display:"flex", flexDirection:"column", alignItems:"center", boxShadow:3 }}>
                <Box fontSize="2rem" mb={1}>{a.icon}</Box>
                <Typography fontWeight="bold">{a.title}</Typography>
              </Card>
            )}
          </Box>
        </Box>

        {/* RESERVATION */}
        <Box py={4} textAlign="center">
          <Typography variant="h4" fontWeight="700" mb={3}>📝 Réserver Maintenant</Typography>
          <Card sx={{ borderRadius:"16px", p:4, display:"inline-block", boxShadow:5 }}>
            <Typography mb={2}>Cliquez ci-dessous pour commencer votre réservation via WhatsApp</Typography>
            <Button variant="contained" color="success" size="large" href={whatsappLink} target="_blank" startIcon={<WhatsAppIcon />}
              sx={{ mt:2, py:1.8, px:5, borderRadius:"20px", fontWeight:700, fontSize:"1rem", boxShadow:"0 8px 20px rgba(0,168,89,0.4)", "&:hover":{ transform:"scale(1.05)" } }}>
              Envoyer "Billet" sur WhatsApp
            </Button>
            <Typography mt={2} fontSize="0.9rem" color="text.secondary">Numéro WhatsApp officiel : <strong>{whatsappNumber}</strong></Typography>
          </Card>
        </Box>

        {/* FOOTER */}
        <Divider sx={{ my:4 }} />
        <Box textAlign="center" py={3}>
          <Typography variant="body2">Email : contact@billetrapide-mali.ml</Typography>
          <Typography variant="body2" mt={1}>Adresse : Bamako, Mali</Typography>
          <Typography variant="body2" mt={1}>© {new Date().getFullYear()} Billet Rapide Mali — Tous droits réservés.</Typography>
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
