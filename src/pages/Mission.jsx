import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Container,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SchoolIcon from '@mui/icons-material/School';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import StarsIcon from '@mui/icons-material/Stars';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function Mission() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Titre & Mission */}
      <Typography variant="h3" gutterBottom>
        Notre mission
      </Typography>
      <Typography variant="body1" fontSize={18} mb={4}>
        Aider les professionnels à se former, se démarquer et évoluer grâce à des outils innovants.
        Notre objectif est de rendre l'apprentissage accessible, engageant et utile dans le monde réel.
      </Typography>

      {/* Chiffres Clés */}
      <Box mt={6}>
        <Typography variant="h4" gutterBottom>
          Nos chiffres clés
        </Typography>
        <Grid container spacing={4} mt={2}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <PeopleIcon fontSize="large" color="primary" />
              <Typography variant="h5">+3 200</Typography>
              <Typography>Utilisateurs inscrits</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <MenuBookIcon fontSize="large" color="secondary" />
              <Typography variant="h5">85</Typography>
              <Typography>Modules disponibles</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <AccessTimeIcon fontSize="large" sx={{ color: '#6A1B9A' }} />
              <Typography variant="h5">+120h</Typography>
              <Typography>Contenu vidéo</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <EmojiEventsIcon fontSize="large" sx={{ color: '#FFD700' }} />
              <Typography variant="h5">4.8/5</Typography>
              <Typography>Satisfaction moyenne</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Timeline */}
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          L'évolution de la plateforme
        </Typography>
        <Timeline position="alternate">
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary"><HistoryEduIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6">2022 — Lancement</Typography>
              <Typography>Idée née d’un besoin terrain : former autrement.</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="secondary"><SchoolIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6">2023 — Premiers modules</Typography>
              <Typography>Partenariats experts & premières formations publiées.</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot><GroupAddIcon /></TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6">2024 — Communauté & IA</Typography>
              <Typography>Déploiement du coaching IA et de la communauté privée.</Typography>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot sx={{ backgroundColor: '#FFD700' }}><StarsIcon /></TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6">2025 — Marketplace</Typography>
              <Typography>Modules experts, évènements, certifications, monétisation.</Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Box>

      {/* Nos valeurs */}
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          Nos valeurs
        </Typography>
        <ul style={{ fontSize: 18, paddingLeft: 20 }}>
          <li><strong>Accessibilité</strong> : Une formation pour tous, quel que soit le niveau.</li>
          <li><strong>Innovation</strong> : IA, coaching automatisé, contenu personnalisé.</li>
          <li><strong>Excellence</strong> : Des experts reconnus et des outils haut de gamme.</li>
          <li><strong>Communauté</strong> : Apprendre ensemble, progresser ensemble.</li>
        </ul>
      </Box>

      {/* Call to Action */}
      <Box textAlign="center" mt={6}>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: '#6A1B9A',
            color: 'white',
            '&:hover': { backgroundColor: '#4A148C' },
          }}
          href="/register"
        >
          🎉 Rejoindre la communauté
        </Button>
      </Box>
    </Container>
  );
}
