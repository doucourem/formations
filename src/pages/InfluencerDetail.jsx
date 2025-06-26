import React, { useState } from "react";
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

export default function InfluencerProfileUltraComplete() {
  const [following, setFollowing] = useState(false);
  const inf = {
    name: "Alice Dupont",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "« Ma passion est de vous aider à révéler votre style unique ! »",
    badges: ["Formateur officiel", "Expert beauté", "Top créateur 2024"],
    niche: "Beauté & Maquillage",
    followers: 120000,
    bio: `Passionnée de beauté et maquillage depuis 10 ans, j'ai formé plus de 10 000 élèves et collaboré avec des
          marques internationales pour créer des looks iconiques.`,
    instagramUrl: "https://instagram.com/alice.beaute",
    youtubeUrl: "https://youtube.com/alicedupont",
    email: "alice@example.com",
    rating: 4.7,
    recentPosts: [
      { title: "Tuto maquillage naturel", url: "#" },
      { title: "Routine soin visage", url: "#" },
      { title: "Mes outils préférés", url: "#" },
    ],
    gallery: [
      "https://source.unsplash.com/400x300/?makeup",
      "https://source.unsplash.com/400x300/?beauty",
      "https://source.unsplash.com/400x300/?cosmetics",
    ],
    strengths: [
      "10+ ans d'expérience",
      "10 000 élèves formés",
      "Taux de satisfaction 98 %",
      "Collaborations prestige",
    ],
    timeline: [
      { year: 2014, event: "Début en freelance maquillage" },
      { year: 2017, event: "Lancement de la chaîne YouTube" },
      { year: 2020, event: "Certification Formateur officiel" },
      { year: 2023, event: "Top créateur beauté 2023" },
    ],
    courses: [
      { title: "Maquillage débutant", desc: "Les bases pour tous niveaux" },
      { title: "Smokey Eye avancé", desc: "Technique pas à pas" },
      { title: "Soin anti-âge", desc: "Routines et astuces pro" },
    ],
  };

  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
        <Avatar src={inf.image} alt={inf.name} sx={{ width: 120, height: 120, mx: "auto" }} />
        <Typography variant="h4" mt={2}>{inf.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          <i>{inf.quote}</i>
        </Typography>
        {/* Badges */}
        <Box mt={1}>
          {inf.badges.map((b, i) => (
            <Chip key={i} label={b} color="secondary" sx={{ mx: 0.5 }} />
          ))}
        </Box>
        {/* Follow */}
        <Button
          variant={following ? "outlined" : "contained"}
          color="primary"
          onClick={() => setFollowing(f => !f)}
          sx={{ mt: 2 }}
        >
          {following ? "Se désabonner" : "Suivre"}
        </Button>
        {/* Social Icons */}
        <Box mt={2}>
          <IconButton href={inf.instagramUrl}><InstagramIcon /></IconButton>
          <IconButton href={inf.youtubeUrl}><YouTubeIcon /></IconButton>
          <IconButton href={`mailto:${inf.email}`}><CalendarIcon /></IconButton>
        </Box>
        {/* Rating & Stats */}
        <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Rating value={inf.rating} precision={0.1} readOnly />
          <PeopleIcon /> <Typography>{inf.followers.toLocaleString()}</Typography>
        </Box>
      </Paper>

      {/* Bio & Points forts */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>À propos de moi</Typography>
        <Typography paragraph>{inf.bio}</Typography>
        <Typography variant="h6">Points forts</Typography>
        <ul>
          {inf.strengths.map((s,i) => <li key={i}>{s}</li>)}
        </ul>
      </Box>

      {/* Galerie */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Galerie</Typography>
        <Grid container spacing={2}>
          {inf.gallery.map((src,i) => (
            <Grid item xs={4} key={i}>
              <Card>
                <CardMedia component="img" height="120" image={src} alt={`img-${i}`} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Timeline */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Parcours</Typography>
        {inf.timeline.map((t,i) => (
          <Box key={i} display="flex" alignItems="center" mb={1}>
            <TimeIcon color="secondary" sx={{ mr:1 }} />
            <Typography><strong>{t.year}</strong> — {t.event}</Typography>
          </Box>
        ))}
      </Box>

      {/* Cours dispensés */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Cours dispensés</Typography>
        <Grid container spacing={2}>
          {inf.courses.map((c,i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p:2 }}>
                <Typography variant="subtitle1">{c.title}</Typography>
                <Typography variant="body2" color="text.secondary">{c.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Publications récentes */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Publications récentes</Typography>
        <Grid container spacing={2}>
          {inf.recentPosts.map((p,i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p:1 }}>
                <Link href={p.url}><Typography>{p.title}</Typography></Link>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Lead magnet */}
      <Box mt={4} textAlign="center">
        <Button variant="outlined" startIcon={<BookIcon />} href="/ebook.pdf">
          Télécharger mon e-book gratuit
        </Button>
      </Box>

      {/* CTA */}
      <Box mt={4} textAlign="center">
        <Button variant="contained" size="large" startIcon={<StarIcon />}>
          Demander un devis
        </Button>
      </Box>
    </Container>
  );
}
