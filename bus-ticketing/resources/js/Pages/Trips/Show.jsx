import React from 'react';
import { Box, Typography, Paper, Divider, Stack, Button } from '@mui/material';
import { Inertia } from '@inertiajs/inertia';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GuestLayout from '@/Layouts/GuestLayout';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Show({ trip }) {
  if (!trip) {
    return <Typography>Chargement du trajet...</Typography>;
  }

  const formatDateFR = (date) => {
    if (!date) return '-';
    return format(new Date(date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h4">Détails du trajet #{trip.id}</Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => Inertia.get(route('trips.index'))}
          >
            Retour à la liste
          </Button>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <RouteIcon sx={{ mr: 1, color: 'primary.main' }} />
              Route : {trip.route?.departureCity?.name || '-'} → {trip.route?.arrivalCity?.name || '-'}
            </Typography>

            <Divider />

            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <DirectionsBusIcon sx={{ mr: 1, color: 'primary.main' }} />
              Bus : {trip.bus?.model || '-'} ({trip.bus?.registration_number || 'N/A'})
            </Typography>

            <Divider />

            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
              Départ : {formatDateFR(trip.departure_at)}
            </Typography>

            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
              Arrivée : {formatDateFR(trip.arrival_at)}
            </Typography>

            <Divider />

            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <MonetizationOnIcon sx={{ mr: 1, color: 'green' }} />
              Prix de base : <strong>{trip.base_price} FCFA</strong>
            </Typography>

            <Typography variant="h6">
              Places disponibles : <strong>{trip.seats_available}</strong>
            </Typography>
          </Stack>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => Inertia.get(route('trips.edit', trip.id))}
          >
            Modifier le trajet
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
