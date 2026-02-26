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
import dayjs from "dayjs";
import { route } from "ziggy-js";
import VehicleRentalPaymentForm from "./VehicleRentalPaymentForm";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "@/assets/logo.png"; // ton logo

export default function VehicleRentalShow() {
  const { rental } = usePage().props;
  if (!rental) return <p>Location non trouvée</p>;

  const expenses = rental.expenses ?? [];

  const formatDate = (date) =>
    date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—";



  // 🔹 Statut location
  const getStatusProps = (status) => {
    switch (status) {
      case "active":
        return { label: "Active", color: "success" };
      case "completed":
        return { label: "Terminée", color: "default" };
      case "cancelled":
        return { label: "Annulée", color: "error" };
      default:
        return { label: status, color: "default" };
    }
  };
  const statusProps = getStatusProps(rental.status);

  // 🔹 Badge paiement
  const getPaymentProps = () => {
    switch (rental.payment_status) {
      case "paid":
        return { label: "Payé", color: "success" };
      case "partial":
        return { label: "Partiel", color: "warning" };
      default:
        return { label: "Impayé", color: "error" };
    }
  };
  const paymentProps = getPaymentProps();


 const formatMoney = (num) => {
  if (num === null || num === undefined) return "0";
  const parts = Number(num).toFixed(2).split("."); // 2 décimales
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); // séparateur milliers
  return parts.join(","); // décimales séparées par ","
};

const handleExportPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");
  const marginLeft = 14;
  const marginRight = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // -------------------------------
  // LOGO + TITRE
  // -------------------------------
  doc.addImage(Logo, "PNG", marginLeft, 10, 30, 20);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Location de Véhicule ", marginLeft + 40, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Résumé complet de la location", marginLeft + 40, 24);
  doc.text(`Date impression : ${new Date().toLocaleDateString()}`, marginLeft + 40, 29);

  y = 35;

  // -------------------------------
  // INFOS LOCATION (2 colonnes par ligne)
  // -------------------------------
  const infoRows = [
    ["ID", rental.id],
    ["Véhicule", rental.vehicle_name],
    ["Contrat", rental.contract_model],
    ["Chauffeur", rental.driver_name],
    ["Client", rental.customer_name],
    ["Départ", rental.departure_location],
    ["Arrivée", rental.arrival_location],
    ["Date début", formatDate(rental.rental_start)],
    ["Date fin", formatDate(rental.rental_end)],
    ["Statut", statusProps.label],
    ["Paiement", paymentProps.label],
  ];

  const colWidth = (pageWidth - marginLeft - marginRight) / 2;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < infoRows.length; i += 2) {
    const [label1, value1] = infoRows[i];
    const [label2, value2] = infoRows[i + 1] || ["", ""];
    doc.text(`${label1}: ${value1}`, marginLeft, y);
    if (label2) doc.text(`${label2}: ${value2}`, marginLeft + colWidth, y);
    y += 6;
  }
  y += 4;

  // -------------------------------
  // RÉSUMÉ FINANCIER (avec solde net réel)
  // -------------------------------
  const totalDepenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const soldeNet = (rental.price || 0) - totalDepenses;

  const financeRows = [
    ["Prix location", formatMoney(rental.price)],
    ["Total payé", formatMoney(rental.total_paid)],
    ["Solde restant", formatMoney(rental.balance)],
    ["Total dépenses", formatMoney(totalDepenses)],
    ["Solde net", formatMoney(soldeNet)],
  ];

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Résumé financier", marginLeft, y);
  y += 6;

  financeRows.forEach(([label, value]) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, marginLeft, y);
    doc.text(value, pageWidth - marginRight, y, { align: "right" });
    y += 6;
  });
  y += 4;

  // -------------------------------
  // DEPENSES
  // -------------------------------
  if (expenses.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dépenses liées", marginLeft, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Type", "Description", "Montant"]],
      body: expenses.map((e) => [e.type, e.description || "-", formatMoney(e.amount)]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold" },
      theme: "striped",
    });

    y = doc.lastAutoTable.finalY + 6;
  }

  // -------------------------------
  // PAIEMENTS
  // -------------------------------
  if (rental.payments?.length) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Paiements effectués", marginLeft, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Utilisateur", "Méthode", "Montant", "Date"]],
      body: rental.payments.map((p) => [
        p.user?.name || "—",
        p.method,
        formatMoney(p.amount),
        formatDate(p.created_at),
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold" },
      theme: "striped",
    });

    y = doc.lastAutoTable.finalY + 12;
  }

  // -------------------------------
  // SIGNATURE
  // -------------------------------
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Signature & Cachet", marginLeft, y);
  doc.rect(marginLeft, y + 3, 60, 25);

  // -------------------------------
  // ENREGISTRER PDF
  // -------------------------------
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
  <Button variant="contained" onClick={() => Inertia.get(route("vehicle-rentals.index"))}>
    Retour
  </Button>
  <Button variant="outlined" onClick={() => Inertia.get(route("vehicle-rentals.edit", rental.id))}>
    Éditer
  </Button>
  <Button variant="contained" color="secondary" onClick={handleExportPDF}>
    Exporter PDF
  </Button>
</Stack>
            }
          />

          <Divider />

          <CardContent>
            {/* INFOS LOCATION */}
            <Stack spacing={2}>
              {[
                ["ID", rental.id],
                ["Véhicule", rental.vehicle_name],
                ["Contrat", rental.contract_model],
                ["Chauffeur", rental.driver_name],
                ["Client", rental.customer_name],
                ["Départ", rental.departure_location],
                ["Arrivée", rental.arrival_location],
                ["Date début", formatDate(rental.rental_start)],
                ["Date fin", formatDate(rental.rental_end)],
              ].map(([label, value]) => (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">{label}</Typography>
                  <Typography>{value || "—"}</Typography>
                </Stack>
              ))}

              {/* Statuts */}
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Statut location</Typography>
                <Chip label={statusProps.label} color={statusProps.color} />
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Paiement</Typography>
                <Chip label={paymentProps.label} color={paymentProps.color} />
              </Stack>
            </Stack>

            {/* RESUME FINANCIER */}
            <Divider sx={{ my: 3 }} />

            <Stack spacing={1}>
              <Typography>
                <strong>Prix location :</strong> {formatMoney(rental.price)}
              </Typography>
              <Typography>
                <strong>Total payé :</strong> {formatMoney(rental.total_paid)}
              </Typography>
              <Typography>
                <strong>Solde restant :</strong> {formatMoney(rental.balance)}
              </Typography>
            </Stack>

            {/* DEPENSES */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">Dépenses liées 💸</Typography>

            {expenses.length === 0 ? (
              <Typography color="text.secondary">
                Aucune dépense enregistrée
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.description || "-"}</TableCell>
                      <TableCell align="right">
                        {formatMoney(e.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* PAIEMENTS */}
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
                      <TableCell>{formatMoney(p.amount)}</TableCell>
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

            {/* FORMULAIRE PAIEMENT */}
            {rental.balance > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <VehicleRentalPaymentForm rental={rental} />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}