import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import RouteIcon from "@mui/icons-material/AltRoute";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ApplicationLogo from "@/Components/ApplicationLogo";

const drawerWidth = 240;

export default function AuthenticatedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { auth, url } = usePage().props;
  const user = auth?.user || {};

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Items du menu
  const menuItems = [
    { text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") },
    { text: "Bus", icon: <DirectionsBusIcon />, route: route("buses.index") },
    { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") },
    { text: "Trajets", icon: <RouteIcon />, route: route("busroutes.index") },
    { text: "Voyages", icon: <TripOriginIcon />, route: route("trips.index") },
    { text: "Billets", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
  ];

  if (user.role === "admin") {
    menuItems.push({ text: "Utilisateurs", icon: <PeopleIcon />, route: route("users.index") });
  }

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar />
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            href={item.route}
            selected={url === item.route}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Link href="/" style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
            <ApplicationLogo className="h-10 w-10 mr-2" />
          </Link>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestion Billets
          </Typography>

          {/* Menu utilisateur */}
          <Tooltip title="Compte utilisateur">
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: "#1976d2" }}>
                {user.prenom?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled>
              <Typography variant="subtitle1">
                {user.prenom} {user.name}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem component={Link} href={route("profile.edit")}>
              <AccountCircleIcon sx={{ mr: 1 }} /> Profil
            </MenuItem>
            <MenuItem component={Link} href={route("logout")} method="post" as="button">
              <LogoutIcon sx={{ mr: 1 }} /> Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer permanent desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Drawer temporaire mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
