import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { route } from "ziggy-js";

export default function VehicleRentalShow() {
  const { rental } = usePage().props;
  if (!rental) return <p>Location non trouvée</p>;

  const expenses = rental.expenses ?? [];
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—");

  const getStatusProps = (status) => {
    switch (status) {
      case "active": return { label: "Active", color: "success" };
      case "completed": return { label: "Terminée", color: "default" };
      case "cancelled": return { label: "Annulée", color: "error" };
      default: return { label: status, color: "default" };
    }
  };
  const statusProps = getStatusProps(rental.status);

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Détails de la location 🚗", 14, 20);

    // Infos principales
    const info = [
      ["ID", rental.id],
      ["Véhicule", rental.vehicle_name],
      ["Modèle de contrat", rental.contract_model || "—"],
      ["Chauffeur", rental.driver_name || "—"],
      ["Client", rental.customer_name],
      ["Lieu départ", rental.departure_location],
      ["Lieu arrivée", rental.arrival_location],
      ["Date début", formatDate(rental.rental_start)],
      ["Date fin", formatDate(rental.rental_end)],
      ["Statut", statusProps.label],
    ];
    autoTable(doc, {
      startY: 28,
      head: [["Champ", "Valeur"]],
      body: info,
      theme: "grid",
      styles: { fontSize: 10 },
    });

    // Dépenses
    if (expenses.length) {
      doc.text("Dépenses 💸", 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [["Type", "Description", "Montant (CFA)"]],
        body: expenses.map(e => [e.type, e.description || "-", Number(e.amount).toLocaleString()]),
        foot: [["Total", "", totalExpenses.toLocaleString() + " CFA"]],
        theme: "grid",
        styles: { fontSize: 10 },
      });
    }

    doc.save(`location-${rental.id}.pdf`);
  };

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h5">Détails de la location 🚗</Typography>}
            action={
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => Inertia.get(route("vehicle-rentals.index"))}>Retour</Button>
                <Button variant="outlined" color="primary" onClick={() => Inertia.get(route("vehicle-rentals.edit", rental.id))}>Éditer</Button>
                <Button variant="outlined" color="secondary" onClick={handleExportPDF}>Exporter PDF</Button>
              </Stack>
            }
          />
          <Divider />

          <CardContent>
            {/* Infos location */}
            <Stack spacing={2}>
              {[
                ["ID", rental.id],
                ["Véhicule", rental.vehicle_name],
                ["Modèle de contrat", rental.contract_model || "—"],
                ["Chauffeur", rental.driver_name || "—"],
                ["Client", rental.customer_name],
                ["Lieu départ", rental.departure_location],
                ["Lieu arrivée", rental.arrival_location],
                ["Date début", formatDate(rental.rental_start)],
                ["Date fin", formatDate(rental.rental_end)],
              ].map(([label, value]) => (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">{label} :</Typography>
                  <Typography>{value}</Typography>
                </Stack>
              ))}

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Statut :</Typography>
                <Chip label={statusProps.label} color={statusProps.color} />
              </Stack>

              {/* Photos si disponibles */}
              <Stack direction="row" spacing={2} mt={1}>
                {rental.photo_before_url && <img src={rental.photo_before_url} alt="Avant" style={{ maxHeight: 120, borderRadius: 8 }} />}
                {rental.photo_after_url && <img src={rental.photo_after_url} alt="Après" style={{ maxHeight: 120, borderRadius: 8 }} />}
              </Stack>
            </Stack>

            {/* Dépenses */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Dépenses liées 💸</Typography>

            {expenses.length === 0 ? (
              <Typography color="text.secondary">Aucune dépense enregistrée.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="right"><strong>Montant (CFA)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.description || "-"}</TableCell>
                      <TableCell align="right">{Number(e.amount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{totalExpenses.toLocaleString()} CFA</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
