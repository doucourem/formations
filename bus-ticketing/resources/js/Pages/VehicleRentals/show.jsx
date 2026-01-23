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

  // ✅ Sécurisation
  const expenses = rental.expenses ?? [];

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const formatDate = (date) =>
    date ? dayjs(date).format("DD/MM/YYYY") : "—";

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

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 800, margin: "0 auto", mt: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h5">Détails de la location 🚗</Typography>}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => Inertia.get(route("vehicle-rentals.index"))}
                >
                  Retour
                </Button>
              </Stack>
            }
          />

          <Divider />

          <CardContent>
            {/* ================= INFOS LOCATION ================= */}
            <Stack spacing={2}>
              {[
                ["ID", rental.id],
                ["Véhicule", rental.vehicle_name],
                ["Client", rental.customer_name],
                ["Lieu de départ", rental.departure_location],
                ["Lieu d'arrivée", rental.arrival_location],
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
            </Stack>

            {/* ================= DÉPENSES ================= */}
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Dépenses liées 💸
            </Typography>

            {expenses.length === 0 ? (
              <Typography color="text.secondary">
                Aucune dépense enregistrée.
              </Typography>
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
                      <TableCell align="right">
                        {Number(e.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* TOTAL */}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{totalExpenses.toLocaleString()} CFA</strong>
                    </TableCell>
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
