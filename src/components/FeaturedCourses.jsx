import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const courses = [
  {
    id: 1,
    title: 'Construire sa marque personnelle',
    duration: '4h',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Développez une image de marque cohérente et impactante pour mieux vous positionner.',
  },
  {
    id: 2,
    title: 'Storytelling & Influence',
    duration: '2h30',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Apprenez à raconter votre histoire pour capter l’attention et inspirer confiance.',
  },
  {
    id: 3,
    title: 'Maîtriser LinkedIn pour sa visibilité',
    duration: '3h',
   image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Optimisez votre profil LinkedIn et développez un réseau stratégique.',
  },
  {
    id: 4,
    title: 'Stratégie de contenu sur Instagram',
    duration: '2h',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Créez un feed cohérent et attirez les bonnes audiences avec vos publications.',
  },
  {
    id: 5,
    title: 'Pitch & prise de parole',
    duration: '1h30',
   image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Améliorez votre aisance orale pour convaincre en toutes circonstances.',
  },
  {
    id: 6,
    title: 'Monétisation de son image',
    duration: '2h15',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Découvrez les leviers pour générer des revenus via votre personal branding.',
  },
  {
    id: 7,
    title: 'Créer une communauté engagée',
    duration: '2h45',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Fidélisez votre audience et stimulez l’interaction autour de vos contenus.',
  },
  {
    id: 8,
    title: 'Influence éthique & crédible',
    duration: '1h45',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Gérez votre image avec professionnalisme et respect de votre audience.',
  },
  {
    id: 9,
    title: 'Utiliser l’IA pour booster sa marque',
    duration: '2h',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Exploitez ChatGPT et d’autres IA pour améliorer votre communication et stratégie.',
  },
  {
    id: 10,
    title: 'Plan d’action pour lancer sa marque',
    duration: '3h',
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=60",
    description: 'Structurez le lancement de votre projet personnel ou professionnel de A à Z.',
  },
];

const FeaturedCourses = () => {
  return (
    <Box sx={{ py: 6, px: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        🎯 Formations en vedette
      </Typography>

  <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image={course.image}
                alt={course.title}
              />
              <CardContent>
                <Typography variant="h6">{course.title}</Typography>

                <Typography variant="body2" sx={{ mt: 1, mb: 1 }} color="text.secondary">
                  {course.description}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={course.duration}
                    size="small"
                    color="default"
                  />
                  {course.level && (
                    <Chip label={course.level} size="small" color="secondary" />
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  aria-label={`Commencer ${course.title}`}
                >
                  Commencer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedCourses;
