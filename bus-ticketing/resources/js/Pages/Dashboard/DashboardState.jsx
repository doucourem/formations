import React, { useEffect, useState } from "react";
import axios from "axios";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Package, Users, MapPin, TrendingUp } from "lucide-react";
import SalesChart from "@/Components/SalesChart";
import ParcelRoutesChart from "@/Components/ParcelRoutesChart";

const STATE_TAX = 500; // taxe État par billet

export default function DashboardState() {
  const [data, setData] = useState({
    trips: [],
    tickets: [],
    top_drivers: [],
    top_routes: [],
    parcel_routes: [],
  });

  useEffect(() => {
    axios.get("/dashboard/state-data").then((res) => {
      // Calculer prix total par ticket avec taxe
      const ticketsWithTax = res.data.tickets.map(t => ({
        ...t,
        total_price: (t.price || 0) + STATE_TAX,
      }));

      setData({ ...res.data, tickets: ticketsWithTax });
    });
  }, []);

  const totalRevenue = data.tickets.reduce((sum, t) => sum + t.total_price, 0);

  return (
    <GuestLayout>
      <Box sx={{ p: 4, spaceY: 4 }}>
        <Typography variant="h3" mb={3}>
          Dashboard État 🇲🇱
        </Typography>

        {/* ROW 1 : Ventes + Montant total */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp className="text-blue-600 mr-2" />
                <Typography variant="h6">Ventes totales</Typography>
              </Box>
              <Typography variant="h4">
                {totalRevenue.toLocaleString()} FCFA
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total incluant la taxe État ({STATE_TAX} FCFA par billet)
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Package className="text-orange-600 mr-2" />
                <Typography variant="h6">Tickets vendus</Typography>
              </Box>
              <Typography variant="h4">{data.tickets.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Sièges occupés / restants selon chaque bus
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* ROW 2 : Top Chauffeurs + Top Routes */}
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Users className="text-purple-600 mr-2" />
                <Typography variant="h6">Top Chauffeurs</Typography>
              </Box>
              <List dense>
                {data.top_drivers.map((d, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={`${d.name}`}
                      secondary={`${d.tickets_sold} tickets vendus`}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <MapPin className="text-red-600 mr-2" />
                <Typography variant="h6">Top Routes</Typography>
              </Box>
              <List dense>
                {data.top_routes.map((r, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={`${r.route}`}
                      secondary={`${r.tickets_sold} tickets • ${(r.revenue + r.tickets_sold * STATE_TAX).toLocaleString()} FCFA`}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>

        {/* ROW 3 : Graphiques */}
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Ventes par voyage
              </Typography>
              <Box sx={{ height: 300 }}>
                <SalesChart sales={data.tickets} tax={STATE_TAX} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Montant total des colis par route
              </Typography>
              <Box sx={{ height: 300 }}>
                <ParcelRoutesChart routes={data.parcel_routes} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </GuestLayout>
  );
}
