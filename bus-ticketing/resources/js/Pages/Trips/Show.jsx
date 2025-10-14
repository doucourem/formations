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

// Icônes
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { TripPDFDownload } from "@/Components/TripPDF";

export default function TripShow({ trip }) {
  if (!trip) {
    return (
      <GuestLayout>
        <Typography sx={{ p: 3 }}>Chargement du trajet...</Typography>
      </GuestLayout>
    );
  }

  const formatDateFR = (date) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return date;
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
        {/* En-tête */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Détails du trajet #{trip.id}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => Inertia.get(route("trips.index"))}
          >
            Retour à la liste
          </Button>
        </Stack>

        {/* Informations principales */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <RouteIcon sx={{ mr: 1, color: "primary.main" }} />
              Route : {trip.route?.departureCity|| "-"} →{" "}
              {trip.route?.arrivalCity || "-"}
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
              Prix de base : <strong>{trip.route?.price} FCFA</strong>
            </Typography>

            <Typography variant="h6">
              Places disponibles : <strong>{trip.bus?.capacity ?? "N/A"}</strong>
            </Typography>
          </Stack>
        </Paper>

        {/* Section Billets */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Billets vendus
            </Typography>
            <TripPDFDownload trip={trip} />
          </Stack>

          {trip.tickets?.length > 0 ? (
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead sx={{ bgcolor: "primary.main" }}>
                  <TableRow>
                    <TableCell >Client</TableCell>
                    <TableCell >Agence</TableCell>
                       <TableCell >Vendeur</TableCell>
                    <TableCell >Siège</TableCell>
                    <TableCell >Prix (FCFA)</TableCell>
                    <TableCell >Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trip.tickets.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>{ticket.client_name}</TableCell>
                      <TableCell>{ticket.user?.agency?.name || "-"}</TableCell>
                       <TableCell>{ticket.user?.name }</TableCell>
                      <TableCell>{ticket.seat_number || "-"}</TableCell>
                      <TableCell>{ticket.price?.toLocaleString() || "-"}</TableCell>
                      <TableCell
                        sx={{
                          color:
                            ticket.status === "paid"
                              ? "green"
                              : ticket.status === "cancelled"
                              ? "red"
                              : "orange",
                          fontWeight: 600,
                          textTransform: "capitalize",
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
            <Typography sx={{ mt: 2, textAlign: "center" }}>
              Aucun billet vendu pour ce trajet.
            </Typography>
          )}
        </Paper>

        {/* Bouton modifier */}
        <Box sx={{ mt: 3, textAlign: "right" }}>
        
        </Box>
      </Box>
    </GuestLayout>
  );
}
