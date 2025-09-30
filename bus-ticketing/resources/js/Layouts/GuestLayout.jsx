import React, { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

// MUI
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
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import StoreIcon from '@mui/icons-material/Store';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

export default function GuestLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Menu items
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, route: route('dashboard') },
    { text: 'Villes', icon: <LocationCityIcon />, route: route('cities.index') },
    { text: 'Bus', icon: <DirectionsBusIcon />, route: route('buses.index') },
    { text: 'Agences', icon: <StoreIcon />, route: route('agencies.index') },
    { text: 'Trajets', icon: <AltRouteIcon />, route: route('routes.index') },
    { text: 'Voyages', icon: <TripOriginIcon />, route: route('trips.index') },
    { text: 'Billets', icon: <ConfirmationNumberIcon />, route: route('ticket.index') },
    { text: 'Utilisateurs', icon: <PeopleIcon />, route: route('users.index') },
  ];

  // Drawer (menu latéral)
  const drawer = (
    <div>
      <div className="flex justify-center p-4">
        <Link href="/">
          <ApplicationLogo className="h-16 w-16 fill-current text-gray-500" />
        </Link>
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            href={item.route}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Bouton menu pour mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Gestion Billets
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer permanent pour desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8 }}
      >
        {children}
      </Box>
    </Box>
  );
}
