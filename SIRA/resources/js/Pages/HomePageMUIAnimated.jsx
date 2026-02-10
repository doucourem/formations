import React from "react";
import { Box, Typography, Button, Container, Grid, Card } from "@mui/material";
import { Truck, Wrench, Users, Star } from "lucide-react";

import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const services = [
  { icon: <Truck size={40} />, title: "Suivi des véhicules", desc: "Planification, historique et alertes pour chaque camion ou citerne." },
  { icon: <Wrench size={40} />, title: "Maintenance optimisée", desc: "Coordination avec les garagistes et suivi des interventions." },
  { icon: <Users size={40} />, title: "Garagistes partenaires", desc: "Trouvez les meilleurs garagistes pour vos besoins partout au Mali." },
];

const testimonials = [
  { name: "Amadou Coulibaly", text: "Grâce à GrosPorteur+, je peux suivre toutes mes interventions sans stress.", rating: 5 },
  { name: "Fatoumata Traoré", text: "Les garagistes recommandés sont rapides et fiables. Très satisfaite !", rating: 4 },
  { name: "Moussa Diallo", text: "Une plateforme simple et efficace pour gérer nos camions.", rating: 5 },
];

const sliderSettings = { dots: true, infinite: true, speed: 600, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000 };

const HomePageMUIAnimated = () => {
  return (
    <Box sx={{ fontFamily: 'Roboto', bgcolor: '#f5f5f5' }}>
      
      {/* Hero avec parallax */}
      <Box
        sx={{
          height: '100vh',
          backgroundImage: `url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1350&q=80')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
          px: 2
        }}
      >
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Gestion facile de vos gros porteurs
          </Typography>
        </motion.div>
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Planifiez, suivez et maintenez vos véhicules efficacement
          </Typography>
          <Button variant="contained" color="warning" size="large">
            Demander un devis
          </Button>
        </motion.div>
      </Box>

      {/* Services */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 6, fontWeight: 'bold' }}>
          Nos Services
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {services.map((service, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
              >
                <Card sx={{ p: 3, textAlign: 'center', transition: '0.3s', "&:hover": { transform: 'translateY(-10px)', boxShadow: 6 } }}>
                  <Box sx={{ mb: 2 }}>{service.icon}</Box>
                  <Typography variant="h6" gutterBottom>{service.title}</Typography>
                  <Typography>{service.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Témoignages */}
      <Box sx={{ py: 10, bgcolor: '#e3f2fd', textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 6, fontWeight: 'bold' }}>
          Témoignages clients
        </Typography>
        <Container maxWidth="md">
          <Slider {...sliderSettings}>
            {testimonials.map((t, idx) => (
              <motion.div key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card sx={{ p: 4, mx: 2 }}>
                  <Typography sx={{ mb: 2 }}>{t.text}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} color="#FFD700" />)}
                  </Box>
                  <Typography sx={{ fontWeight: 'bold' }}>{t.name}</Typography>
                </Card>
              </motion.div>
            ))}
          </Slider>
        </Container>
      </Box>

      {/* CTA final */}
      <Box sx={{ py: 12, bgcolor: '#1976d2', color: '#fff', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            Prêt à gérer vos véhicules efficacement ?
          </Typography>
          <Button variant="contained" color="warning" size="large">
            Créer un compte maintenant
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
};

export default HomePageMUIAnimated;
