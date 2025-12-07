import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  IconButton,
  Pagination,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function TripsByBus({ bus, trips, filters }) {
  const [sortField, setSortField] = useState(filters?.sort_field || "id");
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || "asc");

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    Inertia.get(
      route("trips.byBus", bus.id),
      { per_page: filters.per_page, sort_field: field, sort_direction: direction },
      { preserveState: true }
    );
  };

  const handlePage = (page) => {
    Inertia.get(
      route("trips.byBus", bus.id),
      { per_page: filters.per_page, page, sort_field: sortField, sort_direction: sortDirection },
      { preserveState: true }
    );
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h5">Voyages du bus #{bus.id} — {bus.registration_number}</Typography>}
            action={
              <Button
                variant="contained"
                color="primary"
                onClick={() => Inertia.visit(route("buses.index"))}
              >
                Retour à la liste des bus
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
               <TableHead sx={{ bgcolor: "#1976d2" }}>
  <TableRow>
    <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("id")}>
      ID {renderSortIcon("id")}
    </TableCell>
    <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("departure_at")}>
      Départ {renderSortIcon("departure_at")}
    </TableCell>
    <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("arrival_at")}>
      Arrivée {renderSortIcon("arrival_at")}
    </TableCell>
    <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("route")}>
      Trajet {renderSortIcon("route")}
    </TableCell>
    <TableCell sx={{ cursor: "pointer", color: "#fff" }}>
      Montant billets
    </TableCell>
    <TableCell align="center" sx={{ color: "#fff" }}>Actions</TableCell>
  </TableRow>
</TableHead>

             <TableBody>
  {trips.data && trips.data.length > 0 ? (
    trips.data.map((trip) => (
      <TableRow key={trip.id}>
        <TableCell>{trip.id}</TableCell>
        <TableCell>{trip.departure_at}</TableCell>
        <TableCell>{trip.arrival_at}</TableCell>
        <TableCell>{trip.route?.departureCity} → {trip.route?.arrivalCity}</TableCell>
        <TableCell>{(trip.tickets_total ?? 0).toLocaleString()} FCFA</TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              color="primary"
              size="small"
              onClick={() => Inertia.visit(route("trips.show", trip.id))}
            >
              <VisibilityIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} align="center">
        Aucun voyage trouvé pour ce bus.
      </TableCell>
    </TableRow>
  )}
</TableBody>

              </Table>
            </TableContainer>

            <Box mt={3} display="flex" justifyContent="center">
              <Pagination
                count={trips.last_page || 1}
                page={trips.current_page || 1}
                onChange={(e, page) => handlePage(page)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
