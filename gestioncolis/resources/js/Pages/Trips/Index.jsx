import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/react";
import {
    Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Stack, MenuItem, IconButton,
    Card, CardHeader, CardContent, Tooltip, CircularProgress, Divider, Pagination, Chip
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    DirectionsBus as DirectionsBusIcon,
    LocalShipping as LocalShippingIcon,
    Search as SearchIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import GuestLayout from "@/Layouts/GuestLayout";
import { indigo } from "@mui/material/colors";

export default function TripsIndex({
    initialTrips,
    initialFilters,
    buses = [],
    routes = [],
    userRole,
}) {
    // Initialisation sécurisée de l'état
    const [trips, setTrips] = useState(initialTrips || { data: [], current_page: 1, last_page: 1 });
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
                    setTrips(page.props.initialTrips || { data: [], current_page: 1, last_page: 1 }),
            }
        );
    };

    const handleDelete = (id) => {
        if (confirm("Voulez-vous vraiment supprimer ce trajet ? Cette opération est irréversible.")) {
            Inertia.delete(route("trips.destroy", id), { preserveState: true });
        }
    };

    const handlePage = (page) => {
        Inertia.get(route("trips.index"), 
            { per_page: perPage, bus_id: busId, route_id: routeId, page }, 
            {
                preserveState: true,
                onSuccess: (pageData) => setTrips(pageData.props.initialTrips || trips),
            }
        );
    };

    const formatDateFR = (date) =>
        date ? format(new Date(date), "dd MMM yyyy HH:mm", { locale: fr }) : "-";

    return (
        <GuestLayout>
            <Box sx={{ p: { xs: 1, md: 3 } }}>
                <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E0E0E0' }}>
                    <CardHeader
                        sx={{ bgcolor: '#F8F9FA', py: 2 }}
                        title={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <DirectionsBusIcon sx={{ color: indigo[900], fontSize: 30 }} />
                                <Typography variant="h5" fontWeight="800" color={indigo[900]}>
                                    Gestion des Voyages / Vols
                                </Typography>
                            </Stack>
                        }
                        action={
                            (userRole === "manageragence" || userRole === "manager" || userRole === "admin") && (
                                <Button
                                    variant="contained"
                                    disableElevation
                                    sx={{ bgcolor: indigo[900], mt: 1, '&:hover': { bgcolor: indigo[700] } }}
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
                        {/* ZONE DE FILTRAGE */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F4F7FA', border: 'none', borderRadius: 3 }}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                alignItems="center"
                            >
                                <TextField
                                    select
                                    label="Véhicule / Avion"
                                    value={busId}
                                    onChange={(e) => setBusId(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 200, bgcolor: 'white' }}
                                >
                                    <MenuItem value="">Tous les appareils</MenuItem>
                                    {buses.map((bus) => (
                                        <MenuItem key={bus.id} value={bus.id}>
                                            {bus.model || `Appareil #${bus.id}`}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    label="Itinéraire"
                                    value={routeId}
                                    onChange={(e) => setRouteId(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 200, bgcolor: 'white' }}
                                >
                                    <MenuItem value="">Toutes les routes</MenuItem>
                                    {routes.map((route) => (
                                        <MenuItem key={route.id} value={route.id}>
                                            {route.departureCity?.name || "Départ"} → {route.arrivalCity?.name || "Arrivée"}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    disableElevation
                                    startIcon={<SearchIcon />}
                                    onClick={filtrer}
                                    disabled={loading}
                                    sx={{ height: 40, px: 4 }}
                                >
                                    {loading ? <CircularProgress size={20} color="inherit" /> : "Filtrer"}
                                </Button>
                            </Stack>
                        </Paper>

                        {/* TABLEAU DES TRAJETS */}
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #EEE' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: indigo[900] }}>
                                    <TableRow>
                                        {["ID", "Itinéraire", "Appareil", "Départ",  "Actions"].map((col) => (
                                            <TableCell key={col} sx={{ color: "white", fontWeight: "bold", textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {trips?.data?.length > 0 ? (
                                        trips.data.map((trip) => (
                                            <TableRow key={trip.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#F9F9F9' } }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>#{trip.id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {trip.route?.departureCity?.name} → {trip.route?.arrivalCity?.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{trip.bus?.model || "-"}</TableCell>
                                                <TableCell>{formatDateFR(trip.departure_at)}</TableCell>
                            
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5}>
                                                        <Tooltip title="Détails du voyage">
                                                            <IconButton color="info" size="small" component={Link} href={route("trips.show", trip.id)}>
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        
                                                        <Tooltip title="Gérer les colis de ce voyage">
                                                            <IconButton color="warning" size="small" component={Link} href={route("parcels.byTrip", trip.id)}>
                                                                <LocalShippingIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {/* Actions Manager / Admin */}
                                                        {(userRole === "manageragence" || userRole === "manager" || userRole === "admin") && (
                                                            <>
                                                                <Tooltip title="Modifier">
                                                                    <IconButton color="primary" size="small" component={Link} href={route("trips.edit", trip.id)}>
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Supprimer">
                                                                    <IconButton color="error" size="small" onClick={() => handleDelete(trip.id)}>
                                                                        <DeleteIcon fontSize="small" />
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
                                            <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                                <Typography color="textSecondary">Aucun voyage planifié pour le moment.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* PAGINATION */}
                        <Box mt={4} display="flex" justifyContent="center">
                            <Pagination
                                count={trips.last_page || 1}
                                page={trips.current_page || 1}
                                onChange={(e, page) => handlePage(page)}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </GuestLayout>
    );
}