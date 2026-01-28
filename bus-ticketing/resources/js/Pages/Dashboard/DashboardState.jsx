import React, { useEffect, useState } from "react";
import axios from "axios";
import GuestLayout from "@/Layouts/GuestLayout";

import { Box, Card, Typography, Grid, CircularProgress } from "@mui/material";
import { Route, Landmark, Wrench, TrendingUp } from "lucide-react";

// Charts & Components
import SalesChart from "@/Components/SalesChart";
import ParcelRoutesChart from "@/Components/ParcelRoutesChart";
import BusFillRate from "@/Components/BusFillRate";
import TopDrivers from "@/Components/TopDrivers";
import TopRoutes from "@/Components/TopRoutes";
import ExpensesDashboard from "@/Pages/Dashboard/ExpensesDashboard";

const STATE_TAX = 500; // Contribution par billet

// === Composant réutilisable pour les cartes d'infos ===
function InfoCard({ title, icon: Icon, value, color, subtitle }) {
  return (
    <Card sx={{ p: 3, borderLeft: `8px solid ${color}` }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Icon size={22} />
        <Typography ml={1} fontWeight="bold">{title}</Typography>
      </Box>
      <Typography variant="h4" color={color} fontWeight="bold">{value}</Typography>
      {subtitle && <Typography variant="body2">{subtitle}</Typography>}
    </Card>
  );
}

// === Calcul dynamique des contributions ===
const calculateContribution = (ticketsCount) => ticketsCount * STATE_TAX;

export default function DashboardState() {
  const [data, setData] = useState({
    tickets_count: 0,
    contribution_route: 0,
    frais_peage: 0,
    frais_garage: 0,
    revenu_abonnements_garages: 0,
    trips: [],
    parcel_routes: [],
    top_drivers: [],
    top_routes: [],
    buses: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/dashboard/state-data")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement dashboard État", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GuestLayout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h3" mb={4} fontWeight="bold">
          Dashboard État & Finances 🇲🇱
        </Typography>

        {/* ===== CARTES D'IMPACT ÉTAT ===== */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Contribution Routes"
              icon={Landmark}
              value={`${calculateContribution(data.tickets_count).toLocaleString()} FCFA`}
              color="#1976d2"
              subtitle={`${STATE_TAX.toLocaleString()} FCFA × ${data.tickets_count} billets`}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              title="Frais de Péage"
              icon={Route}
              value={`-${data.frais_peage.toLocaleString()} FCFA`}
              color="#fb8c00"
              subtitle="Dépenses routières"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              title="Abonnements Garages"
              icon={Wrench}
              value={`+${data.revenu_abonnements_garages.toLocaleString()} FCFA`}
              color="#2e7d32"
              subtitle="10 000 FCFA / garage"
            />
          </Grid>
        </Grid>

        {/* ===== GRAPHIQUES ===== */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp size={20} />
                <Typography ml={1} fontWeight="bold">Flux des ventes</Typography>
              </Box>
              <Box sx={{ height: 320 }}>
                <SalesChart sales={data.trips} tax={STATE_TAX} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <Typography fontWeight="bold" mb={2}>Colis par destination</Typography>
              <Box sx={{ height: 320 }}>
                <ParcelRoutesChart routes={data.parcel_routes} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ===== OPÉRATIONS ===== */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography fontWeight="bold" mb={2}>Remplissage des bus</Typography>
              <BusFillRate buses={data.buses} />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography fontWeight="bold" mb={2}>Dépenses</Typography>
              <ExpensesDashboard />
            </Card>
          </Grid>
        </Grid>

        {/* ===== PERFORMANCE ===== */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography fontWeight="bold" mb={2}>Top Routes</Typography>
              <TopRoutes routes={data.top_routes} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </GuestLayout>
  );
}
