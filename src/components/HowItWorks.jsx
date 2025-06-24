import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const steps = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
    title: "1. Choisissez un cours",
    description: "Parcourez notre catalogue et trouvez la formation idéale pour vous.",
  },
  {
    icon: <PlayCircleOutlineIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
    title: "2. Apprenez à votre rythme",
    description: "Suivez les leçons vidéo, les quiz et les exercices où que vous soyez.",
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
    title: "3. Obtenez votre certificat",
    description: "Terminez le cours et recevez une certification reconnue.",
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        🔍 Comment ça marche ?
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        {steps.map((step, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 3, p: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                {step.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HowItWorks;
