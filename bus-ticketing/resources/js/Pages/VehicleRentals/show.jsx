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
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct import
import dayjs from "dayjs";

export default function VehicleRentalShow() {
  const { rental } = usePage().props;

  if (!rental) return <p>Location non trouvée</p>;

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—");

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

  // ✅ Export PDF fonctionnel
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Détails de la location 🚗", 14, 20);

    const data = [
      ["ID", rental.id],
      ["Véhicule", rental.vehicle_name],
      ["Client", rental.customer_name],
      ["Date de début", formatDate(rental.rental_start)],
      ["Date de fin", formatDate(rental.rental_end)],
      ["Statut", statusProps.label],
    ];

    autoTable(doc, {
      startY: 30,
      head: [["Champ", "Valeur"]],
      body: data,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { cellPadding: 3 },
    });

    doc.save(`Location_${rental.id}.pdf`);
  };

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 600, margin: "0 auto", mt: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h5">Détails de la location 🚗</Typography>}
            action={
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={handleExportPDF}>
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  onClick={() => Inertia.get(route("vehicle-rentals.index"))}
                >
                  Retour à la liste
                </Button>
              </Stack>
            }
          />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">ID :</Typography>
                <Typography>{rental.id}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Véhicule :</Typography>
                <Typography>{rental.vehicle_name}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Client :</Typography>
                <Typography>{rental.customer_name}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Date de début :</Typography>
                <Typography>{formatDate(rental.rental_start)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Date de fin :</Typography>
                <Typography>{formatDate(rental.rental_end)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Statut :</Typography>
                <Chip label={statusProps.label} color={statusProps.color} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
