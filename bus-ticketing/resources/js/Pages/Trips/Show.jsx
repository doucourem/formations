import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Inertia } from "@inertiajs/inertia";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import GuestLayout from "@/Layouts/GuestLayout";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Show({ trip }) {
  if (!trip) {
    return <Typography>Chargement du trajet...</Typography>;
  }

  const formatDateFR = (date) => {
    if (!date) return "-";
    return format(new Date(date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Détails du trajet #{trip.id}</Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => Inertia.get(route("trips.index"))}
          >
            Retour à la liste
          </Button>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <RouteIcon sx={{ mr: 1, color: "primary.main" }} />
              Route : {trip.route?.departureCity?.name || "-"} → {trip.route?.arrivalCity?.name || "-"}
            </Typography>

            <Divider />

            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <DirectionsBusIcon sx={{ mr: 1, color: "primary.main" }} />
              Bus : {trip.bus?.model || "-"} ({trip.bus?.registration_number || "N/A"})
            </Typography>

            <Divider />

            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
              Départ : {formatDateFR(trip.departure_at)}
            </Typography>

            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
              Arrivée : {formatDateFR(trip.arrival_at)}
            </Typography>

            <Divider />

            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <MonetizationOnIcon sx={{ mr: 1, color: "green" }} />
              Prix de base : <strong>{trip.base_price} FCFA</strong>
            </Typography>

            <Typography variant="h6">
              Places disponibles : <strong>{trip.seats_available}</strong>
            </Typography>
          </Stack>
        </Paper>

        {/* Section Billets */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h5" gutterBottom>
            Billets vendus
          </Typography>

          {trip.tickets?.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>NINA</TableCell>
                    <TableCell>Siège</TableCell>
                    <TableCell>Prix (FCFA)</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trip.tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.client_name}</TableCell>
                      <TableCell>{ticket.client_nina || "-"}</TableCell>
                      <TableCell>{ticket.seat_number || "-"}</TableCell>
                      <TableCell>{ticket.price}</TableCell>
                      <TableCell
                        style={{
                          color:
                            ticket.status === "paid"
                              ? "green"
                              : ticket.status === "cancelled"
                              ? "red"
                              : "orange",
                          fontWeight: 600,
                        }}
                      >
                        {ticket.status === "paid"
                          ? "Payé"
                          : ticket.status === "cancelled"
                          ? "Annulé"
                          : "Réservé"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Aucun billet vendu pour ce trajet.</Typography>
          )}
        </Paper>

        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => Inertia.get(route("trips.edit", trip.id))}
          >
            Modifier le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
