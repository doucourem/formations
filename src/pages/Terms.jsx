import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>
        Conditions d'utilisation
      </Typography>

      <Typography variant="body1" paragraph>
        Veuillez lire attentivement ces conditions générales avant d'utiliser notre plateforme de formation en ligne.
      </Typography>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          1. Acceptation des conditions
        </Typography>
        <Typography paragraph>
          En accédant à ce site, vous acceptez d’être lié par les présentes conditions d'utilisation. Si vous êtes en désaccord avec une quelconque partie, vous ne devez pas utiliser nos services.
        </Typography>

        <Typography variant="h5" gutterBottom>
          2. Utilisation des contenus
        </Typography>
        <Typography paragraph>
          Tous les contenus (cours, vidéos, documents, quiz) sont protégés par des droits d’auteur. Vous n’êtes pas autorisé à les copier, redistribuer ou vendre sans notre autorisation écrite.
        </Typography>

        <Typography variant="h5" gutterBottom>
          3. Comptes utilisateurs
        </Typography>
        <Typography paragraph>
          Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion et de toutes les activités réalisées sous votre compte.
        </Typography>

        <Typography variant="h5" gutterBottom>
          4. Paiement et accès
        </Typography>
        <Typography paragraph>
          Certains contenus sont accessibles uniquement après paiement. Aucun remboursement ne sera effectué après accès complet à une formation.
        </Typography>

        <Typography variant="h5" gutterBottom>
          5. Résiliation
        </Typography>
        <Typography paragraph>
          Nous nous réservons le droit de suspendre ou de supprimer un compte utilisateur en cas de non-respect des présentes conditions.
        </Typography>

        <Typography variant="h5" gutterBottom>
          6. Modifications
        </Typography>
        <Typography paragraph>
          Nous pouvons modifier ces conditions à tout moment. Les utilisateurs seront informés via le site ou par e-mail.
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="body2" color="text.secondary">
          Dernière mise à jour : {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
}
