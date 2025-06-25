import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
      <List>
        {user ? (
          <>
            <ListItem>
              <ListItemText primary={`👋 ${user.username}`} />
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Connexion" />
            </ListItem>
            <ListItem button component={Link} to="/register">
              <ListItemText primary="Inscription" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo & Titre */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" fontSize="large" />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            >
              EduTrack
            </Typography>
          </Box>

          {/* Menu mobile ou desktop */}
          {isMobile ? (
            <>
              <IconButton edge="end" color="inherit" onClick={toggleDrawer} aria-label="menu">
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user ? (
                <>
                  <Typography variant="body1">👋 {user.username}</Typography>
                  <Button variant="contained" color="error" onClick={logout}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" color="primary">
                    Connexion
                  </Button>
                  <Button component={Link} to="/register" variant="contained" color="primary">
                    Inscription
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Topbar;
