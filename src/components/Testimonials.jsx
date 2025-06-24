import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const testimonials = [
  {
    id: 1,
    name: "Sophie Martin",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "Grâce à cette formation, j'ai décroché un super poste en développement web !",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Lucas Dupont",
    photo: "https://randomuser.me/api/portraits/men/44.jpg",
    quote: "Les formateurs sont vraiment à l'écoute et les cours très bien expliqués.",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Amélie Laurent",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
    quote: "Le certificat officiel a vraiment boosté mon CV. Je recommande !",
    rating: 4.9,
  },
];

// Fonction pour afficher les étoiles selon la note
const renderStars = (rating) => {
  const stars = [];
  for(let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarIcon key={i} sx={{ color: '#fbc02d' }} />);
    } else if (rating >= i - 0.5) {
      stars.push(<StarHalfIcon key={i} sx={{ color: '#fbc02d' }} />);
    } else {
      stars.push(<StarBorderIcon key={i} sx={{ color: '#fbc02d' }} />);
    }
  }
  return stars;
};

const Testimonials = () => {
  return (
    <Box sx={{ backgroundColor: '#fff', py: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 6 }}>
        🗣️ Témoignages & avis de nos étudiants
      </Typography>
      <Grid container spacing={6} justifyContent="center">
        {testimonials.map(({ id, name, photo, quote, rating }) => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <Box
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Box
                component="img"
                src={photo}
                alt={name}
                sx={{ width: 80, height: 80, borderRadius: '50%', mb: 2 }}
              />
              <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                "{quote}"
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                {renderStars(rating)}
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  {rating.toFixed(1)}/5
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Testimonials;
