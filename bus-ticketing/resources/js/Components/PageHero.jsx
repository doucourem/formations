import React, { useState } from "react";
import { Box, Typography, Button, Stack, Container, IconButton, Drawer, List, ListItemButton, ListItemText, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Menu as MenuIcon } from "@mui/icons-material";
import Logo from "@/Assets/logo.png";

export default function PageHero({ title, subtitle, buttonText, buttonLink }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const menuLinks = {
    "Compagnies": "/compagnies",
    "Garages": "/maintenance",
    "Logistique / PL": "/gros-porteurs"
  };

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  return (
    <Box
      component="header"
      sx={{
        borderRadius: "0 0 20px 20px",
        background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.background.paper} 100%)`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        mb: 6,
        overflow: "hidden"
      }}
    >
      <Container maxWidth="lg">
        {/* Navigation */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" py={3}>
          {/* Logo */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ bgcolor: "success.main", p: 1, borderRadius: 2, display: "flex", color: "white" }}>
              <img src={Logo} alt="Logo" style={{ height: 40, width: "auto" }} />
            </Box>
            <Typography variant="h6" fontWeight="900" color="success.dark">
              Faso Billet
            </Typography>
          </Stack>

          {/* Desktop Menu */}
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {Object.entries(menuLinks).map(([label, link]) => (
              <Typography
                key={label}
                variant="body2"
                fontWeight="700"
                component="a"
                href={link}
                sx={{
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": { color: "success.main", textDecoration: "underline" },
                  transition: "0.3s"
                }}
              >
                {label}
              </Typography>
            ))}
          </Stack>

          {/* Mobile Menu */}
          <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={toggleDrawer(true)} aria-label="open menu">
            <MenuIcon />
          </IconButton>
        </Stack>

        {/* Drawer Mobile */}
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250, p: 2 }}>
            <List>
              {Object.entries(menuLinks).map(([label, link]) => (
                <ListItemButton
                  component="a"
                  href={link}
                  key={label}
                  onClick={toggleDrawer(false)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText primary={label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
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
                sx={{
                  mt: 4,
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  boxShadow: "0 8px 16px rgba(46, 125, 50, 0.2)",
                  transition: "0.3s",
                  "&:hover": { boxShadow: "0 12px 24px rgba(46,125,50,0.3)" }
                }}
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
