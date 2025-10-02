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
} from '@mui/material';

export default function Index({ initialTickets }) {
  const [tickets, setTickets] = useState(initialTickets || { data: [], links: [] });

  const handlePage = (url) => {
    if (!url) return;
    Inertia.get(url, {}, {
      preserveState: true,
      onSuccess: page => setTickets(page.props.tickets || { data: [], links: [] }),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
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

        <TableContainer component={Paper}>
          <Table>
           <TableHead sx={{ bgcolor: '#1976d2' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Voyage</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Siège</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(tickets.data || []).map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>
                    {ticket.trip?.route?.departureCity?.name || '-'} → {ticket.trip?.route?.arrivalCity?.name || '-'}
                  </TableCell>
                  <TableCell>{ticket.user?.name || '-'}</TableCell>
                  <TableCell>{ticket.seat_number || '-'}</TableCell>
                  <TableCell>{ticket.price || '-'}</TableCell>
                  <TableCell>{ticket.status || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={route('tickets.edit', ticket.id)}
                    >
                      Éditer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {(tickets.links || []).map((link, i) => (
            <Button
              key={i}
              disabled={!link.url}
              onClick={() => handlePage(link.url)}
              dangerouslySetInnerHTML={{ __html: link.label }}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Box>
    </GuestLayout>
  );
}
