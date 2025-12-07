import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  MenuItem,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Tooltip,
  CircularProgress,
  Divider,
  Pagination,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import GuestLayout from "@/Layouts/GuestLayout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";


export default function TripsIndex({
  initialTrips,
  initialFilters,
  buses = [],
  routes = [],
  userRole,
}) {
  const [trips, setTrips] = useState(initialTrips || { data: [], links: [], current_page: 1, last_page: 1 });
  const [perPage, setPerPage] = useState(initialFilters?.per_page || 20);
  const [busId, setBusId] = useState(initialFilters?.bus_id || "");
  const [routeId, setRouteId] = useState(initialFilters?.route_id || "");
  const [loading, setLoading] = useState(false);

  const filtrer = () => {
    setLoading(true);
    Inertia.get(
      route("trips.index"),
      { per_page: perPage, bus_id: busId, route_id: routeId },
      {
        preserveState: true,
        onFinish: () => setLoading(false),
        onSuccess: (page) =>
          setTrips(page.props.initialTrips || { data: [], links: [], current_page: 1, last_page: 1 }),
      }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce trajet ?")) {
      Inertia.delete(route("trips.destroy", id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(route("trips.index"), { per_page: perPage, bus_id: busId, route_id: routeId, page }, {
      preserveState: true,
      onSuccess: (pageData) => setTrips(pageData.props.initialTrips || trips),
    });
  };

  const formatDateFR = (date) =>
    date ? format(new Date(date), "dd MMM yyyy HH:mm", { locale: fr }) : "-";

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <DirectionsBusIcon color="primary" />
                <Typography variant="h5">Gestion des vols</Typography>
              </Stack>
            }
            action={
              (userRole === "manageragence" || userRole === "manager" || userRole === "admin") && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => Inertia.get(route("trips.create"))}
                >
                  Nouveau trajet
                </Button>
              )
            }
          />

          <Divider />

          <CardContent>
            {/* FILTRAGE */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                select
                label="Bus"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">Tous les bus</MenuItem>
                {buses.map((bus) => (
                  <MenuItem key={bus.id} value={bus.id}>
                    {bus.model || `Bus #${bus.id}`}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Route"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">Toutes les routes</MenuItem>
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.departureCity || "-"} → {route.arrivalCity || "-"}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Résultats par page"
                type="number"
                value={perPage}
                onChange={(e) => setPerPage(e.target.value)}
                size="small"
                sx={{ width: 140 }}
                inputProps={{ min: 1 }}
              />

              <Button
                variant="contained"
                color="secondary"
                onClick={filtrer}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Filtrer"}
              </Button>
            </Stack>

            {/* TABLEAU */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "#1565c0" }}>
                  <TableRow>
                    {["ID", "Route", "Bus", "Départ", "Arrivée", "Prix", "Places dispo", "Actions"].map((col) => (
                      <TableCell key={col} sx={{ color: "white", fontWeight: "bold" }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {trips.data.length > 0 ? (
                    trips.data.map((trip) => (
                      <TableRow key={trip.id} hover>
                        <TableCell>{trip.id}</TableCell>
                        <TableCell>{trip.route?.departureCity?.name || "-"} → {trip.route?.arrivalCity?.name || "-"}</TableCell>
                        <TableCell>{trip.bus?.model || "-"}</TableCell>
                        <TableCell>{formatDateFR(trip.departure_at)}</TableCell>
                        <TableCell>{formatDateFR(trip.arrival_at)}</TableCell>
                        <TableCell>{trip.route?.price} FCFA</TableCell>
                        <TableCell>{trip.places_dispo}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Voir le trajet">
                              <IconButton
                                color="info"
                                size="small"
                                component={Link}
                                href={route("trips.show", trip.id)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Voir les colis">
  <IconButton
    color="warning"
    size="small"
    component={Link}
    href={route("parcels.byTrip", trip.id)}
  >
    <LocalShippingIcon />
  </IconButton>
</Tooltip>

                            {new Date(trip.departure_at) >= new Date() &&
                              (userRole === "manageragence" || userRole === "manager"|| userRole === "admin") && (
                                <>
                                  <Tooltip title="Modifier">
                                    <IconButton
                                      color="primary"
                                      size="small"
                                      component={Link}
                                      href={trip.edit_url || route("trips.edit", trip.id)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Supprimer">
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={() => handleDelete(trip.id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography>Aucun trajet trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION MUI */}
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
