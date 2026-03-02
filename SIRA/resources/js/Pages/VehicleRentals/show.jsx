import React, { useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage, Head } from "@inertiajs/react";
import {
  Box, Typography, Button, Stack, Divider, Card, CardContent, CardHeader,
  Chip, Table, TableHead, TableRow, TableCell, TableBody, Grid, Paper
} from "@mui/material";
import {
  ArrowBack, Edit, Download, LocalTaxi, Person,
  LocationOn, Event
} from "@mui/icons-material";
import GuestLayout from "@/Layouts/GuestLayout";
import dayjs from "dayjs";
import { route } from "ziggy-js";
import VehicleRentalPaymentForm from "./VehicleRentalPaymentForm";
import Logo from "@/assets/logo.png";
import { exportRentalToPDF } from "./ExportService";

export default function VehicleRentalShow() {
  const { rental } = usePage().props;
  if (!rental) return <Typography sx={{ p: 4 }}>Location non trouvée</Typography>;

  const expenses = rental.expenses ?? [];

  // 🔹 Totaux et net
  const totals = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const net = (rental.price || 0) - totalExpenses;
    return { expenses: totalExpenses, net };
  }, [expenses, rental.price]);

  // 🔹 Formatage
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(amount);

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—");

  // 🔹 Couleur selon statut
  const statusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "completed": return "primary";
      case "canceled": return "error";
      default: return "default";
    }
  };

  return (
    <GuestLayout>
      <Head title={`Location #${rental.id}`} />
      <Box sx={{ maxWidth: 1000, mx: "auto", py: 4, px: 2 }}>
        
        {/* Barre d'actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => Inertia.get(route("vehicle-rentals.index"))}>
            Retour
          </Button>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => Inertia.get(route("vehicle-rentals.edit", rental.id))}>
              Modifier
            </Button>
            <Button variant="contained" color="secondary" startIcon={<Download />}
              onClick={() => exportRentalToPDF(rental, expenses, totals, Logo)}>
              PDF
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Colonne gauche : Détails */}
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 4 }}>
              <CardHeader
                title={<Typography variant="h6">Détails du Contrat</Typography>}
                avatar={<LocalTaxi color="primary" />}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <InfoItem icon={<Person fontSize="small" />} label="Client" value={rental.customer_name} />
                  <InfoItem icon={<LocalTaxi fontSize="small" />} label="Véhicule" value={rental.vehicle_name} />
                  <InfoItem icon={<LocationOn fontSize="small" />} label="Trajet" value={`${rental.departure_location} ➔ ${rental.arrival_location}`} />
                  <InfoItem icon={<Event fontSize="small" />} label="Début" value={formatDate(rental.rental_start)} />
                  <InfoItem icon={<Event fontSize="small" />} label="Fin" value={formatDate(rental.rental_end)} />
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Statut</Typography>
                    <Box mt={0.5}>
                      <Chip size="small" label={rental.status} color={statusColor(rental.status)} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Dépenses */}
            <Paper sx={{ mt: 3, borderRadius: 4, overflow: "hidden" }}>
              <Box p={2} bgcolor="grey.50">
                <Typography variant="subtitle1" fontWeight="bold">Dépenses liées</Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>{e.type}</TableCell>
                      <TableCell align="right">{formatCurrency(e.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total Dépenses</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.expenses)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">Paiements effectués 💵</Typography>
            {rental.payments?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Méthode</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rental.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.user?.name || "—"}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>{formatDate(p.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">
                Aucun paiement enregistré
              </Typography>
            )}
          </Grid>

          {/* Colonne droite : Résumé financier */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" gutterBottom>Résumé Financier</Typography>
                  <FinanceRow label="Prix Total" value={formatCurrency(rental.price)} />
                  <FinanceRow label="Dépenses" value={formatCurrency(totals.expenses)} />
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                  <FinanceRow label="Net" value={formatCurrency(totals.net)} bold />
                  <FinanceRow label="Déjà payé" value={formatCurrency(rental.total_paid)} />
                  <FinanceRow label="Reste à payer" value={formatCurrency(rental.balance)} bold />
                </Stack>
              </CardContent>
            </Card>

            {/* Formulaire paiement */}
            {rental.balance > 0 && (
              <Box sx={{ mt: 3 }}>
                <VehicleRentalPaymentForm rental={rental} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </GuestLayout>
  );
}

// 🔹 Composants internes
const InfoItem = ({ icon, label, value }) => (
  <Grid item xs={6}>
    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
      {icon}
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Stack>
    <Typography variant="body2" fontWeight="500">{value || "—"}</Typography>
  </Grid>
);

const FinanceRow = ({ label, value, bold = false }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="body2" sx={{ opacity: 0.9 }}>{label}</Typography>
    <Typography variant="body1" fontWeight={bold ? 700 : 400}>{value}</Typography>
  </Stack>
);