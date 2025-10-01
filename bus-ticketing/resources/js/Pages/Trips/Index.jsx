import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
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
   MenuItem  // <-- ajoute ceci
} from '@mui/material';
import GuestLayout from '@/Layouts/GuestLayout';

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

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Trajets</Typography>
          <Button variant="contained" color="primary" onClick={() => Inertia.get(route('trips.create'))}>
            Créer un trajet
          </Button>
        </Box>

        {/* Filtrage */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            label="Bus"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Tous les bus</MenuItem>
            {buses?.map(bus => (
              <MenuItem key={bus.id} value={bus.id}>{bus.model}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Route"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
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
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Bus</TableCell>
                <TableCell>Départ</TableCell>
                <TableCell>Arrivée</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Places disponibles</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {trips.data?.map(trip => (
                <TableRow key={trip.id}>
                  <TableCell>{trip.id}</TableCell>
                  <TableCell>
                    {trip.route?.departureCity?.name || '-'} → {trip.route?.arrivalCity?.name || '-'}
                  </TableCell>
                  <TableCell>{trip.bus?.model || '-'}</TableCell>
                  <TableCell>{trip.departure_at}</TableCell>
                  <TableCell>{trip.arrival_at}</TableCell>
                  <TableCell>{trip.base_price}</TableCell>
                  <TableCell>{trip.seats_available}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" href={trip.edit_url}>
                      Éditer
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
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
              onClick={() =>
                link.url &&
                Inertia.get(link.url, {}, {
                  onSuccess: page => setTrips(page.props.initialTrips || { data: [], links: [] }),
                })
              }
            >
              {typeof link.label === 'string' ? (
                <span dangerouslySetInnerHTML={{ __html: link.label }} />
              ) : (
                String(link.label)
              )}
            </Button>
          ))}
        </Stack>
      </Box>
    </GuestLayout>
  );
}
