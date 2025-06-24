import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const features = [
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
    title: "Système de progression & badges",
    description: "Gagnez des récompenses en terminant les cours et en atteignant des objectifs.",
  },
  {
    icon: <QuizIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
    title: "Quiz & exercices pratiques",
    description: "Testez vos connaissances à chaque étape avec des quiz interactifs.",
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
    title: "Suivi personnalisé",
    description: "Bénéficiez de recommandations via IA ou d’un coach dédié selon vos besoins.",
  },
];

const FeaturesSection = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f0f4f8' }}>
      <Typography variant="h4" align="center" gutterBottom>
        🎯 Fonctionnalités clés & Gamification
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 3, p: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                {feature.icon}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturesSection;
