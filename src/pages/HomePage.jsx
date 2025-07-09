import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ Import requis
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
import FeaturedCourses from '../components/FeaturedCourses';
import { supabase } from "../utils/supabaseClient"; // ✅ Import supabase






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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Erreur de récupération des cours :', error.message);
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
    
<AdvancedSearchBar onSearch={(filters) => console.log('Recherche avec :', filters)} />
<Box sx={{ py: 8, textAlign: 'center', backgroundColor: 'primary.main', color: '#fff' }}>
  <Typography variant="h2" gutterBottom>
    Révèle ta marque personnelle
  </Typography>
  <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto' }}>
    Formations, outils IA, et accompagnement pour construire une marque qui inspire et vend.
  </Typography>
  <Button variant="contained" color="secondary" sx={{ mt: 4 }}>
    Découvrir les formations
  </Button>
</Box>

      
<AdBanner />
<FeaturedCourses />
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
{courses.map((course) => (
  <Link
  to={`/cours/${course.id}`}
  style={{ textDecoration: 'none' }}
  key={course.id}
>
  <Card
    sx={{
      color: 'inherit',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
    }}
  >
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
</Link>

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
