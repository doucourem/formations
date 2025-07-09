import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { supabase } from "../utils/supabaseClient"; // Assure-toi que le chemin est bon

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error) {
        console.error(error);
      } else {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  return (
    <Box sx={{ py: 6, px: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        🎯 Formations en vedette
      </Typography>

      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id || course.title}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image={course.image}
                alt={course.title}
              />
              <CardContent>
                <Typography variant="h6">{course.title}</Typography>

                <Typography variant="body2" sx={{ mt: 1, mb: 1 }} color="text.secondary">
                  {course.description}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={course.duree || course.duration || 'Durée non précisée'}
                    size="small"
                    color="default"
                  />
                  {(course.niveau || course.level) && (
                    <Chip label={course.niveau || course.level} size="small" color="secondary" />
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ mt: 'auto', px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  aria-label={`Commencer ${course.title}`}
                >
                  Commencer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedCourses;
