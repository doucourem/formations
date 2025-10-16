import React, { useState, useMemo } from 'react'; 
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import DataTablePro from '@/Components/DataTablePro';

export default function TicketsIndex({ tickets }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const [currentTickets, setCurrentTickets] = useState(tickets || { data: [], links: [], current_page: 1 });
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // 🔹 Colonnes du tableau
  const columns = [
    { field: 'id', label: 'ID', minWidth: 50 },
    { field: 'trip', label: 'Voyage', render: (_, row) => `${row.trip?.route?.departure_city || '-'} → ${row.trip?.route?.arrival_city || '-'}`, minWidth: 150 },
    { field: 'client', label: 'Client', render: (_, row) => row.client_name, minWidth: 120 },
    { field: 'seat_number', label: 'Siège', hideOnXs: true, minWidth: 60 },
    { field: 'price', label: 'Prix', render: (_, row) => `${row.price || '-'}`, hideOnXs: true, minWidth: 80 },
    { field: 'status', label: 'Statut', render: (_, row) => (
        <Chip
          label={row.status === 'reserved' ? 'Réservé' : row.status === 'paid' ? 'Payé' : 'Annulé'}
          color={row.status === 'paid' ? 'success' : row.status === 'cancelled' ? 'error' : 'warning'}
          size="small"
        />
      ), minWidth: 100
    },
  ];

  // 🔹 Actions sur chaque ligne
  // 🔹 Actions sur chaque ligne
const actions = [
  { label: 'Voir', icon: <VisibilityIcon />, color: 'info', onClick: row => Inertia.get(route('ticket.show', row.id)) },
  // Seul l'agent propriétaire du ticket peut modifier ou supprimer
  ...(user.role === 'agent'
    ? [
        {
          label: 'Éditer',
          icon: <EditIcon />,
          color: 'primary',
          onClick: row =>  Inertia.get(route('ticket.edit', row.id)),
        },
        {
          label: 'Supprimer',
          icon: <DeleteIcon />,
          color: 'error',
          onClick: row => handleDelete(row.id),
        },
      ]
    : []),
];


  // 🔹 Pagination sécurisée
  const filteredLinks = useMemo(() => {
    const linksArray = Array.isArray(currentTickets.links) ? currentTickets.links : [];
    const maxVisiblePages = 5;
    const currentPage = currentTickets.current_page || 1;

    return linksArray.filter(link => {
      if (link.label === '&laquo;' || link.label === '&raquo;') return true;
      const pageNumber = parseInt(link.label.replace(/[^0-9]/g, ''), 10);
      const start = Math.max(currentPage - 2, 1);
      const end = start + maxVisiblePages - 1;
      return pageNumber >= start && pageNumber <= end;
    });
  }, [currentTickets.links, currentTickets.current_page]);

  return (
    <GuestLayout>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4">Tickets</Typography>
        {user.role === 'agent' && (
          <Button variant="contained" color="primary" onClick={() => Inertia.get(route('ticket.create'))}>
            Ajouter un ticket
          </Button>
        )}
      </Stack>

      {/* FILTRES */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems="center">
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

      {/* TABLEAU */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <DataTablePro
          columns={columns}
          data={filteredTickets}
          actions={actions}
          links={filteredLinks}
          onPageChange={url =>
            Inertia.get(url, {}, {
              preserveState: true,
              onSuccess: page => setCurrentTickets(page.props.tickets)
            })
          }
        />
      </Box>
    </GuestLayout>
  );
}
