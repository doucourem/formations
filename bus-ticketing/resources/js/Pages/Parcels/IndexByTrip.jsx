import React from "react";
import { Link } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 👉 LOGO
import Logo from "@/assets/logo.png";

export default function IndexByTrip({ trip, parcels }) {
  // -------------------------------
  // Traduction du statut en français
  // -------------------------------
  const statusLabelFR = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
      case "livré":
        return "Livré";
      case "in_transit":
      case "en transit":
        return "En transit";
      case "pending":
      case "en attente":
        return "En attente";
      case "cancelled":
      case "annulé":
        return "Annulé";
      default:
        return "Inconnu";
    }
  };

  // -------------------------------
  // Couleur des statuts
  // -------------------------------
  const statusColor = (status) => {
    switch (status) {
      case "Livré":
        return "success";
      case "En transit":
        return "warning";
      case "En attente":
        return "default";
      case "Annulé":
        return "error";
      default:
        return "default";
    }
  };

  const formatNumberPDF = (num) => {
  if (num === null || num === undefined) return "0";
  const parts = Number(num).toFixed(2).split("."); // 2 décimales
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); // séparateur milliers
  return parts.join(","); // décimales séparées par ","
};
  // -------------------------------
  // PDF avec logo et total
  // -------------------------------
  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // -------------------------------
    // ENTÊTE + LOGO
    // -------------------------------
    doc.addImage(Logo, "PNG", 14, 10, 30, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("NILATOUTELTRANS", 50, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Transport & Logistique", 50, 24);
    doc.text("Tél : +223 XX XX XX XX", 50, 29);

    doc.line(14, 35, 196, 35);

    // -------------------------------
    // INFOS TRAJET
    // -------------------------------
    doc.setFontSize(12);
    doc.text(
      `Trajet #${trip.id} : ${trip.route?.departureCity || "-"} ${
        trip.route?.arrivalCity || "-"
      }`,
      14,
      45
    );

    doc.setFontSize(9);
    doc.text(`Date d'impression : ${new Date().toLocaleDateString()}`, 14, 51);

    // -------------------------------
    // TABLEAU
    // -------------------------------
    const tableColumn = [
      "Expéditeur",
      "Destinataire",
      "Description",
      "Poids (kg)",
      "Montant (FCFA)",
      "Statut",
    ];

    const tableRows = parcels.data.map((p) => [
      p.sender_name,
      p.recipient_name,
      p.description,
      p.weight,
      p.price.toLocaleString(),
      statusLabelFR(p.status),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 58,
      styles: {
        fontSize: 9,
        cellPadding: 2,
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
    // TOTAL
    // -------------------------------
    const total = parcels.data.reduce((sum, p) => sum + Number(p.price || 0), 0);

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL :", 130, finalY);
    doc.text(`${formatNumberPDF(total)} FCFA`, 170, finalY, { align: "right" });

    doc.line(120, finalY + 2, 196, finalY + 2);

    // -------------------------------
    // SIGNATURE
    // -------------------------------
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Signature & Cachet", 14, finalY + 25);
    doc.rect(14, finalY + 28, 60, 25);

    doc.save(`colis-trajet-${trip.id}.pdf`);
  };

  return (
    <GuestLayout>
      <Box p={3}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalShippingIcon color="primary" />
                <Typography variant="h6">
                  Colis du trajet #{trip.id} — {trip.route?.departureCity || "-"} →{" "}
                  {trip.route?.arrivalCity || "-"}
                </Typography>
              </Stack>
            }
          />

          <CardContent>
            {/* Bouton PDF */}
            <Stack direction="row" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPDF}
              >
                Télécharger PDF
              </Button>
            </Stack>

            {/* TABLEAU */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "#1565c0" }}>
                  <TableRow>
                    {["Expéditeur", "Destinataire", "Description", "Poids (kg)", "Montant", "Statut"].map(
                      (col) => (
                        <TableCell key={col} sx={{ color: "white", fontWeight: "bold" }}>
                          {col}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parcels.data.length > 0 ? (
                    parcels.data.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.sender_name}</TableCell>
                        <TableCell>{p.recipient_name}</TableCell>
                        <TableCell>{p.description}</TableCell>
                        <TableCell>{p.weight}</TableCell>
                        <TableCell>{p.price.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabelFR(p.status)}
                            color={statusColor(statusLabelFR(p.status))}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Aucun colis trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
