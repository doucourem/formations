import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
} from "@mui/material";

const staticInfluencers = [
  {
    id: 1,
    name: "Alice Dupont",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    niche: "Beauté",
    followers: 120000,
    bio: "Passionnée de beauté et maquillage, je partage mes astuces et tutos.",
  },
  {
    id: 2,
    name: "Bob Martin",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    niche: "Tech",
    followers: 45000,
    bio: "Geek invétéré, je teste et analyse les dernières innovations tech.",
  },
  // Ajoute d'autres profils ici
];

export default function InfluencerDetail() {
  const { id } = useParams();
  const [influencer, setInfluencer] = useState(null);

  useEffect(() => {
    // Simulation chargement API avec délai
    const found = staticInfluencers.find((inf) => inf.id === Number(id));
    setTimeout(() => {
      setInfluencer(found || null);
    }, 500);
  }, [id]);

  if (!influencer)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 6,
        p: 3,
        textAlign: "center",
      }}
    >
      <Avatar
        src={influencer.image}
        alt={influencer.name}
        sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
      />
      <Typography variant="h5" gutterBottom>
        {influencer.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        <strong>Niche :</strong> {influencer.niche}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        <strong>Followers :</strong> {influencer.followers.toLocaleString()}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {influencer.bio}
      </Typography>
    </Paper>
  );
}
