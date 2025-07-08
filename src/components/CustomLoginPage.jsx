import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
} from '@mui/material';
import { useLogin, useNotify, useRedirect } from 'react-admin';
import bgImage from '../assets/bg-login.jpg'; // image de fond
import logo from '../assets/logo.png'; // logo personnalisé

const CustomLoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const redirect = useRedirect();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      redirect('/');
    } catch {
      notify('Identifiants incorrects', { type: 'error' });
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Card sx={{ width: 360, padding: 4, backdropFilter: 'blur(10px)', boxShadow: 8 }}>
        <CardContent>
          <Box textAlign="center" mb={2}>
            <img src={logo} alt="Logo" style={{ height: 60 }} />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            Connexion
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="username"
              type="email"
              value={credentials.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <Box mt={2}>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Se connecter
              </Button>
            </Box>
          </form>

          <Box mt={2} display="flex" justifyContent="space-between">
            <Link href="/forgot-password" variant="body2">
              Mot de passe oublié ?
            </Link>
            <Link href="/register" variant="body2">
              Créer un compte
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomLoginPage;
