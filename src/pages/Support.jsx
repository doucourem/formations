import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmailIcon from '@mui/icons-material/Email';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

export default function Support() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>
        Centre de support
      </Typography>

      <Typography variant="body1" paragraph>
        Besoin d'aide ? Voici les différentes manières de nous contacter ou de résoudre votre problème.
      </Typography>

      <Box mt={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <HelpOutlineIcon color="primary" />
          <Box>
            <Typography variant="h6">Consulter la base de connaissances</Typography>
            <Typography variant="body2">
              Trouvez des réponses aux questions les plus fréquentes concernant nos formations, votre compte et l'utilisation de la plateforme.
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }} href="/faq">
              Accéder à la FAQ
            </Button>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <EmailIcon color="primary" />
          <Box>
            <Typography variant="h6">Contacter le support par e-mail</Typography>
            <Typography variant="body2">
              Notre équipe vous répond sous 24h ouvrées. Précisez bien votre problème et votre identifiant.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 1 }}
              href="mailto:support@formationplus.com"
            >
              Envoyer un e-mail
            </Button>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <LiveHelpIcon color="primary" />
          <Box>
            <Typography variant="h6">Chat en direct (bientôt disponible)</Typography>
            <Typography variant="body2">
              Notre assistant virtuel IA sera bientôt en ligne pour vous guider instantanément.
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }} disabled>
              Ouvrir le chat
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
