// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
 import { supabase } from '../utils/supabaseClient';
const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      setError(true);
    } else {
      setMsg('Compte créé ! Vérifie ton e-mail pour valider ton compte.');
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" mt={6}>
      <Typography variant="h5" gutterBottom>Créer un compte</Typography>

      <form onSubmit={handleRegister}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Mot de passe"
          type="password"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button variant="contained" type="submit" color="primary" fullWidth sx={{ mt: 2 }}>
          S’inscrire
        </Button>
      </form>

      {msg && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 3 }}>
          {msg}
        </Alert>
      )}
    </Box>
  );
};

export default RegisterForm;
