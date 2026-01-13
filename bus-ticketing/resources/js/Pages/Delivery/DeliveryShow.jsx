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
} from "@mui/material";
import { Inertia } from "@inertiajs/inertia";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct import pour autoTable

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

const handleExportTicket = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 150], // petit ticket thermique
  });

  const margin = 10;
  let y = 10;

  // --- Titre centré ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Livraison - Ticket", 40, y, { align: "center" });
  y += 10;

  // --- Séparateur ---
  doc.setLineWidth(0.2);
  doc.line(margin, y, 70, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const addLine = (label, value) => {
    doc.text(`${label}:`, margin, y);
    doc.text(`${value}`, 70, y, { align: "right" });
    y += 7;
  };
  addLine("Véhicule", delivery.bus?.registration_number || "—");
  addLine("Chauffeur", `${delivery.driver?.first_name || ""} ${delivery.driver?.last_name || ""}`.trim() || "—");
  addLine("Produit", delivery.product_name || "—");
  addLine("Lot", delivery.product_lot || "—");
  addLine("Quantité chargée", delivery.quantity_loaded ?? "—");
  addLine("Quantité livrée", delivery.quantity_delivered ?? "—");
  addLine("Prix", `${Number(delivery.price).toLocaleString()} CFA`);
  addLine("Statut", statusProps.label);
  addLine("Départ", formatDate(delivery.departure_at));
  addLine("Arrivée", formatDate(delivery.arrival_at));

  // --- Séparateur ---
  y += 3;
  doc.line(margin, y, 70, y);
  y += 5;

  // --- Footer ---
  doc.setFontSize(9);
  doc.text(`Imprimé le: ${dayjs().format("DD/MM/YYYY HH:mm")}`, margin, y);
  y += 6;
  doc.text("Merci pour votre confiance !", 40, y, { align: "center" });

  // --- Sauvegarde ---
  doc.save(`Ticket_Livraison_${delivery.id}.pdf`);
};


  // ✅ Export PDF avec autoTable pour un rendu propre
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Détails de la livraison", 14, 20);

    const data = [
      ["Véhicule", `${delivery.bus?.registration_number} (${delivery.bus?.vehicle_type || delivery.bus?.model})`],
      ["Chauffeur", `${delivery.driver?.first_name} ${delivery.driver?.last_name}`],
      ["Produit", delivery.product_name],
      ["Lot", delivery.product_lot || "—"],
      ["Quantité chargée", delivery.quantity_loaded],
      ["Quantité livrée", delivery.quantity_delivered ?? "—"],
      ["Distance (km)", delivery.distance_km ?? "—"],
      ["Prix", `${new Intl.NumberFormat("fr-FR").format(delivery.price)} CFA`],
      ["Statut", statusProps.label],
      ["Départ", formatDate(delivery.departure_at)],
      ["Arrivée", formatDate(delivery.arrival_at)],
    ];

    autoTable(doc, {
      startY: 30,
      head: [["Champ", "Valeur"]],
      body: data,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { cellPadding: 3 },
    });

    doc.save(`Livraison_${delivery.id}.pdf`);
  };

  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Détails de la livraison 📦</Typography>}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleExportTicket}>
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Véhicule</Typography>
                <Typography>
                  {delivery.bus?.registration_number} ({delivery.bus?.vehicle_type || delivery.bus?.model})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Chauffeur</Typography>
                <Typography>
                  {delivery.driver?.first_name} {delivery.driver?.last_name}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

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

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Prix</Typography>
                <Typography fontWeight="bold">
                  {Number(delivery.price).toLocaleString()} CFA
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Statut</Typography>
                <Chip
                  label={statusProps.label}
                  color={statusProps.color}
                  sx={{ fontWeight: "bold" }}
                />
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Départ</Typography>
                <Typography>{formatDate(delivery.departure_at)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Arrivée</Typography>
                <Typography>{formatDate(delivery.arrival_at)}</Typography>
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
