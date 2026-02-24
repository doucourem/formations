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

export default function VehicleRentalShow() {
  const { rental } = usePage().props;
  if (!rental) return <p>Location non trouvée</p>;

  const expenses = rental.expenses ?? [];

  const formatDate = (date) =>
    date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—";

  const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString()} CFA`;

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

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
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
                <Button
                  variant="outlined"
                  onClick={() =>
                    Inertia.get(route("vehicle-rentals.edit", rental.id))
                  }
                >
                  Éditer
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