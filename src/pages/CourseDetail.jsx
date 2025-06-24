// pages/CourseDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesdetail } from '../data/coursesdetail';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Grid,
  Tooltip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import RatingStars from '../components/RatingStars';
import CommentsForm from '../components/CommentsForm';

const CourseDetail = () => {
  const { id } = useParams();
  // L'ID peut être string, donc on cast pour comparaison stricte
  const course = coursesdetail.find((c) => String(c.id) === id);

  if (!course) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography variant="h5" color="error" align="center">
          ❌ Cours introuvable
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Bouton Retour */}
      <Button
        component={Link}
        to="/"
        variant="text"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
        aria-label="Retour à la liste des cours"
      >
        Retour aux cours
      </Button>

      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        {/* Image principale */}
        <CardMedia
          component="img"
          height="320"
          image={course.image}
          alt={`Image du cours ${course.title}`}
          sx={{ objectFit: 'cover' }}
          loading="lazy"
        />

        <Box sx={{ p: 3 }}>
          {/* Titre */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {course.title}
          </Typography>

          {/* Note moyenne et étoiles (si note dispo) */}
          {course.rating && (
            <Stack direction="row" spacing={0.5} alignItems="center" mb={2}>
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < Math.floor(course.rating) ? 'primary' : 'disabled'}
                  fontSize="small"
                />
              ))}
              <Typography variant="body2" color="text.secondary" ml={1}>
                {course.rating.toFixed(1)} / 5
              </Typography>
            </Stack>
          )}

          {/* Description */}
          <Typography variant="body1" color="text.secondary" paragraph>
            {course.description}
          </Typography>

          {/* Tags Niveau et Durée */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Chip
              icon={<SchoolIcon />}
              label={`Niveau : ${course.niveau}`}
              color="primary"
              variant="outlined"
              aria-label={`Niveau du cours : ${course.niveau}`}
            />
            <Chip
              icon={<AccessTimeIcon />}
              label={`Durée : ${course.duree}`}
              color="secondary"
              variant="outlined"
              aria-label={`Durée estimée du cours : ${course.duree}`}
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Contenu */}
          <Typography variant="h6" gutterBottom>
            📚 Contenu du cours :
          </Typography>

          <List>
            {course.contenu.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText
                  primary={`• ${item}`}
                  primaryTypographyProps={{ component: 'span', variant: 'body1' }}
                />
              </ListItem>
            ))}
          </List>
          
        </Box>
<Box sx={{ my: 2 }}>
  <Typography variant="subtitle1" gutterBottom>Notez ce cours :</Typography>
  <RatingStars
    initialRating={course.userRating || 0}
    onRate={(val) => {
      // Ici tu peux gérer l'envoi au backend via API
      console.log('Note sélectionnée :', val);
    }}
  />
</Box>
<CommentsForm />

      </Card>

      {/* Section Cours similaires */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          🔥 Cours similaires
        </Typography>

        <Grid container spacing={3}>
          {coursesdetail
            .filter((c) => String(c.id) !== id)
            .slice(0, 3)
            .map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card
                  component={Link}
                  to={`/cours/${c.id}`}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
                  }}
                  aria-label={`Voir le détail du cours ${c.title}`}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={c.image}
                    alt={`Image du cours ${c.title}`}
                    loading="lazy"
                  />
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {c.title}
                    </Typography>
                    {c.videoUrl && (
  <Box sx={{ mb: 3, position: 'relative', pt: '56.25%' /* 16:9 ratio */ }}>
    <iframe
      src={c.videoUrl}
      title={`Vidéo d’introduction du cours ${c.title}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: 8,
      }}
    />
  </Box>
)}

                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CourseDetail;
