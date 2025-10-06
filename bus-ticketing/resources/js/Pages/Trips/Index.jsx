import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/inertia-react';
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
} from '@mui/material';
import GuestLayout from '@/Layouts/GuestLayout';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Index({ initialTrips, initialFilters, buses = [], routes = [] }) {
  const [trips, setTrips] = useState(initialTrips || { data: [], links: [] });
  const [perPage, setPerPage] = useState(initialFilters?.per_page || 20);
  const [busId, setBusId] = useState(initialFilters?.bus_id || '');
  const [routeId, setRouteId] = useState(initialFilters?.route_id || '');

  const filtrer = () => {
    Inertia.get(
      route('trips.index'),
      { per_page: perPage, bus_id: busId, route_id: routeId },
      {
        preserveState: true,
        onSuccess: page => setTrips(page.props.initialTrips || { data: [], links: [] }),
      }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce trajet ?")) {
      Inertia.delete(route('trips.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (url) => {
    if (!url) return;
    Inertia.get(url, {}, {
      preserveState: true,
      onSuccess: page => setTrips(page.props.initialTrips || { data: [], links: [] }),
    });
  };

  const formatDateFR = (date) => {
    if (!date) return '-';
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        {/* En-tête */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Trajets</Typography>
          <Button variant="contained" color="primary" onClick={() => Inertia.get(route('trips.create'))}>
            Créer un trajet
          </Button>
        </Box>

        {/* Filtrage */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField select label="Bus" value={busId} onChange={e => setBusId(e.target.value)} size="small" sx={{ minWidth: 150 }}>
            <MenuItem value="">Tous les bus</MenuItem>
            {buses?.map(bus => <MenuItem key={bus.id} value={bus.id}>{bus.model}</MenuItem>)}
          </TextField>

          <TextField select label="Route" value={routeId} onChange={e => setRouteId(e.target.value)} size="small" sx={{ minWidth: 150 }}>
            <MenuItem value="">Toutes les routes</MenuItem>
            {routes?.map(route => (
              <MenuItem key={route.id} value={route.id}>
                {route.departureCity?.name || '-'} → {route.arrivalCity?.name || '-'}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Par page"
            type="number"
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
            size="small"
            sx={{ width: 100 }}
            inputProps={{ min: 1 }}
          />

          <Button variant="contained" color="secondary" onClick={filtrer}>
            Filtrer
          </Button>
        </Stack>

        {/* Tableau */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#1976d2' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff' }}>ID</TableCell>
                <TableCell sx={{ color: '#fff' }}>Route</TableCell>
                <TableCell sx={{ color: '#fff' }}>Bus</TableCell>
                <TableCell sx={{ color: '#fff' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} /> Départ
                </TableCell>
                <TableCell sx={{ color: '#fff' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} /> Arrivée
                </TableCell>
                <TableCell sx={{ color: '#fff' }}>Prix</TableCell>
                <TableCell sx={{ color: '#fff' }}>Places dispo</TableCell>
                <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {trips.data.length > 0 ? trips.data.map(trip => (
                <TableRow key={trip.id}>
                  <TableCell>{trip.id}</TableCell>
                  <TableCell>{trip.route?.departureCity?.name || '-'} → {trip.route?.arrivalCity?.name || '-'}</TableCell>
                  <TableCell>{trip.bus?.model || '-'}</TableCell>
                  <TableCell>{formatDateFR(trip.departure_at)}</TableCell>
                  <TableCell>{formatDateFR(trip.arrival_at)}</TableCell>
                  <TableCell>{trip.base_price} FCFA</TableCell>
                  <TableCell>{trip.seats_available}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {/* Voir détails */}
                      <IconButton color="info" size="small" component={Link} href={route('trips.show', trip.id)}>
                        <VisibilityIcon />
                      </IconButton>

                      {/* Modifier */}
                      <IconButton color="primary" size="small" component={Link} href={trip.edit_url}>
                        <EditIcon />
                      </IconButton>

                      {/* Supprimer */}
                      <IconButton color="error" size="small" onClick={() => handleDelete(trip.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">Aucun trajet trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {trips.links?.map((link, i) => (
            <Button
              key={i}
              disabled={!link.url}
              variant={link.active ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePage(link.url)}
            >
              {link.label.replace(/<[^>]*>?/gm, '')}
            </Button>
          ))}
        </Stack>
      </Box>
    </GuestLayout>
  );
}
