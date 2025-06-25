
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  Button,
  Chip,
  Alert,
  Container
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const DashboardUser = () => {
  const [ongoingCourses, setOngoingCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setOngoingCourses([
      { id: 1, title: 'Formation React', progress: 65 },
      { id: 2, title: 'Introduction à l’IA', progress: 30 },
    ]);
    setCompletedCourses([
      { id: 3, title: 'Design UX', date: '2024-11-10', certificateUrl: '/certificates/designux.pdf' },
    ]);
    setNotifications([
      { id: 1, message: 'Un nouveau module est disponible dans “Formation React”.' },
      { id: 2, message: 'N’oubliez pas de terminer “IA Introduction” pour obtenir votre certificat.' },
    ]);
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mon tableau de bord
      </Typography>

      {notifications.map((notif) => (
        <Alert key={notif.id} severity="info" sx={{ mb: 2 }}>
          {notif.message}
        </Alert>
      ))}
<Box sx={{ my: 4, p: 3, borderRadius: 2, bgcolor: '#f4f6fa' }}>
  <Typography variant="h6" gutterBottom>
    🧠 Recommandation IA personnalisée
  </Typography>
  <Typography variant="body1" sx={{ mb: 1 }}>
    D’après vos progrès, nous vous recommandons la formation suivante :
  </Typography>

  <Card sx={{ mt: 1 }}>
    <CardContent>
      <Typography variant="h6">“Perfectionnez votre React avancé”</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Approfondissez vos compétences avec les hooks personnalisés, Redux, performance et testing.
      </Typography>
      <Button variant="contained" color="primary" href="/courses/advanced-react">
        Découvrir la formation
      </Button>
    </CardContent>
  </Card>
</Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Formations en cours
      </Typography>
      <Grid container spacing={2}>
        {ongoingCourses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{course.title}</Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={course.progress} />
                  <Typography variant="caption">{course.progress}% complété</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Formations terminées & certificats
      </Typography>
      <Grid container spacing={2}>
        {completedCourses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Terminé le : {course.date}
                    </Typography>
                    <Chip label="Certificat obtenu" color="success" size="small" sx={{ mt: 1 }} />
                  </Box>
                  <Button
                    href={course.certificateUrl}
                    download
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                  >
                    PDF
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* 🏆 Badges de progression */}
<Typography variant="h6" sx={{ mt: 4 }}>
  🏅 Vos badges
</Typography>

<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
  <Chip label="🎯 Premier cours terminé" color="success" />
  <Chip label="🔥 3 jours d’apprentissage consécutifs" color="warning" />
  <Chip label="👨‍🎓 Niveau Intermédiaire" color="primary" />
</Box>
<Card sx={{ mt: 4, backgroundColor: '#f4f6fa' }}>
  <CardContent>
    <Typography variant="h6" gutterBottom>🤖 Assistant IA personnalisé</Typography>
    <Typography variant="body2">
      Besoin d’aide pour choisir votre prochaine formation ou débloquer un module ? Parlez à notre IA d’accompagnement.
    </Typography>

    <Button
      variant="contained"
      color="primary"
      sx={{ mt: 2 }}
      href="/assistant-ia"
    >
      Lancer l’assistant IA
    </Button>
  </CardContent>
</Card>

    </Container>
  );
};

export default DashboardUser;
