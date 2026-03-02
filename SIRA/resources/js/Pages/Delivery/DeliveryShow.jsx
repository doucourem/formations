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
import "dayjs/locale/fr";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from "@/assets/logo.png";
import DeliveryPaymentForm from "./DeliveryPaymentForm";

dayjs.locale("fr");

export default function DeliveryShow({ delivery }) {
  // ================== HELPERS ==================
  const formatDate = (date) =>
    date ? dayjs(date).format("DD MMMM YYYY à HH:mm") : "—";

  
  const formatNumberPDF = (num) => {
  if (!num && num !== 0) return "0";
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(","); // décimales séparées par ","
};

const formatMoney = (value) => `${formatNumberPDF(value || 0)} CFA`;


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

  const totalExpenses = Number(delivery.total_expenses || 0);
  const netResult = Number(delivery.price || 0) - totalExpenses;
  const translateExpenseType = (type) => {
  const map = {
    chauffeur: "Chauffeur",
    carburant: "Carburant",
    peages: "Péages",
    restauration: "Restauration",
    entretien: "Entretien",
    autres: "Autres",
  };
  return map[type] || type;
};

const handleExportPDFStyled = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 14;
  const marginRight = 14;

  // -------------------------------
  // LOGO + TITRE CENTRÉ
  // -------------------------------
  const logoWidth = 30;
  const logoHeight = 20;
  doc.addImage(Logo, "PNG", marginLeft, 10, logoWidth, logoHeight);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Détails de la livraison", pageWidth / 2, 20, { align: "center" });

  // Ligne sous le titre
  doc.setLineWidth(0.5);
  doc.line(marginLeft, 35, pageWidth - marginRight, 35);

  // -------------------------------
  // TABLEAU PRINCIPAL
  // -------------------------------
  const totalSales = delivery.price ?? 0;
  const netResult = totalSales - (totalExpenses ?? 0);

  autoTable(doc, {
    startY: 40,
    head: [["Champ", "Valeur"]],
    body: [
      ["Véhicule", delivery.bus?.registration_number || "—"],
      [
        "Chauffeur",
        `${delivery.driver?.first_name || ""} ${delivery.driver?.last_name || ""}`,
      ],
      ["Produit", delivery.product_name],
      ["Lot", delivery.product_lot || "—"],
      ["Quantité chargée", delivery.quantity_loaded],
      ["Quantité livrée", delivery.quantity_delivered ?? "—"],
      ["Distance (km)", delivery.distance_km ?? "—"],
      ["Prix total ventes", formatMoney(totalSales)],
      ["Total dépenses", formatMoney(totalExpenses)],
      ["Statut", statusProps.label],
      ["Départ", formatDate(delivery.departure_at)],
      ["Arrivée", formatDate(delivery.arrival_at)],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      valign: "middle",
    },
    headStyles: {
      fillColor: [21, 101, 192],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // -------------------------------
  // TABLEAU DES DÉPENSES (si existant)
  // -------------------------------
  if (delivery.expenses?.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Type", "Montant (CFA)", "Description", "Date"]],
      body: delivery.expenses.map((e) => [
        e.type,
        formatMoney(e.amount),
        e.description || "—",
        formatDate(e.created_at),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fillColor: [21, 101, 192],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });
  }

  // -------------------------------
  // BLOC NET RESULT
  // -------------------------------
  const finalY = doc.lastAutoTable.finalY + 15;
  const blockWidth = 60;
  const blockHeight = 12;
  const blockX = pageWidth - marginRight - blockWidth;
  const blockY = finalY;

  // Bloc encadré avec fond coloré
  doc.setFillColor(21, 101, 192); // bleu
  doc.setDrawColor(0); // bordure noire
  doc.rect(blockX, blockY, blockWidth, blockHeight, "FD"); // Fill + Draw

  // Texte résultat net
  doc.setTextColor(255); // blanc
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Net : ${formatMoney(netResult)} CFA`, blockX + blockWidth / 2, blockY + 8, { align: "center" });

  // -------------------------------
  // SIGNATURE
  // -------------------------------
  const signY = blockY + blockHeight + 20;
  doc.setTextColor(0); // noir
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Signature & Cachet", marginLeft, signY);
  doc.rect(marginLeft, signY + 3, 60, 25);

  // -------------------------------
  // EXPORT PDF
  // -------------------------------
  doc.save(`Livraison_${delivery.id}_Styled.pdf`);
};
  // ================== EXPORT PDF ==================
const handleExportPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 14;
  const marginRight = 14;

  // -------------------------------
  // LOGO
  // -------------------------------
  const logoWidth = 30;
  const logoHeight = 20;
  const logoX = marginLeft;
  const logoY = 10;
  doc.addImage(Logo, "PNG", logoX, logoY, logoWidth, logoHeight);

  // -------------------------------
  // TEXTE SOUS LE LOGO
  // -------------------------------
  const textY = logoY + logoHeight + 4; // texte collé sous le logo
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Livraison ", marginLeft, textY); // aligné à gauche du logo
  // Ligne sous le titre
  const lineY = textY + 4;
  doc.line(marginLeft, lineY, pageWidth - marginRight, lineY);

  // -------------------------------
  // INFOS PRINCIPALES 2 COLS
  // -------------------------------
  let y = lineY + 6;
  const infoRows = [
    ["Véhicule", delivery.bus?.registration_number || "—"],
    ["Chauffeur", `${delivery.driver?.first_name || ""} ${delivery.driver?.last_name || ""}`],
    ["Produit", delivery.product_name],
    ["Lot", delivery.product_lot || "—"],
    ["Quantité chargée", delivery.quantity_loaded],
    ["Quantité livrée", delivery.quantity_delivered ?? "—"],
    ["Distance (km)", delivery.distance_km ?? "—"],
    ["Statut", getStatusProps(delivery.status).label],
    ["Départ", formatDate(delivery.departure_at)],
    ["Arrivée", formatDate(delivery.arrival_at)],
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
  // RÉSUMÉ FINANCIER
  // -------------------------------
  const totalExpenses = Number(delivery.total_expenses || 0);
  const netResult = Number(delivery.price || 0) - totalExpenses;

  const financeRows = [
    ["Prix total ventes", formatMoney(delivery.price)],
    ["Total dépenses", formatMoney(totalExpenses)],
    ["Résultat net", formatMoney(netResult)],
  ];

  financeRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginLeft, y);
    doc.text(value, pageWidth - marginRight, y, { align: "right" });
    y += 6;
  });
  y += 6;

  // -------------------------------
  // DÉPENSES
  // -------------------------------
  if (delivery.expenses?.length) {
    autoTable(doc, {
      startY: y,
      head: [["Type", "Montant (CFA)", "Description", "Date"]],
      body: delivery.expenses.map((e) => [
        e.type,
        formatMoney(e.amount),
        e.description || "—",
        formatDate(e.created_at),
      ]),
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // -------------------------------
  // PAIEMENTS
  // -------------------------------
  if (delivery.payments?.length) {
    autoTable(doc, {
      startY: y,
      head: [["Montant", "Méthode", "Note", "Utilisateur", "Date"]],
      body: delivery.payments.map((p) => [
        formatMoney(p.amount),
        p.method,
        p.note || "—",
        p.user?.name || p.user_id || "—",
        formatDate(p.created_at),
      ]),
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // -------------------------------
  // SIGNATURE
  // -------------------------------
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature & Cachet", marginLeft, y);
  doc.rect(marginLeft, y + 3, 60, 25);

  // -------------------------------
  // EXPORT PDF
  // -------------------------------
  doc.save(`Livraison_${delivery.id}.pdf`);
};

  // ================== RENDER ==================
  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3 }}>
        <CardHeader
          title={
            <Typography variant="h5">
              Détails de la livraison 📦
            </Typography>
          }
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
                <Typography>
                  {delivery.bus?.registration_number || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Chauffeur</Typography>
                <Typography>
                  {delivery.driver?.first_name}{" "}
                  {delivery.driver?.last_name}
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
                <Typography variant="subtitle2">
                  Quantité chargée
                </Typography>
                <Typography>{delivery.quantity_loaded}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">
                  Quantité livrée
                </Typography>
                <Typography>
                  {delivery.quantity_delivered ?? "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">
                  Distance (km)
                </Typography>
                <Typography>{delivery.distance_km ?? "—"}</Typography>
              </Grid>
            </Grid>

            <Divider />

            {/* FINANCIER */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Prix</Typography>
                <Typography fontWeight="bold">
                  {formatMoney(delivery.price)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">
                  Total des dépenses
                </Typography>
                <Typography fontWeight="bold" color="error">
                  {formatMoney(totalExpenses)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">
                  Résultat net
                </Typography>
                <Typography
                  fontWeight="bold"
                  color={netResult >= 0 ? "success.main" : "error.main"}
                >
                  {formatMoney(netResult)}
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
                    <TableCell>Montant</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delivery.expenses.map((e) => (
                    <TableRow key={e.id}>
                        <TableCell>{translateExpenseType(e.type)}</TableCell>
                      <TableCell>{formatMoney(e.amount)}</TableCell>
                      <TableCell>{e.description || "—"}</TableCell>
                      <TableCell>
                        {formatDate(e.created_at)}
                      </TableCell>
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
                <Chip
                  label={statusProps.label}
                  color={statusProps.color}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">
                  Date de départ
                </Typography>
                <Typography>
                  {formatDate(delivery.departure_at)}
                </Typography>
              </Grid>
            </Grid>

<Divider sx={{ my: 2 }} />
<Typography variant="h6">Paiements</Typography>

{delivery.payments?.length ? (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Montant</TableCell>
        <TableCell>Méthode</TableCell>
        <TableCell>Note</TableCell>
        <TableCell>Effectué par</TableCell>
        <TableCell>Date</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {delivery.payments.map((p) => (
        <TableRow key={p.id}>
          <TableCell>{formatMoney(p.amount)}</TableCell>
          <TableCell>{p.method}</TableCell>
          <TableCell>{p.note || "—"}</TableCell>
          <TableCell>
            {p.user?.name || p.user_id || "—"}
          </TableCell>
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
{delivery.balance > 0 && (
    <DeliveryPaymentForm delivery={delivery} />
)}
            <Box mt={2}>
              <Button
                variant="outlined"
                onClick={() =>
                  Inertia.visit(route("deliveries.index"))
                }
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
