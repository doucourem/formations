import React, { useState } from "react";
import { usePage, useForm, Link } from "@inertiajs/react";
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, CssBaseline,
  Box, Menu, MenuItem, Avatar, Divider, Tooltip, ListSubheader,
  Collapse, Chip
} from "@mui/material";

import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  LocationCity as LocationCityIcon, Store as StoreIcon,
  DirectionsBus as DirectionsBusIcon, Group as GroupIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  LocalShipping as LocalShippingIcon, SyncAlt as SyncAltIcon,
  Logout as LogoutIcon, AccountCircle as AccountCircleIcon,
  ExpandLess, ExpandMore, Build as BuildIcon,
  AltRoute as AltRouteIcon, DriveEta as DriveEtaIcon, Commute as CommuteIcon
} from "@mui/icons-material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ApplicationLogo from "@/Components/ApplicationLogo";

const drawerWidth = 240;

export default function AuthenticatedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const { auth, counters: initialCounters } = usePage().props;
  const user = auth?.user || {};
  const { post } = useForm();

  const [counters] = useState(initialCounters || {
    tickets: 0,
    parcels: 0,
    transfers: 0,
    maintenance_due: 0
  });

  // ----- MENUS PAR PROFIL -----
  const menusByRole = {
    super_admin: [
      { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
      { title: "Paramètres géographiques", items: [
        { text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") },
        { text: "Compagnie", icon: <StoreIcon />, route: route("companies.index") },
        { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") }
      ]},
      { title: "Transport", items: [
        { text: "Transport", icon: <DirectionsBusIcon />, children: [
          { text: "Bus", route: route("buses.index"), icon: <DirectionsBusIcon /> },
          { text: "Chauffeurs", route: route("drivers.index"), icon: <GroupIcon /> },
          { text: "Garage", route: route("garages.index"), icon: <BuildIcon /> },
          { text: "Routes", route: route("busroutes.index"), icon: <AltRouteIcon /> },
          { text: "Voyages", route: route("trips.index"), icon: <CommuteIcon /> }
        ]}
      ]},
      { title: "Gestion commerciale", items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
        { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
        { text: "Transfers", icon: <AttachMoneyIcon />, route: route("transfers.index") }
      ]},
      { title: "Utilisateurs", items: [{ text: "Utilisateurs", icon: <GroupIcon />, route: route("users.index") }] }
    ],
    admin: [
      // même structure que super_admin mais sans certaines sections si nécessaire
      // ici on laisse tout comme super_admin pour simplification
      { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
      { title: "Transport", items: [
        { text: "Transport", icon: <DirectionsBusIcon />, children: [
          { text: "Bus", route: route("buses.index"), icon: <DirectionsBusIcon /> },
          { text: "Chauffeurs", route: route("drivers.index"), icon: <GroupIcon /> },
          { text: "Garage", route: route("garages.index"), icon: <BuildIcon /> },
          { text: "Routes", route: route("busroutes.index"), icon: <AltRouteIcon /> },
          { text: "Voyages", route: route("trips.index"), icon: <CommuteIcon /> }
        ]}
      ]},
      { title: "Gestion commerciale", items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
        { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
        { text: "Transfers", icon: <AttachMoneyIcon />, route: route("transfers.index") }
      ]},
      { title: "Utilisateurs", items: [{ text: "Utilisateurs", icon: <GroupIcon />, route: route("users.index") }] }
    ],
    garage: [
      { title: "Maintenance", items: [
        { text: "Garage", icon: <BuildIcon />, route: route("garages.index") },
        { text: "Bus en maintenance", icon: <DirectionsBusIcon />, route: route("buses.index") }
      ]}
    ],
    manager: [
      { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
      { title: "Gestion commerciale", items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
        { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
        { text: "Transfers", icon: <AttachMoneyIcon />, route: route("transfers.index") }
      ]}
    ],
    manageragence: [
      { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
      { title: "Gestion commerciale", items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
        { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
        { text: "Transfers", icon: <AttachMoneyIcon />, route: route("transfers.index") }
      ]}
    ],
    agent: [
      { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
      { title: "Gestion commerciale", items: [
        { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
        { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
        { text: "Transfers", icon: <AttachMoneyIcon />, route: route("transfers.index") }
      ]}
    ],
    chauffeur: [
      { title: "Mes voyages", items: [{ text: "Voyages assignés", icon: <CommuteIcon />, route: route("trips.index") }] }
    ],
    
    logistique: [
      { title: "Livraison & Colis", items: [
        { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
        { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
          { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
      ]}
    ]
  };

  const menuData = menusByRole[user.role] || [];

  const toggleSection = (key) => {
    setMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const drawerContent = (
    <Box>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Link href={route("dashboard")} style={{ display: "flex", alignItems: "center" }}>
          <ApplicationLogo className="h-10 w-10" />
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>FasoBillet</Typography>
        </Link>
      </Toolbar>
      <Divider />
      <List>
        {menuData.map((section, i) => (
          <Box key={i}>
            <ListSubheader sx={{ fontWeight: 700 }}>{section.title}</ListSubheader>
            {section.items.map((item, j) =>
              !item.children ? (
                <Tooltip title={item.text} placement="right" key={j}>
                  <ListItemButton component={Link} href={item.route} onClick={() => setMobileOpen(false)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {/* Badges */}
                    {item.text === "Billets vendus" && counters.tickets > 0 && <Chip label={counters.tickets} size="small" color="primary" />}
                    {item.text === "Colis" && counters.parcels > 0 && <Chip label={counters.parcels} size="small" color="secondary" />}
                    {item.text === "Transfers" && counters.transfers > 0 && <Chip label={counters.transfers} size="small" color="success" />}
                    {item.text === "Bus" && counters.maintenance_due > 0 && <Chip label={counters.maintenance_due} size="small" color="error" />}
                  </ListItemButton>
                </Tooltip>
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
                        <Tooltip title={child.text} placement="right" key={k}>
                          <ListItemButton component={Link} href={child.route} onClick={() => setMobileOpen(false)}>
                            <ListItemIcon>{child.icon}</ListItemIcon>
                            <ListItemText primary={child.text} />
                          </ListItemButton>
                        </Tooltip>
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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Tableau de bord</Typography>
          <Tooltip title="Mon compte">
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar><AccountCircleIcon /></Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>Connecté en tant que <strong>&nbsp;{user.name}</strong></MenuItem>
            <Divider />
            <MenuItem onClick={() => post(route("logout"))}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f6fa", minHeight: "100vh", ml: { sm: `${drawerWidth}px` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
