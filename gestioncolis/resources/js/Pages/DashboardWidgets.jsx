import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function DashboardWidgets() {
  const [data, setData] = useState({});

  useEffect(() => {
    axios.get('/api/dashboard/widgets')
         .then(res => setData(res.data));
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography>🚗 Chauffeurs actifs</Typography>
            <Typography variant="h5">{data.activeDrivers}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography>❌ Chauffeurs inactifs</Typography>
            <Typography variant="h5">{data.inactiveDrivers}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography>📄 Documents expirant</Typography>
            <Typography variant="h5">{data.expiringDocs}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card>
          <CardContent>
            <Typography>🕒 Trajets du jour</Typography>
            <Typography variant="h5">{data.todayTrips}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
