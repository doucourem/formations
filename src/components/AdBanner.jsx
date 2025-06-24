import React from 'react';
import { Box, Typography, Button, Grid, CardMedia } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const ads = [
  {
    title: '🔥 Offre Spéciale - Formation React',
    description: 'Maîtrisez React et construisez des interfaces modernes.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
    url: 'https://ton-site-pub.com/react',
  },
  {
    title: '🎯 Devenez Expert Django + API',
    description: 'Créez des backends puissants avec Django REST.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
    url: 'https://ton-site-pub.com/django',
  },
  {
    title: '🚀 Lancer votre Startup en ligne',
    description: 'Tout ce qu’il faut pour réussir en ligne dès aujourd’hui.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
    url: 'https://ton-site-pub.com/startup',
  }
];

const AdBanner = () => {
  return (
    <Box
      sx={{
        my: 6,
        px: 2,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
      >
        {ads.map((ad, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                p: 3,
                backgroundColor: '#fff3e0',
                borderRadius: 2,
                boxShadow: 3,
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': { backgroundColor: '#ffe0b2' }
              }}
              onClick={() => window.open(ad.url, '_blank')}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Image */}
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={ad.image}
                    alt={ad.title}
                    sx={{
                      borderRadius: 2,
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Grid>

                {/* Texte + bouton */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {ad.title}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {ad.description}
                  </Typography>
                  <Button variant="contained" color="primary">
                    En savoir plus
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default AdBanner;
