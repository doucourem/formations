import React, { useState, useMemo } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';

export default function TicketsIndex({ tickets }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const [currentTickets, setCurrentTickets] = useState(tickets || { data: [], links: [], current_page: 1 });
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔹 Supprimer un ticket
  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      Inertia.delete(route('ticket.destroy', id), {
        onSuccess: () => {
          const dataArray = Array.isArray(currentTickets.data) ? currentTickets.data : [];
          setCurrentTickets(prev => ({
            ...prev,
            data: dataArray.filter(t => t.id !== id)
          }));
        }
      });
    }
  };

  // 🔹 Filtrage des tickets
  const filteredTickets = useMemo(() => {
    const ticketsArray = Array.isArray(currentTickets.data) ? currentTickets.data : [];
    return ticketsArray.filter(ticket => {
      const matchesStatus = filterStatus ? ticket.status === filterStatus : true;
      const matchesSearch = searchQuery ? ticket.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return matchesStatus && matchesSearch;
    });
  }, [currentTickets.data, filterStatus, searchQuery]);

  return (
    <GuestLayout>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4">Tickets</Typography>
        {user.role === 'agent' && (
          <Button variant="contained" color="primary" onClick={() => Inertia.get(route('ticket.create'))}>
            Ajouter un ticket
          </Button>
        )}
      </Stack>

      {/* FILTRES */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          label="Rechercher par client"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 250 } }}
        />
        <TextField
          label="Filtrer par statut"
          select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="reserved">Réservé</MenuItem>
          <MenuItem value="paid">Payé</MenuItem>
          <MenuItem value="cancelled">Annulé</MenuItem>
        </TextField>
      </Stack>

      {/* LISTE DES TICKETS EN CARDS */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {filteredTickets.map(ticket => (
          <Card key={ticket.id} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {ticket.client_name || 'Client inconnu'}
              </Typography>
              <Typography variant="body2">
                Voyage: {ticket.trip?.route?.departure_city || '-'} → {ticket.trip?.route?.arrival_city || '-'}
              </Typography>
              <Typography variant="body2">
                Siège: {ticket.seat_number || '-'} | Prix: {ticket.price || '-'} €
              </Typography>
              <Chip
                label={ticket.status === 'reserved' ? 'Réservé' : ticket.status === 'paid' ? 'Payé' : 'Annulé'}
                color={ticket.status === 'paid' ? 'success' : ticket.status === 'cancelled' ? 'error' : 'warning'}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
            <CardActions>
              <Button size="small" startIcon={<Visibility />} onClick={() => Inertia.get(route('ticket.show', ticket.id))}>
                Voir
              </Button>
              {user.role === 'agent' && (
                <>
                  <Button size="small" startIcon={<Edit />} onClick={() => Inertia.get(route('ticket.edit', ticket.id))}>
                    Éditer
                  </Button>
                  <Button size="small" startIcon={<Delete />} color="error" onClick={() => handleDelete(ticket.id)}>
                    Supprimer
                  </Button>
                </>
              )}
            </CardActions>
          </Card>
        ))}
      </Box>
    </GuestLayout>
  );
}
