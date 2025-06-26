import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Accueil', path: '/' },
  { label: 'Formations', path: '/dashboard' },
  { label: 'Agenda', path: '/agenda' },
  { label: 'Influenceurs', path: '/influencers' },
  { label: 'Profil', path: '/profil' },
];

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null); // simulate login
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLoginLogout = () => {
    if (user) {
      setUser(null);
      navigate('/');
    } else {
      setUser({ name: 'Mariam Diarra' });
      navigate('/dashboard');
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }} onClick={toggleDrawer}>
      <Typography variant="h6" sx={{ m: 2, color: theme.palette.primary.main }}>
        Menu
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.label}
            component={Link}
            to={item.path}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            handleLoginLogout();
          }}
        >
          {user ? 'Logout' : 'Login'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '0vh' }}>
      {/* AppBar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            Ma Marque
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  component={Link}
                  to={item.path}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLoginLogout}
              >
                {user ? 'Logout' : 'Login'}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>

      {/* Contenu principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
