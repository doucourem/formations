// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import supabase from '../utils/supabaseClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });

    if (error) {
      setMsg(error.message);
      setError(true);
    } else {
      setMsg("Un lien de réinitialisation a été envoyé à ton adresse e-mail.");
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" mt={6}>
      <Typography variant="h5">Mot de passe oublié</Typography>
      <form onSubmit={handleReset}>
        <TextField
          label="Adresse e-mail"
          type="email"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Réinitialiser le mot de passe
        </Button>
      </form>
      {msg && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2 }}>
          {msg}
        </Alert>
      )}
    </Box>
  );
};

export default ForgotPassword;
