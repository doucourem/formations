import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Politique de confidentialité
      </Typography>

      <Typography paragraph>
        Nous nous engageons à protéger la vie privée de nos utilisateurs. Cette politique explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">1. Données collectées</Typography>
        <Typography paragraph>
          Lorsque vous vous inscrivez à nos formations, nous collectons :
        </Typography>
        <ul>
          <li>Votre nom et prénom</li>
          <li>Votre adresse email</li>
          <li>Vos préférences de formation</li>
          <li>Vos données de navigation (cookies, logs...)</li>
        </ul>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">2. Utilisation des données</Typography>
        <Typography paragraph>
          Ces données sont utilisées pour :
        </Typography>
        <ul>
          <li>Vous permettre d’accéder à votre espace personnel</li>
          <li>Adapter nos formations à vos besoins</li>
          <li>Vous envoyer des notifications ou newsletters (avec votre consentement)</li>
          <li>Améliorer notre plateforme</li>
        </ul>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">3. Partage des données</Typography>
        <Typography paragraph>
          Nous ne partageons vos données avec aucun tiers, sauf dans les cas suivants :
        </Typography>
        <ul>
          <li>Fournisseurs de service d’hébergement et d’emailing</li>
          <li>Obligations légales ou judiciaires</li>
        </ul>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">4. Vos droits</Typography>
        <Typography paragraph>
          Vous disposez à tout moment d’un droit :
        </Typography>
        <ul>
          <li>D’accès à vos données</li>
          <li>De modification ou suppression</li>
          <li>De retrait du consentement</li>
        </ul>
        <Typography paragraph>
          Pour exercer vos droits, contactez-nous à <strong>contact@formationplus.com</strong>.
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">5. Sécurité</Typography>
        <Typography paragraph>
          Vos données sont stockées sur des serveurs sécurisés et nous mettons en œuvre toutes les mesures nécessaires pour éviter leur perte, vol ou divulgation non autorisée.
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">6. Cookies</Typography>
        <Typography paragraph>
          Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez les désactiver via les paramètres de votre navigateur.
        </Typography>
      </Box>

      <Typography sx={{ mt: 5 }} variant="body2" color="text.secondary">
        Dernière mise à jour : {new Date().toLocaleDateString()}
      </Typography>
    </Container>
  );
}
