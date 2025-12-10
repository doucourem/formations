import React, { useState } from "react";
import { usePage, useForm, Link } from "@inertiajs/react";
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, CssBaseline,
  Box, Menu, MenuItem, Avatar, Divider, Tooltip, ListSubheader,
  Collapse
} from "@mui/material";

import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  LocationCity as LocationCityIcon, Store as StoreIcon,
  DirectionsBus as DirectionsBusIcon, Group as GroupIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  LocalShipping as LocalShippingIcon, SyncAlt as SyncAltIcon,
  Logout as LogoutIcon, AccountCircle as AccountCircleIcon,
  ExpandLess, ExpandMore
} from "@mui/icons-material";
import { Chip } from "@mui/material";

import ApplicationLogo from "@/Components/ApplicationLogo";

const drawerWidth = 240;

// -------------------- MENUS --------------------
const menus = {
  management: [
    {
      title: "Général",
      items: [
        { text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }
      ]
    },
    {
      title: "Paramètres géographiques",
      items: [
        { text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") },
        { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") }
      ]
    },
    {
      title: "Transport",
      items: [
        {
          text: "Transport",
          icon: <DirectionsBusIcon />,
          children: [
            { text: "Bus", route: route("buses.index") },
            { text: "Chauffeurs", route: route("drivers.index") },
            { text: "Routes", route: route("busroutes.index") },
            { text: "Voyages", route: route("trips.index") }
          ]
        }
      ]
    },
    {
      title: "Gestion commerciale",
      items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Transfers", icon: <SyncAltIcon />, route: route("transfers.index") }
      ]
    },
    {
      title: "Utilisateurs",
      items: [
        { text: "Utilisateurs", icon: <GroupIcon />, route: route("users.index") }
      ]
    }
  ],
  agent: [
    {
      title: "Général",
      items: [
        { text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }
      ]
    },
    {
      title: "Gestion commerciale",
      items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Transfers", icon: <SyncAltIcon />, route: route("transfers.index") }
      ]
    }
  ]
};

// -----------------------------------------------------

export default function AuthenticatedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const { auth } = usePage().props;
  const user = auth?.user || {};
  const { post } = useForm();
  const { counters: initialCounters } = usePage().props; // Laravel doit envoyer ces données

const [counters, setCounters] = useState(initialCounters || {
  tickets: 0,
  parcels: 0,
  transfers: 0,
  maintenance_due: 0
});

  const menuData = user.role === "agent" ? menus.agent : menus.management;

  const toggleSection = (key) => {
    setMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------------- Drawer Content ------------------
  const drawerContent = (
    <Box>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Link href={route("dashboard")} style={{ display: "flex", alignItems: "center" }}>
          <ApplicationLogo className="h-10 w-10" />
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
            FasoBillet
          </Typography>
        </Link>
      </Toolbar>
      <Divider />

      <List>
        {menuData.map((section, i) => (
          <Box key={i}>
            <ListSubheader sx={{ fontWeight: 700 }}>{section.title}</ListSubheader>

            {section.items.map((item, j) =>
              !item.children ? (
                <ListItemButton
                  component={Link}
                  href={item.route}
                  key={j}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ) : (
                <Box key={j}>
                  <ListItemButton onClick={() => toggleSection(item.text)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {menuOpen[item.text] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={menuOpen[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                     {item.children.map((child, k) => (
  <ListItemButton
    key={k}
    component={Link}
    href={child.route}
    onClick={() => setMobileOpen(false)}
  >
    <ListItemText
      primary={
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{child.text}</span>

          {/* ---- BADGES ---- */}
          {child.text === "Billets vendus" && counters?.tickets > 0 && (
            <Chip label={counters.tickets} color="primary" size="small" />
          )}

          {child.text === "Colis" && counters?.parcels > 0 && (
            <Chip label={counters.parcels} color="secondary" size="small" />
          )}

          {child.text === "Transfers" && counters?.transfers > 0 && (
            <Chip label={counters.transfers} color="success" size="small" />
          )}

          {child.text === "Bus" && counters?.maintenance_due > 0 && (
            <Chip
              label={counters.maintenance_due}
              color="error"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          )}
        </Box>
      }
    />
  </ListItemButton>
))}
                    </List>
                  </Collapse>
                </Box>
              )
            )}

            <Divider sx={{ my: 1 }} />
          </Box>
        ))}
      </List>
    </Box>
  );

  // ---------------- Layout ------------------

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* TOP BAR */}
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tableau de bord
          </Typography>

          <Tooltip title="Mon compte">
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar><AccountCircleIcon /></Avatar>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              Connecté en tant que <strong>&nbsp;{user.name}</strong>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => post(route("logout"))}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DESKTOP DRAWER */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" }
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* PAGE CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f6fa",
          minHeight: "100vh",
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
