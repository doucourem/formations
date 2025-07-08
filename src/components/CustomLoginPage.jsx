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
import { useNotify, useRedirect } from 'react-admin';
import { supabase } from '../utils/supabaseClient'; // 👈 ton client supabase
import bgImage from '../assets/bg-login.jpg';
import logo from '../assets/logo.png';
import { useEffect } from 'react';



const CustomLoginPage = () => {

  useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      redirect('/admin'); // 👈 Redirection si connecté
    }
  };
  checkSession();
}, []);
  const notify = useNotify();
  const redirect = useRedirect();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      notify("Erreur d'authentification : " + error.message, { type: 'error' });
    } else {
      redirect('/admin'); // 👈 redirection vers le dashboard
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
              name="email"
              type="email"
              value={credentials.email}
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
