import React, { useState } from "react";
import { usePage, useForm, Link } from "@inertiajs/react";
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem,
  ListItemIcon, ListItemText, CssBaseline, Box, Menu, MenuItem, Avatar,
  Divider, Tooltip, ListSubheader, Collapse
} from "@mui/material";
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, LocationCity as LocationCityIcon,
  Store as StoreIcon, DirectionsBus as DirectionsBusIcon, Person as PersonIcon,
  Group as GroupIcon, AltRoute as AltRouteIcon, TravelExplore as TravelExploreIcon,
  ConfirmationNumber as ConfirmationNumberIcon, LocalShipping as LocalShippingIcon,
  SyncAlt as SyncAltIcon, Logout as LogoutIcon, AccountCircle as AccountCircleIcon,
  ExpandLess, ExpandMore
} from "@mui/icons-material";
import ApplicationLogo from "@/Components/ApplicationLogo";

const drawerWidth = 240;

const menus = {
  management: [
    { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
    { title: "Paramètres géographiques", items: [{ text: "Villes", icon: <LocationCityIcon />, route: route("cities.index") }, { text: "Agences", icon: <StoreIcon />, route: route("agencies.index") }] },
    { title: "Transport", items: [{ text: "Transport", icon: <DirectionsBusIcon />,
        children: [{ text: "Avion", route: route("buses.index") },
             { text: "Routes", route: route("busroutes.index") }, { text: "Vol", route: route("trips.index") }] }] },
    { title: "Gestion commerciale", items: [
 { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") }, { text: "Transfers", icon: <SyncAltIcon />, route: route("transfers.index") }] },
    { title: "Utilisateurs", items: [{ text: "Utilisateurs", icon: <GroupIcon />, route: route("users.index") }] },
  ],
  agent: [
    { title: "Général", items: [{ text: "Tableau de bord", icon: <DashboardIcon />, route: route("dashboard") }] },
    { title: "Gestion commerciale", items: [
         { text: "Colis", icon: <LocalShippingIcon />, route: route("parcels.index") }, { text: "Transfers", icon: <SyncAltIcon />, route: route("transfers.index") }] },
  ]
};

export default function AuthenticatedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const { auth } = usePage().props;
  const user = auth?.user || {};
  const { post } = useForm();

  const menuData = user.role === "agent" ? menus.agent : menus.management;

  const toggleSection = (key) => setMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const drawerContent = (
    <Box>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
          <ApplicationLogo className="h-10 w-10" />
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>FasoBillet</Typography>
        </Link>
      </Toolbar>
      <Divider />
      <List>
        {menuData.map((section, i) => (
          <Box key={i}>
            <ListSubheader>{section.title}</ListSubheader>
            {section.items.map((item, j) => (
              !item.children ? (
                <ListItem button component={Link} href={item.route} key={j} onClick={() => setMobileOpen(false)}>
                  {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                  <ListItemText primary={item.text} />
                </ListItem>
              ) : (
                <Box key={j}>
                  <ListItem button onClick={() => toggleSection(item.text)}>
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText primary={item.text} />
                    {menuOpen[item.text] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={menuOpen[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                      {item.children.map((child, k) => (
                        <ListItem button component={Link} href={child.route} key={k} onClick={() => setMobileOpen(false)}>
                          <ListItemText primary={child.text} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              )
            ))}
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
            <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)}>
              <Avatar><AccountCircleIcon /></Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>Connecté en tant que <strong>&nbsp;{user.name}</strong></MenuItem>
            <Divider />
            <MenuItem onClick={() => post(route("logout"))}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Déconnexion</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }} open>
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f6fa", minHeight: "100vh", ml: { sm: `${drawerWidth}px` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
