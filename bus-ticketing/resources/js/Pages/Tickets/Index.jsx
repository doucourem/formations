import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function Index({ tickets }) {
  const [currentTickets, setCurrentTickets] = useState(tickets || { data: [], meta: {}, links: [] });

  const handlePage = (url) => {
    if (!url) return;
    Inertia.get(url, {}, {
      preserveState: true,
      onSuccess: page => setCurrentTickets(page.props.tickets || { data: [], meta: {}, links: [] }),
    });
  };

  const translateStatus = (status) => {
    switch(status) {
      case 'reserved': return 'Réservé';
      case 'paid': return 'Payé';
      case 'canceled': return 'Annulé';
      default: return status;
    }
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      Inertia.delete(route('ticket.destroy', id), {
        onSuccess: () => {
          setCurrentTickets(prev => ({
            ...prev,
            data: prev.data.filter(ticket => ticket.id !== id)
          }));
        }
      });
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Tickets</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => Inertia.get(route('ticket.create'))}
          >
            Créer un ticket
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#1976d2' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Voyage</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Siège</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(currentTickets.data || []).map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>
                    {ticket.trip?.route?.departure_city || '-'} → {ticket.trip?.route?.arrival_city || '-'}
                  </TableCell>
                  <TableCell>
                    {ticket.client_name}<br/>
                    {ticket.client_phone}<br/>
                    {ticket.client_email}
                  </TableCell>
                  <TableCell>{ticket.seat_number || '-'}</TableCell>
                  <TableCell>{ticket.price || '-'}</TableCell>
                  <TableCell>{translateStatus(ticket.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Voir le voyage">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => Inertia.get(route('trip.show', ticket.trip?.id))}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Éditer">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => Inertia.get(route('ticket.edit', ticket.id))}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Supprimer">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {(currentTickets.links || []).map((link, i) => (
            <Button
              key={i}
              disabled={!link.url}
              onClick={() => handlePage(link.url)}
              dangerouslySetInnerHTML={{ __html: link.label }}
              variant={link.active ? "contained" : "outlined"}
              size="small"
            />
          ))}
        </Box>
      </Box>
    </GuestLayout>
  );
}
