import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  IconButton,
  Grid,
  Chip,
  Rating,
  Link,
  Card,
  CardMedia,
  CardContent,
  Container
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { supabase } from "../utils/supabaseClient";
import { useParams} from 'react-router-dom';

export default function InfluencerProfileUltraComplete() {
  const [inf, setInf] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchInfluencer = async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select("*")
        .eq("id", id) // <-- Remplace par l'ID souhaité
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
      } else {
        setInf(data);
      }
    };

    fetchInfluencer();
  }, []);

  // 🛡️ Bloc de sécurité : attendre que les données soient chargées
  if (!inf) {
    return (
      <Container maxWidth="md" sx={{ my: 6, textAlign: "center" }}>
        <Typography variant="h6">Chargement du profil...</Typography>
      </Container>
    );
  }

  // ✅ Support JSON Supabase (normalement déjà des objets, mais au cas où)
  const parseJsonField = (field) => {
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const badges = parseJsonField(inf.badges);
  const recentPosts = parseJsonField(inf.recent_posts);
  const gallery = parseJsonField(inf.gallery);
  const strengths = parseJsonField(inf.strengths);
  const timeline = parseJsonField(inf.timeline);
  const courses = parseJsonField(inf.courses);

  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
        <Avatar src={inf.image} alt={inf.name} sx={{ width: 120, height: 120, mx: "auto" }} />
        <Typography variant="h4" mt={2}>{inf.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          <i>{inf.quote}</i>
        </Typography>

        <Box mt={1}>
          {badges.map((b, i) => (
            <Chip key={i} label={b} color="secondary" sx={{ mx: 0.5 }} />
          ))}
        </Box>

        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Suivre
        </Button>

        <Box mt={2}>
          <IconButton href={inf.instagram_url}><InstagramIcon /></IconButton>
          <IconButton href={inf.youtube_url}><YouTubeIcon /></IconButton>
          <IconButton href={`mailto:${inf.email}`}><CalendarIcon /></IconButton>
        </Box>

        <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Rating value={inf.rating} precision={0.1} readOnly />
          <PeopleIcon /> <Typography>{inf.followers?.toLocaleString()}</Typography>
        </Box>
      </Paper>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>À propos de moi</Typography>
        <Typography paragraph>{inf.bio}</Typography>
        <Typography variant="h6">Points forts</Typography>
        <ul>
          {strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Galerie</Typography>
        <Grid container spacing={2}>
          {gallery.map((src, i) => (
            <Grid item xs={4} key={i}>
              <Card>
                <CardMedia component="img" height="120" image={src} alt={`img-${i}`} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Parcours</Typography>
        {timeline.map((t, i) => (
          <Box key={i} display="flex" alignItems="center" mb={1}>
            <TimeIcon color="secondary" sx={{ mr: 1 }} />
            <Typography><strong>{t.year}</strong> — {t.event}</Typography>
          </Box>
        ))}
      </Box>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Cours dispensés</Typography>
        <Grid container spacing={2}>
          {courses.map((c, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">{c.title}</Typography>
                <Typography variant="body2" color="text.secondary">{c.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Publications récentes</Typography>
        <Grid container spacing={2}>
          {recentPosts.map((p, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p: 1 }}>
                <Link href={p.url}><Typography>{p.title}</Typography></Link>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box mt={4} textAlign="center">
        <Button variant="outlined" startIcon={<BookIcon />} href="/ebook.pdf">
          Télécharger mon e-book gratuit
        </Button>
      </Box>

      <Box mt={4} textAlign="center">
        <Button variant="contained" size="large" startIcon={<StarIcon />}>
          Demander un devis
        </Button>
      </Box>
    </Container>
  );
}
