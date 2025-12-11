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
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GuestLayout from "@/Layouts/GuestLayout";

export default function TripsIndex({ initialTrips, initialFilters, buses = [], routes = [], userRole }) {
  const [trips, setTrips] = useState(initialTrips || { data: [], current_page: 1, last_page: 1 });
  const [perPage, setPerPage] = useState(initialFilters?.per_page || 20);
  const [busId, setBusId] = useState(initialFilters?.bus_id || "");
  const [routeId, setRouteId] = useState(initialFilters?.route_id || "");
  const [loading, setLoading] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(null); // trip.id du formulaire ouvert
  const [expensesForm, setExpensesForm] = useState({}); // { tripId: { type, amount, description } }

  // Filtrage
  const filtrer = () => {
    setLoading(true);
    Inertia.get(
      route("trips.index"),
      { per_page: perPage, bus_id: busId, route_id: routeId },
      { preserveState: true, onFinish: () => setLoading(false), onSuccess: (page) => setTrips(page.props.initialTrips || trips) }
    );
  };

  // Pagination
  const handlePage = (page) => {
    Inertia.get(route("trips.index"), { per_page: perPage, bus_id: busId, route_id: routeId, page }, {
      preserveState: true,
      onSuccess: (pageData) => setTrips(pageData.props.initialTrips || trips),
    });
  };

  // Formulaire dépense
  const handleExpenseChange = (tripId, field, value) => {
    setExpensesForm((prev) => ({ ...prev, [tripId]: { ...prev[tripId], [field]: value } }));
  };

  const submitExpense = (tripId) => {
    const data = expensesForm[tripId];
    if (!data || !data.type || !data.amount) return;

    Inertia.post(
      route("trip-expenses.store"),
      { trip_id: tripId, type: data.type, amount: parseFloat(data.amount), description: data.description || "" },
      {
        onSuccess: (page) => {
          setTrips((prev) =>
            prev.data.map((t) => t.id === tripId ? { ...t, expenses: page.props.trip.expenses || t.expenses } : t)
          );
          setExpensesForm((prev) => ({ ...prev, [tripId]: {} }));
          setOpenExpenseDialog(null);
        },
      }
    );
  };

  const formatDateFR = (date) => date ? format(new Date(date), "dd MMM yyyy HH:mm", { locale: fr }) : "-";

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <DirectionsBusIcon color="primary" />
                <Typography variant="h5">Gestion des trajets</Typography>
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }} alignItems="center" flexWrap="wrap">
              <TextField select label="Bus" value={busId} onChange={(e) => setBusId(e.target.value)} size="small" sx={{ minWidth: 160 }}>
                <MenuItem value="">Tous les bus</MenuItem>
                {buses.map((bus) => <MenuItem key={bus.id} value={bus.id}>{bus.model || `Bus #${bus.id}`}</MenuItem>)}
              </TextField>
              <TextField select label="Route" value={routeId} onChange={(e) => setRouteId(e.target.value)} size="small" sx={{ minWidth: 180 }}>
                <MenuItem value="">Toutes les routes</MenuItem>
                {routes.map((route) => <MenuItem key={route.id} value={route.id}>{route.departureCity || "-"} → {route.arrivalCity || "-"}</MenuItem>)}
              </TextField>
              <TextField label="Résultats par page" type="number" value={perPage} onChange={(e) => setPerPage(e.target.value)} size="small" sx={{ width: 140 }} inputProps={{ min: 1 }} />
              <Button variant="contained" color="secondary" onClick={filtrer} disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : "Filtrer"}
              </Button>
            </Stack>

            {/* TABLEAU DES TRAJETS */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "#1565c0" }}>
                  <TableRow>
                    {["ID", "Route", "Bus", "Départ", "Arrivée", "Prix", "Places dispo", "Actions"].map((col) => (
                      <TableCell key={col} sx={{ color: "white", fontWeight: "bold" }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trips.data.length > 0 ? (
                    trips.data.map((trip) => (
                      <React.Fragment key={trip.id}>
                        <TableRow hover>
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
                                <IconButton color="info" size="small" component={Link} href={route("trips.show", trip.id)}><VisibilityIcon /></IconButton>
                              </Tooltip>
                              <Tooltip title="Voir les colis">
                                <IconButton color="warning" size="small" component={Link} href={route("parcels.byTrip", trip.id)}><LocalShippingIcon /></IconButton>
                              </Tooltip>
                              <Tooltip title="Ajouter dépense">
                                <IconButton color="primary" size="small" onClick={() => setOpenExpenseDialog(trip.id)}>
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        {/* LISTE DES DÉPENSES EXISTANTES */}
                        {trip.expenses?.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={8}>
                              <Typography variant="subtitle2" gutterBottom>💰 Dépenses :</Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Montant (FCFA)</TableCell>
                                    <TableCell>Description</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {trip.expenses.map((exp) => (
                                    <TableRow key={exp.id}>
                                      <TableCell>{{
                                        chauffeur: "Chauffeur",
                                        fuel: "Carburant",
                                        toll: "Péage",
                                        meal: "Restauration",
                                        maintenance: "Entretien",
                                        other: "Autre",
                                      }[exp.type] || exp.type}</TableCell>
                                      <TableCell>{exp.amount.toLocaleString("fr-FR")}</TableCell>
                                      <TableCell>{exp.description || "-"}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* FORMULAIRE DÉPENSES DANS DIALOG */}
                        <Dialog
                          open={openExpenseDialog === trip.id}
                          onClose={() => setOpenExpenseDialog(null)}
                          maxWidth="sm"
                          fullWidth
                        >
                          <DialogTitle>➕ Ajouter une dépense</DialogTitle>
                          <DialogContent>
                            <Box component="form" sx={{ mt: 1 }}>
                              <Stack spacing={2}>
                                <TextField
                                  select
                                  label="Type de dépense"
                                  fullWidth
                                  value={expensesForm[trip.id]?.type || "chauffeur"}
                                  onChange={(e) => handleExpenseChange(trip.id, "type", e.target.value)}
                                >
                                  <MenuItem value="chauffeur">Chauffeur</MenuItem>
                                  <MenuItem value="fuel">Carburant</MenuItem>
                                  <MenuItem value="toll">Péages</MenuItem>
                                  <MenuItem value="meal">Restauration</MenuItem>
                                  <MenuItem value="maintenance">Entretien</MenuItem>
                                  <MenuItem value="other">Autres</MenuItem>
                                </TextField>

                                <TextField
                                  label="Montant (FCFA)"
                                  type="number"
                                  fullWidth
                                  value={expensesForm[trip.id]?.amount || 0}
                                  onChange={(e) => handleExpenseChange(trip.id, "amount", e.target.value)}
                                />

                                <TextField
                                  label="Description (optionnel)"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={expensesForm[trip.id]?.description || ""}
                                  onChange={(e) => handleExpenseChange(trip.id, "description", e.target.value)}
                                />

                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => submitExpense(trip.id)}
                                >
                                  Ajouter la dépense
                                </Button>
                              </Stack>
                            </Box>
                          </DialogContent>
                        </Dialog>

                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center"><Typography>Aucun trajet trouvé</Typography></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Box mt={3} display="flex" justifyContent="center">
              <Pagination count={trips.last_page || 1} page={trips.current_page || 1} onChange={(e, page) => handlePage(page)} color="primary" showFirstButton showLastButton />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
