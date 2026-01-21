import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import StoreIcon from "@mui/icons-material/Store";
import RouteIcon from "@mui/icons-material/AltRoute";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";

const drawerWidth = 240;

const Sidebar = () => {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  let menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, route: route("dashboard") },
    { text: "Profil", icon: <AccountCircleIcon />, route: route("profile.edit") },
  ];

  if (user.role === "admin" || user.role === "manager") {
    menuItems.push(
      { text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") },
      { text: "Bus", icon: <DirectionsBusIcon />, route: route("buses.index") },
      { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") },
      { text: "Trajets", icon: <RouteIcon />, route: route("busroutes.index") },
      { text: "Voyages", icon: <TripOriginIcon />, route: route("trips.index") },
      { text: "Billets", icon: <ConfirmationNumberIcon />, route: route("ticket.index") },
      { text: "Utilisateurs", icon: <PeopleIcon />, route: route("users.index") }
    );
  } else if (user.role === "manageragence") {
    menuItems.push(
      { text: "Voyages", icon: <TripOriginIcon />, route: route("trips.index") },
      { text: "Billets", icon: <ConfirmationNumberIcon />, route: route("ticket.index", { agence_id: user.agence_id }) }
    );
  } else if (user.role === "agent") {
    menuItems.push(
      { text: "Voyages", icon: <TripOriginIcon />, route: route("trips.index") },
      { text: "Billets", icon: <ConfirmationNumberIcon />, route: route("ticket.index", { agence_id: user.agence_id }) }
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Menu principal
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
            sx={{
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
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
