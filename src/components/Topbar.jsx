import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="sticky" color="default" elevation={1} role="banner" aria-label="Barre de navigation principale">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo + Titre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" fontSize="large" />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            aria-label="Accueil EduTrack"
          >
            EduTrack
          </Typography>
        </Box>

        {/* Utilisateur */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Typography aria-label={`Bonjour ${user.username}`} variant="body1">
                👋 {user.username}
              </Typography>
              <Button
                onClick={logout}
                variant="contained"
                color="error"
                aria-label="Se déconnecter"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                color="primary"
                aria-label="Se connecter"
              >
                Connexion
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
                aria-label="Créer un compte"
              >
                Inscription
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
