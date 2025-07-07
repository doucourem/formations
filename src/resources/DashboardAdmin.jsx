import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

export default function DashboardAdmin() {
  const [counts, setCounts] = useState({ influencers: 0, courses: 0, projects: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [{ count: inf }, { count: cou }, { count: pro }] = await Promise.all([
        supabase.from('influencers').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
      ]);
      setCounts({ influencers: inf, courses: cou, projects: pro });
    };
    fetchCounts();
  }, []);

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Influenceurs</Typography>
            <Typography variant="h4">{counts.influencers}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Cours</Typography>
            <Typography variant="h4">{counts.courses}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Projets IA</Typography>
            <Typography variant="h4">{counts.projects}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
