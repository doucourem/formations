import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEmail = (email) => {
    // Simple regex pour validation email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (!validateEmail(email)) {
      setError("L'adresse email n'est pas valide.");
      return;
    }
    setError('');
    // Ici tu peux ajouter la logique d'envoi (API, email, etc.)
    setSuccess(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        my: 6,
        p: 3,
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
      }}
      component="section"
      aria-labelledby="contact-heading"
    >
      <Typography id="contact-heading" variant="h4" component="h1" gutterBottom>
        Contactez-nous
      </Typography>

      <Typography mb={3}>
        Pour toute question, veuillez remplir le formulaire ci-dessous ou envoyez-nous un mail à{' '}
        <a href="mailto:contact@formationplus.com">contact@formationplus.com</a>.
      </Typography>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <TextField
          label="Nom complet"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          required
          aria-required="true"
        />
        <TextField
          label="Adresse email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
        />
        <TextField
          label="Message"
          name="message"
          fullWidth
          margin="normal"
          multiline
          minRows={4}
          value={formData.message}
          onChange={handleChange}
          required
          aria-required="true"
        />

        {error && (
          <Typography color="error" variant="body2" mt={1}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          aria-label="Envoyer le message"
        >
          Envoyer
        </Button>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ width: '100%' }}>
          Message envoyé avec succès !
        </Alert>
      </Snackbar>
    </Box>
  );
}
