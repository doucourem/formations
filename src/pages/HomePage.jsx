import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import AdBanner from '../components/AdBanner';
import Testimonials from '../components/Testimonials';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import LearningProgress from '../components/LearningProgress';

import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AdvancedSearchBar from '../components/AdvancedSearchBar';


const featuredCourses = [
  {
    id: 1,
    title: "Créer sa marque personnelle",
    description: "Apprenez à définir votre positionnement et construire une image authentique.",
    image: "https://images.unsplash.com/photo-1612831661442-7d4b3e38b1e7?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 2,
    title: "Identité visuelle & logo",
    description: "Créez une identité visuelle forte et un logo qui parle à votre audience.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 3,
    title: "Booster sa visibilité sur Instagram",
    description: "Stratégies de contenu, visuels, hashtags et stories impactantes.",
    image: "https://images.unsplash.com/photo-1611262588024-d12430b9897f?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 4,
    title: "Pitch & storytelling",
    description: "Apprenez à raconter votre histoire pour convaincre partenaires et clients.",
    image: "https://images.unsplash.com/photo-1628581561946-350aafafab0b?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 5,
    title: "Lancer sa marque en ligne",
    description: "Les étapes pour créer et vendre un produit ou service sous votre nom.",
    image: "https://images.unsplash.com/photo-1631815537448-e6fc4c730541?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 6,
    title: "Construire son site vitrine",
    description: "Utilisez WordPress ou Webflow pour présenter votre activité.",
    image: "https://images.unsplash.com/photo-1559027615-cd4d4c43f3b3?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 7,
    title: "Créer son média personnel",
    description: "Podcast, newsletter, chaîne YouTube : par quoi commencer ?",
    image: "https://images.unsplash.com/photo-1603190287605-9b7b6b58ab2b?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 8,
    title: "SEO & stratégie de contenu",
    description: "Attirez des visiteurs naturellement grâce à Google.",
    image: "https://images.unsplash.com/photo-1620222151621-26df15cfa01a?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 9,
    title: "Construire une communauté engagée",
    description: "Fidélisez votre audience grâce aux réseaux et aux emails.",
    image: "https://images.unsplash.com/photo-1607082350927-7b85f945d6c8?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 10,
    title: "Monétiser sa marque",
    description: "Formations, coaching, produits digitaux : générez des revenus.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 11,
    title: "Utiliser LinkedIn pour se positionner",
    description: "Optimisez votre profil, publiez efficacement et développez votre réseau.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 12,
    title: "Gérer son image & sa réputation en ligne",
    description: "Maîtrisez votre empreinte numérique et réagissez aux avis négatifs.",
    image: "https://images.unsplash.com/photo-1603481544475-447d2d014f57?auto=format&fit=crop&w=800&q=60"
  },
];


const advantages = [
  {
    icon: <AccessTimeIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Accès 24/7 sur tous vos appareils',
    description: 'Apprenez à votre rythme, où que vous soyez, depuis ordinateur, tablette ou smartphone.',
  },
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Formateurs experts reconnus',
    description: 'Bénéficiez des conseils de professionnels expérimentés dans leur domaine.',
  },
  {
    icon: <VerifiedUserIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Certification officielle à la fin',
    description: 'Valorisez vos compétences avec un certificat reconnu par les employeurs.',
  },
  {
    icon: <SupportAgentIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Support personnalisé & communauté',
    description: 'Posez vos questions, échangez avec formateurs et autres apprenants.',
  },
];
const HomePage = () => {
  return (
    <Box>
      {/* Hero Section */}
    
<AdvancedSearchBar onSearch={(filters) => console.log('Recherche avec :', filters)} />

      
<AdBanner />
      {/* Cours en vedette */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          📚 Nos cours populaires
        </Typography>
        <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 4
  }}
>
  {featuredCourses.map((course) => (
    <Card key={course.id}>
      <CardMedia
        component="img"
        height="140"
        image={course.image}
        alt={course.title}
      />
      <CardContent>
        <Typography variant="h6">{course.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {course.description}
        </Typography>
      </CardContent>
    </Card>
  ))}
</Box>
      </Container>


      {/* Avantages */}
           <Box sx={{ backgroundColor: '#e3f2fd', py: 8 }}>
        <Container>
          <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
            🌟 Avantages & Valeurs ajoutées
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {advantages.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    px: 3,
                    py: 4,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    boxShadow: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {item.icon}
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

<Testimonials />
<FeaturesSection />
<HowItWorks />
<FeaturesSection />
<LearningProgress value={72} title="Formation Django API" />
      {/* Call to Action */}
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Prêt à commencer ?
        </Typography>
        <Button variant="contained" color="secondary" size="large">
          Créer un compte gratuitement
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
