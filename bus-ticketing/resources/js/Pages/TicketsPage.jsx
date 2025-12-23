import { Grid, Container, Box, Typography, Button, Card, Stack } from "@mui/material";
import { Add, WhatsApp, History, Payments, TrendingUp } from "@mui/icons-material";
import PageHero from "@/components/PageHero";
import FeatureCard from "@/components/FeatureCard";
import StatCard from "@/components/StatCard"; // Un nouveau composant léger

export default function TicketsPage() {
  return (
    <Box component="main" sx={{ pb: 10, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <PageHero
        title="Vente de billets"
        subtitle="Gestion centralisée de votre billetterie numérique"
      />

      <Container maxWidth="lg" sx={{ mt: -6 }}>
        {/* --- SECTION 1: STATISTIQUES RAPIDES --- */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={4}>
            <StatCard title="Ventes du jour" value="124" trend="+12%" icon={<TrendingUp color="success" />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Chiffre d'affaires" value="450 000 FCFA" icon={<Payments color="primary" />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="En attente WhatsApp" value="8" icon={<WhatsApp color="warning" />} />
          </Grid>
        </Grid>

        {/* --- SECTION 2: ACTIONS PRINCIPALES --- */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1a202c" }}>
          Actions rapides
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Nouveau billet" 
              description="Émission instantanée" 
              icon={<Add fontSize="large" />}
              highlight={true} // Pour mettre en avant l'action principale
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="WhatsApp" 
              description="Gérer les demandes" 
              icon={<WhatsApp fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Paiements" 
              description="Mobile Money / Cash" 
              icon={<Payments fontSize="large" />} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              title="Historique" 
              description="Rapports complets" 
              icon={<History fontSize="large" />} 
            />
          </Grid>
        </Grid>

        {/* --- SECTION 3: DERNIÈRES OPÉRATIONS --- */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a202c" }}>
            Dernières ventes
          </Typography>
          <Button variant="outlined" size="small">Voir tout</Button>
        </Stack>

        <Card sx={{ p: 0, borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          {/* Ici, tu insères un composant de tableau ou une liste simple */}
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            Tableau des transactions (composant Table à intégrer ici)
          </Box>
        </Card>
      </Container>
    </Box>
  );
}