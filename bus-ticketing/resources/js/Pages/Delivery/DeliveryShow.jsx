import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Grid,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Inertia } from "@inertiajs/inertia";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DeliveryShow({ delivery }) {
  const formatDate = (date) =>
    date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—";

  const getStatusProps = (status) => {
    switch (status) {
      case "delivered":
        return { label: "Livré", color: "success" };
      case "in_transit":
        return { label: "En transit", color: "warning" };
      default:
        return { label: "En attente", color: "default" };
    }
  };

  const statusProps = getStatusProps(delivery.status);

  const totalExpenses = delivery.total_expenses || 0;
  const netResult = Number(delivery.price) - totalExpenses;

  // ================== EXPORT PDF COMPLET ==================
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Détails de la livraison", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Champ", "Valeur"]],
      body: [
        ["Véhicule", delivery.bus?.registration_number || "—"],
        ["Chauffeur", `${delivery.driver?.first_name || ""} ${delivery.driver?.last_name || ""}`],
        ["Produit", delivery.product_name],
        ["Lot", delivery.product_lot || "—"],
        ["Quantité chargée", delivery.quantity_loaded],
        ["Quantité livrée", delivery.quantity_delivered ?? "—"],
        ["Distance (km)", delivery.distance_km ?? "—"],
        ["Prix", `${Number(delivery.price).toLocaleString()} CFA`],
        ["Total dépenses", `${totalExpenses.toLocaleString()} CFA`],
        ["Résultat net", `${netResult.toLocaleString()} CFA`],
        ["Statut", statusProps.label],
        ["Départ", formatDate(delivery.departure_at)],
        ["Arrivée", formatDate(delivery.arrival_at)],
      ],
    });

    if (delivery.expenses?.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Type", "Montant (CFA)", "Description", "Date"]],
        body: delivery.expenses.map((e) => [
          e.type,
          Number(e.amount).toLocaleString(),
          e.description || "—",
          e.created_at,
        ]),
      });
    }

    doc.save(`Livraison_${delivery.id}.pdf`);
  };

  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Détails de la livraison 📦</Typography>}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleExportPDF}>
                Export PDF
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  Inertia.visit(route("deliveries.edit", delivery.id))
                }
              >
                Modifier
              </Button>
            </Stack>
          }
        />

        <Divider />

        <CardContent>
          <Stack spacing={3}>
            {/* INFOS PRINCIPALES */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Véhicule</Typography>
                <Typography>{delivery.bus?.registration_number}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Chauffeur</Typography>
                <Typography>
                  {delivery.driver?.first_name} {delivery.driver?.last_name}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* PRODUIT */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Produit</Typography>
                <Typography>{delivery.product_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Lot</Typography>
                <Typography>{delivery.product_lot || "—"}</Typography>
              </Grid>
            </Grid>

            {/* QUANTITÉS */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Quantité chargée</Typography>
                <Typography>{delivery.quantity_loaded}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Quantité livrée</Typography>
                <Typography>{delivery.quantity_delivered ?? "—"}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Distance (km)</Typography>
                <Typography>{delivery.distance_km ?? "—"}</Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* FINANCIER */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Prix</Typography>
                <Typography fontWeight="bold">
                  {Number(delivery.price).toLocaleString()} CFA
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Total dépenses</Typography>
                <Typography fontWeight="bold" color="error">
                  {totalExpenses.toLocaleString()} CFA
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Résultat net</Typography>
                <Typography
                  fontWeight="bold"
                  color={netResult >= 0 ? "success.main" : "error.main"}
                >
                  {netResult.toLocaleString()} CFA
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* DÉPENSES */}
            <Typography variant="h6">Dépenses</Typography>

            {delivery.expenses?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Montant (CFA)</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delivery.expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{Number(e.amount).toLocaleString()}</TableCell>
                      <TableCell>{e.description || "—"}</TableCell>
                      <TableCell>{e.created_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">
                Aucune dépense enregistrée
              </Typography>
            )}

            <Divider />

            {/* STATUT & DATES */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Statut</Typography>
                <Chip label={statusProps.label} color={statusProps.color} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Départ</Typography>
                <Typography>{formatDate(delivery.departure_at)}</Typography>
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button
                variant="outlined"
                onClick={() => Inertia.visit(route("deliveries.index"))}
              >
                Retour à la liste
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
