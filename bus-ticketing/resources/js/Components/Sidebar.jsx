// resources/js/Components/Sidebar.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

// MUI
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import StoreIcon from '@mui/icons-material/Store';
import RouteIcon from '@mui/icons-material/AltRoute';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

const Sidebar = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, route: route('dashboard') },
    { text: 'Profil', icon: <AccountCircleIcon />, route: route('profile.edit') },
    { text: 'Villes', icon: <LocationCityIcon />, route: route('cities.index') },
    { text: 'Bus', icon: <DirectionsBusIcon />, route: route('buses.index') },
    { text: 'Agences', icon: <StoreIcon />, route: route('agencies.index') },
    { text: 'Trajets', icon: <RouteIcon />, route: route('routes.index') },
    { text: 'Voyages', icon: <TripOriginIcon />, route: route('trips.index') },
    { text: 'Billets', icon: <ConfirmationNumberIcon />, route: route('ticket.index') },
    { text: 'Utilisateurs', icon: <PeopleIcon />, route: route('users.index') },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap>
          Menu
        </Typography>
      </Toolbar>
      <Divider />
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
    </Drawer>
  );
};

export default Sidebar;
