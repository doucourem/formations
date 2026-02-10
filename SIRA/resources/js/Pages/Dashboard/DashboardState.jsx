import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import GuestLayout from "@/Layouts/GuestLayout";

// UI Components
import { 
  Box, Card, Typography, Grid, CircularProgress, 
  Fade, Divider, ToggleButton, ToggleButtonGroup, Skeleton 
} from "@mui/material";
import { 
  Route, Landmark, Wrench, BarChart3, 
  Package, ShieldCheck, Calendar 
} from "lucide-react";

// Charts & Components
import SalesChart from "@/Components/SalesChart";
import ParcelRoutesChart from "@/Components/ParcelRoutesChart";
import BusFillRate from "@/Components/BusFillRate";
import TopRoutes from "@/Components/TopRoutes";
import ExpensesDashboard from "@/Pages/Dashboard/ExpensesDashboard";

const CONTRIBUTION_UNITAIRE = 500; 

// === Composant Carte Info Réutilisable ===
function InfoCard({ title, icon: Icon, value, color, subtitle, loading }) {
  return (
    <Card sx={{ p: 3, borderLeft: `8px solid ${color}`, borderRadius: "12px", height: '100%' }}>
      {loading ? (
        <Skeleton variant="rectangular" height={80} />
      ) : (
        <>
          <Box display="flex" alignItems="center" mb={1} color={color}>
            <Icon size={22} />
            <Typography ml={1.5} fontWeight="600" color="text.secondary" variant="caption">
              {title.toUpperCase()}
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="800">{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{subtitle}</Typography>
        </>
      )}
    </Card>
  );
}

export default function DashboardState() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tickets_count: 0,
    frais_peage: 0,
    revenu_abonnements_garages: 0,
    trips: [],
    parcel_routes: [],
    top_routes: [],
    buses: [],
  });

  // Fonction de récupération des données
  const loadDashboardData = useCallback(async (selectedPeriod) => {
    setLoading(true);
    try {
      const response = await axios.get(`/dashboard/state-data`, {
        params: { period: selectedPeriod }
      });
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(period);
  }, [period, loadDashboardData]);

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) setPeriod(newPeriod);
  };

  const totalContribution = data.tickets_count * CONTRIBUTION_UNITAIRE;

  return (
    <GuestLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        
        {/* HEADER & FILTRES */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#1a237e">
              Suivi des Engagements 🇲🇱
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analyse des contributions et flux de mobilité
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            sx={{ bgcolor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            size="small"
          >
            <ToggleButton value="today">Aujourd'hui</ToggleButton>
            <ToggleButton value="week">Semaine</ToggleButton>
            <ToggleButton value="month">Ce mois</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* INDICATEURS CLÉS */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Fond de Développement"
              icon={ShieldCheck}
              value={`${totalContribution.toLocaleString()} FCFA`}
              color="#1a237e"
              subtitle="Participation investissement"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Redevance Routière"
              icon={Route}
              value={`${data.frais_peage.toLocaleString()} FCFA`}
              color="#ef6c00"
              subtitle="Maintenance réseau"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Flux Passagers"
              icon={BarChart3}
              value={data.tickets_count.toLocaleString()}
              color="#d32f2f"
              subtitle="Billets enregistrés"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard
              title="Services Garages"
              icon={Wrench}
              value={`${data.revenu_abonnements_garages.toLocaleString()} FCFA`}
              color="#2e7d32"
              subtitle="Abonnements partenaires"
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* GRAPHIQUES ET ANALYSES */}
        {!loading && (
          <Fade in timeout={800}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ p: 3, borderRadius: "12px" }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>Évolution de l'Activité</Typography>
                  <Box sx={{ height: 350 }}>
                    <SalesChart sales={data.trips} />
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ p: 3, borderRadius: "12px", height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>Top Destinations</Typography>
                  <TopRoutes routes={data.top_routes} />
                  <Divider sx={{ my: 3 }} />
                  <BusFillRate buses={data.buses} />
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: "12px" }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Logistique & Colis</Typography>
                  <ParcelRoutesChart routes={data.parcel_routes} />
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: "12px" }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Bilan des Charges</Typography>
                  <ExpensesDashboard />
                </Card>
              </Grid>
            </Grid>
          </Fade>
        )}
      </Box>
    </GuestLayout>
  );
}