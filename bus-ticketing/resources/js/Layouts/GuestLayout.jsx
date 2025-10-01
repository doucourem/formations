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
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import RouteIcon from '@mui/icons-material/AltRoute';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

const drawerWidth = 240;

export default function GuestLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, route: route('dashboard') },
    { text: 'Villes', icon: <LocationCityIcon />, route: route('cities.index') },
    { text: 'Bus', icon: <DirectionsBusIcon />, route: route('buses.index') },
    { text: 'Agences', icon: <StoreIcon />, route: route('agencies.index') },
    { text: 'Trajets', icon: <RouteIcon />, route: route('routes.index') },
    { text: 'Voyages', icon: <TripOriginIcon />, route: route('trips.index') },
    { text: 'Billets', icon: <ConfirmationNumberIcon />, route: route('ticket.index') },
    { text: 'Utilisateurs', icon: <PeopleIcon />, route: route('users.index') },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Link href="/">
          <ApplicationLogo className="h-16 w-16" />
        </Link>
      </Box>
      <Divider />
      {/* Menu */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} button component={Link} href={item.route}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
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

      {/* Drawer Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Drawer Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
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
          mt: { xs: 7, sm: 0 }, // décale le contenu sous AppBar mobile
          ml: { sm: `${drawerWidth}px` }, // décale le contenu pour desktop
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
