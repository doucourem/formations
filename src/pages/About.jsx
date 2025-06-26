import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';

export default function About() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', my: 8, px: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        Qui sommes-nous ?
      </Typography>

      <Typography variant="body1" mb={4} textAlign="center" color="text.secondary">
        FormationPlus est une plateforme innovante dédiée à la formation professionnelle,
        spécialisée dans la construction et le développement de votre marque personnelle.
        Nous aidons les professionnels à se démarquer, à évoluer et à réussir grâce à des
        formations de qualité, accessibles et adaptées à leurs ambitions.
      </Typography>

      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Notre Mission</Typography>
            <Typography variant="body2" color="text.secondary">
              Vous accompagner dans la construction d’une marque authentique et impactante,
              pour révéler votre potentiel unique sur le marché.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Nos Valeurs</Typography>
            <Typography variant="body2" color="text.secondary">
              Excellence, accessibilité, innovation et bienveillance guident toutes nos actions
              pour vous offrir la meilleure expérience d’apprentissage.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Notre Vision</Typography>
            <Typography variant="body2" color="text.secondary">
              Devenir la référence francophone incontournable pour la formation en personal branding,
              en connectant talents, experts et opportunités.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box textAlign="center">
        <Button
          variant="contained"
          size="large"
          color="primary"
          href="/register"
          aria-label="Rejoindre la communauté FormationPlus"
        >
          Rejoindre la communauté
        </Button>
      </Box>
    </Box>
  );
}
