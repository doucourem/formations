import { Grid } from "@mui/material";
import PageHero from "@/components/PageHero";
import FeatureCard from "@/components/FeatureCard";

export default function SubscriptionsPage() {
  return (
    <>
      <PageHero
        title="Abonnements FasoBillet"
        subtitle="Des plans adaptés aux professionnels du transport"
      />

      <Grid container spacing={3}>
        <FeatureCard title="Starter" description="Fonctionnalités essentielles pour petites structures." />
        <FeatureCard title="Pro" description="Outils avancés pour compagnies actives." />
        <FeatureCard title="Entreprise" description="Solution complète pour grandes flottes." />
      </Grid>
    </>
  );
}