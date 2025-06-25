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
  const [user, setUser] = useState(null); // null = pas connecté, sinon objet utilisateur simple
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLoginLogout = () => {
    if (user) {
      // logout
      setUser(null);
      navigate('/');
    } else {
      // login (ici simulation)
      setUser({ name: 'Mariam Diarra' });
      navigate('/dashboard');
    }
  };

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ width: 250 }}>
      <Typography variant="h6" sx={{ m: 2, color: theme.palette.primary.main }}>
        Menu
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem button component={Link} to={item.path} key={item.label}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ m: 2 }}>
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
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="secondary"
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
                sx={{ ml: 2 }}
              >
                {user ? 'Logout' : 'Login'}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

        </Box>
  );
};

export default MainLayout;
