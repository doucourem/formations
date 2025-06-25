import React from 'react';
import {
  Avatar,
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';

// Exemple de données si props.user n'est pas fourni
const fallbackUser = {
  username: 'Mariam Diarra',
  email: 'mariam@example.com',
  photo: '/images/mariam.jpg',
  bio: "Développeuse web passionnée par l'IA et la formation.",
  experiences: [
    "Formatrice React.js chez NextAcademy",
    "Développeuse Fullstack freelance",
  ],
  skills: ['React', 'Django', 'UX Design', 'OpenAI'],
};

const UserProfile = ({ user = fallbackUser }) => {
 // if (!user) return <Typography>Chargement du profil...</Typography>;

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <CardContent>
        {/* 🖼️ En-tête avec photo et infos */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user.photo}
            alt={user.username}
            sx={{ width: 80, height: 80 }}
          />
          <Box>
            <Typography variant="h5">{user.username}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 📝 Bio */}
        <Typography variant="h6" gutterBottom>📝 Bio</Typography>
        <Typography sx={{ mb: 2 }}>
          {user.bio || 'Aucune biographie fournie.'}
        </Typography>

        {/* 💼 Expériences */}
        <Typography variant="h6" gutterBottom>💼 Expériences</Typography>
        {user.experiences && user.experiences.length > 0 ? (
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            {user.experiences.map((exp, idx) => (
              <li key={idx}>
                <Typography>{exp}</Typography>
              </li>
            ))}
          </Box>
        ) : (
          <Typography>Aucune expérience renseignée.</Typography>
        )}

        {/* 🧠 Compétences */}
        <Typography variant="h6" gutterBottom>🧠 Compétences</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {user.skills && user.skills.length > 0 ? (
            user.skills.map((skill, idx) => (
              <Chip key={idx} label={skill} color="primary" />
            ))
          ) : (
            <Typography>Aucune compétence renseignée.</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
