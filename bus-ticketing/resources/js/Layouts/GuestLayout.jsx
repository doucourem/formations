import React, { useState } from "react";
import { usePage, useForm, Link } from "@inertiajs/react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  ListSubheader,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ApplicationLogo from "@/Components/ApplicationLogo";


const drawerWidth = 240;

export default function AuthenticatedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const { post } = useForm();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => post(route("logout"));

  /** --------------------------------------------------------
   * MENUS SELON LE ROLE
   * -------------------------------------------------------- */
  const managementMenu = [
  { text: "Tableau de bord", icon: <LocationCityIcon />, route: route("dashboard") },
    { text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") },
    { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") },
    { text: "Bus", icon: <DirectionsBusIcon />, route: route("buses.index") },
    { text: "Chauffeurs", icon: <PeopleIcon />, route: route("drivers.index") },
    { text: "Routes", icon: <AltRouteIcon />, route: route("busroutes.index") },
    { text: "Voyages", icon: <TravelExploreIcon />, route: route("trips.index") },
     { text: "Utilisateurs",  icon: <PeopleIcon />,   route: route("users.index") },
  ];

  const ticketMenu = [
    { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
    { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
  ];

  // Si agent : seulement tickets + colis
  const menuToShow =
    user.role === "agent"
      ? ticketMenu
      : [...managementMenu, ...ticketMenu];

  /** --------------------------------------------------------
   * DRAWER (menu latéral)
   * -------------------------------------------------------- */
 const drawer = (
  <Box>
    {/* Logo et titre */}
    <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
        <ApplicationLogo className="h-10 w-10" />
        <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
          FasoBillet
        </Typography>
      </Link>
    </Toolbar>

    <Divider />

    {/* Menu */}
    <List
      subheader={<ListSubheader>Navigation</ListSubheader>}
      sx={{ mt: 1 }}
    >
      {menuToShow.map((item, index) => (
        <ListItem
          button
          key={index}
          component={Link}
          href={item.route}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  </Box>
);


  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {/* Bouton menu mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tableau de bord
          </Typography>

          {/* Profil */}
          <Tooltip title="Mon compte">
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              Connecté en tant que <strong>&nbsp;{user.name}</strong>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* DRAWER MOBILE */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* DRAWER DESKTOP */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* MAIN CONTENT FIXÉ CORRECTEMENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f6fa",
          minHeight: "100vh",
          ml: { sm: `${drawerWidth}px` }, // Décalage drawer desktop
        }}
      >
        {/* Pousse le contenu sous l'AppBar */}
        <Toolbar />

        {children}
      </Box>
    </Box>
  );
}
