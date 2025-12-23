import React, { useState } from "react";
import { Box, Typography, Button, Stack, Container, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { motion } from "framer-motion";
import { Menu as MenuIcon } from "@mui/icons-material";
import Logo from "@/Assets/logo.png";

export default function PageHero({ title, subtitle, buttonText, buttonLink }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuLinks = {
    "Compagnies": "/compagnies",
    "Garages": "/maintenance",
    "Logistique / PL": "/gros-porteurs"
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <Box 
      component="header"
      sx={{ 
        borderRadius: "0 0 40px 40px",
        background: "linear-gradient(135deg, #e6fff0 0%, #ffffff 100%)", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        mb: 6,
        overflow: "hidden"
      }}
    >
      <Container maxWidth="lg">
        {/* --- BARRE DE NAVIGATION --- */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={3}>
          {/* LOGO */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ bgcolor: "success.main", p: 1, borderRadius: 2, display: "flex", color: "white" }}>
              <img src={Logo} alt="Logo" style={{ height: 40, width: "auto" }} />
            </Box>
            <Typography variant="h6" fontWeight="900" color="success.dark">
              Faso Billet
            </Typography>
          </Stack>

          {/* MENU (Desktop) */}
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {Object.keys(menuLinks).map((item) => (
              <Typography 
                key={item} 
                variant="body2" 
                fontWeight="700" 
                component="a"
                href={menuLinks[item]}
                sx={{ cursor: "pointer", textDecoration: "none", color: "inherit", "&:hover": { color: "success.main" } }}
              >
                {item}
              </Typography>
            ))}
          </Stack>

          {/* MENU (Mobile) */}
          <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Stack>

        {/* --- DRAWER MOBILE --- */}
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250, p: 2 }}>
            <List>
              {Object.keys(menuLinks).map((item) => (
                <ListItem button component="a" href={menuLinks[item]} key={item} onClick={toggleDrawer(false)}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* --- CONTENU DU HERO --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box textAlign="center" pt={4} pb={10}>
            <Typography variant="h3" fontWeight="900" color="success.dark" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              {title}
            </Typography>
            <Typography variant="h6" mt={2} color="text.secondary" sx={{ maxWidth: 600, mx: "auto", fontWeight: 400 }}>
              {subtitle}
            </Typography>
            
            {buttonText && buttonLink && (
              <Button 
                variant="contained" 
                color="success" 
                size="large" 
                href={buttonLink} 
                sx={{ mt: 4, px: 4, py: 1.5, borderRadius: 3, textTransform: "none", fontWeight: "bold", boxShadow: "0 8px 16px rgba(46, 125, 50, 0.2)" }}
              >
                {buttonText}
              </Button>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
