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
import Logo from "@/assets/logo.png";

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

    const formatNumberPDF = (num) => {
  if (!num && num !== 0) return "0";
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(","); // décimales séparées par ","
};

const formatMoney = (value) => `${formatNumberPDF(value || 0)} CFA`;
  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Détails de la location 🚗", 14, 20);

    // Infos principales
    const info = [

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
const handleExportPDFStyled = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 14;
  const marginRight = 14;

  // -------------------------------
  // LOGO + TITRE
  // -------------------------------
  const logoWidth = 30;
  const logoHeight = 20;
  doc.addImage(Logo, "PNG", marginLeft, 10, logoWidth, logoHeight); // logo
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Détails de la location 🚗", pageWidth / 2, 20, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(marginLeft, 35, pageWidth - marginRight, 35);

  // -------------------------------
  // TABLEAU INFOS PRINCIPALES
  // -------------------------------
  const info = [
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
    startY: 38,
    head: [["Champ", "Valeur"]],
    body: info,
    styles: { fontSize: 10, cellPadding: 2, valign: "middle" },
    headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // -------------------------------
  // TABLEAU DÉPENSES
  // -------------------------------
  if (expenses.length) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dépenses 💸", marginLeft, doc.lastAutoTable.finalY + 10);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Type", "Description", "Montant (CFA)"]],
      body: expenses.map((e) => [
        e.type,
        e.description || "-",
        Number(e.amount).toLocaleString(),
      ]),
      foot: [["Total", "", totalExpenses.toLocaleString() + " CFA"]],
      styles: { fontSize: 10, cellPadding: 2, valign: "middle" },
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // -------------------------------
    // BLOC TOTAL NET
    // -------------------------------
    const finalY = doc.lastAutoTable.finalY + 15;
    const netAmount = rental.price - totalExpenses;
    const blockWidth = 60;
    const blockHeight = 12;
    const blockX = pageWidth - marginRight - blockWidth;
    const blockY = finalY;

    doc.setFillColor(21, 101, 192);
    doc.setDrawColor(0);
    doc.rect(blockX, blockY, blockWidth, blockHeight, "FD");

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Net : ${netAmount.toLocaleString()} CFA`, blockX + blockWidth / 2, blockY + 8, { align: "center" });
  }

  // -------------------------------
  // EXPORT PDF
  // -------------------------------
  doc.save(`location-${rental.id}_Styled.pdf`);
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
                <Button variant="outlined" color="secondary" onClick={handleExportPDFStyled}>Exporter PDF</Button>
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
                      <TableCell align="right">{formatMoney(e.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{formatMoney(totalExpenses)} CFA</strong></TableCell>
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
