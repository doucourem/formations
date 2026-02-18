import React, { useState } from "react";
import { usePage, useForm, Link } from "@inertiajs/react";
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, CssBaseline,
  Box, Menu, MenuItem, Avatar, Divider, Tooltip, ListSubheader,
  Collapse, Chip, Badge
} from "@mui/material";

import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  LocationCity as LocationCityIcon, Store as StoreIcon,
  DirectionsBus as DirectionsBusIcon, Group as GroupIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  LocalShipping as LocalShippingIcon, SyncAlt as SyncAltIcon,
  Logout as LogoutIcon, AccountCircle as AccountCircleIcon,
  ExpandLess, ExpandMore, Build as BuildIcon,
  AltRoute as AltRouteIcon, DriveEta as DriveEtaIcon,
  Commute as CommuteIcon, NotificationsNone as NotificationsIcon,
  GppGood
} from "@mui/icons-material";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const drawerWidth = 280; // Un peu plus large pour plus de confort visuel

export default function AuthenticatedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const { auth, counters: initialCounters } = usePage().props;
  const user = auth?.user || { name: 'Utilisateur', role: 'agent' };
  const { post } = useForm();

  const [counters] = useState(initialCounters || {
    tickets: 5,
    parcels: 12,
    transfers: 2,
    maintenance_due: 3
  });

  // Gestion des menus (Votre logique de rôles est conservée)
  // Blocs de menus réutilisables
const commonCommercial = {
  title: "Gestion commerciale",
  items: [
    { text: "Billets vendus", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
    { text: "Courriers & Colis", icon: <LocalShippingIcon />, route: route("parcels.index") },
    { text: "Livraison", icon: <SyncAltIcon />, route: route("deliveries.index") },
    { text: "Location", icon: <DriveEtaIcon />, route: route("vehicle-rentals.index") },
    { text: "Transfers", icon: <AttachMoneyIcon />, route: route("transfers.index") }
  ]
};

const commonTransport = {
  title: "Transport",
  items: [{
    text: "Transport", icon: <DirectionsBusIcon />,
    children: [
      { text: "Bus", route: route("buses.index"), icon: <DirectionsBusIcon /> },
      { text: "Chauffeurs", route: route("drivers.index"), icon: <GroupIcon /> },
      { text: "Garage", route: route("garages.index"), icon: <BuildIcon /> },
      { text: "Routes", route: route("busroutes.index"), icon: <AltRouteIcon /> },
      { text: "Voyages", route: route("trips.index"), icon: <CommuteIcon /> }
    ]
  }]
};

const dashboardItem = { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] };

// Définition finale des menus par rôle
const menusByRole = {
    super_admin: [
        dashboardItem,
        { title: "Paramètres géo", items: [
            { text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") },
            { text: "Compagnie", icon: <StoreIcon />, route: route("companies.index") },
            { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") }
        ]},
        commonTransport,
        commonCommercial,
        { title: "Utilisateurs", items: [{ text: "Utilisateurs", icon: <GroupIcon />, route: route("users.index") }] }
    ],
    admin: [dashboardItem, commonTransport, commonCommercial, { title: "Utilisateurs", items: [{ text: "Utilisateurs", icon: <GroupIcon />, route: route("users.index") }] }],

    // On regroupe les rôles identiques
    manager: [dashboardItem, commonCommercial],
    manageragence: [dashboardItem,commonTransport, commonCommercial],
    agent: [dashboardItem,commonTransport, commonCommercial],
    garage: [{ title: "Maintenance", items: [{ text: "Garage", icon: <BuildIcon />, route: route("garages.index") }, { text: "Bus en maintenance", icon: <DirectionsBusIcon />, route: route("buses.index") }] }],
    chauffeur: [{ title: "Mes voyages", items: [{ text: "Voyages assignés", icon: <CommuteIcon />, route: route("trips.index") }] }],
    logistique: [{ title: "Livraison & Colis", items: commonCommercial.items.filter(i => i.text !== "Billets vendus") }] // Exemple de filtrage
};

  const menuData = menusByRole[user.role] || menusByRole['agent'];

  const toggleSection = (key) => {
    setMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '5px', display: 'flex' }}>
            <GppGood sx={{ color: '#fff', fontSize: 24 }} />
        </div>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, color: '#0f172a' }}>
            NILA <span style={{ color: '#10b981' }}>ToulTrans</span>
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {menuData.map((section, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <ListSubheader sx={{
                bgcolor: 'transparent',
                lineHeight: '30px',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'slate.400',
                mb: 1
            }}>
              {section.title}
            </ListSubheader>

            {section.items.map((item, j) =>
              !item.children ? (
                <ListItemButton
                    key={j}
                    component={Link}
                    href={item.route}
                    sx={{ borderRadius: '12px', mb: 0.5, '&.Mui-selected': { bgcolor: '#f0fdf4' } }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#64748b' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }} />

                  {item.text === "Billetterie" && counters.tickets > 0 && <Chip label={counters.tickets} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, height: 20 }} />}
                  {item.text === "Fret & Colis" && counters.parcels > 0 && <Chip label={counters.parcels} size="small" sx={{ bgcolor: '#fef9c3', color: '#854d0e', fontWeight: 700, height: 20 }} />}
                </ListItemButton>
              ) : (
                <Box key={j}>
                  <ListItemButton onClick={() => toggleSection(item.text)} sx={{ borderRadius: '12px' }}>
                    <ListItemIcon sx={{ minWidth: 40, color: '#64748b' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }} />
                    {menuOpen[item.text] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={menuOpen[item.text]} timeout="auto">
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {item.children.map((child, k) => (
                        <ListItemButton key={k} component={Link} href={child.route} sx={{ borderRadius: '10px', ml: 1 }}>
                          <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: '0.8rem', color: '#64748b' }} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              )
            )}
          </Box>
        ))}
      </List>

      <Box sx={{ p: 2, bgcolor: '#f8fafc', m: 2, borderRadius: '16px', textAlign: 'center' }}>
          <Typography variant="caption" fontWeight="bold" color="slate.500">SUPPORT SIRA</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'slate.400' }}>Besoin d'aide ? Contactez Africa tech labs</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <CssBaseline />

      {/* --- NAVBAR --- */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #e2e8f0',
            color: '#0f172a'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" fontWeight="700">Système de Suivi Intégré</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
                <IconButton size="small"><Badge badgeContent={4} color="error"><NotificationsIcon /></Badge></IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" fontWeight="800" lineHeight={1}>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{user.role}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#0f172a', width: 35, height: 35 }}>{user.name[0]}</Avatar>
            </Box>
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: '12px', mt: 1, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } }}>
            <MenuItem onClick={() => post(route("logout"))} sx={{ color: 'error.main', fontWeight: 600 }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* --- SIDEBAR --- */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, borderRight: '1px solid #e2e8f0' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* --- CONTENT --- */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar /> {/* Spacer */}
        {children}
      </Box>
    </Box>
  );
}
