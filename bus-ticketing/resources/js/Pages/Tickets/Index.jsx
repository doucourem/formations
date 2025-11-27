import React, { useState, useMemo } from 'react'; 
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';

import {
  Box,
  Button,
  Chip,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Card,
  CardHeader
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import GuestLayout from "@/Layouts/GuestLayout";

export default function TicketsIndex({ tickets }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const [currentTickets, setCurrentTickets] = useState(
    tickets || { data: [], links: [], current_page: 1 }
  );

  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      Inertia.delete(route('ticket.destroy', id), {
        onSuccess: () => {
          setCurrentTickets(prev => ({
            ...prev,
            data: prev.data.filter(t => t.id !== id)
          }));
        }
      });
    }
  };

  // 🔹 Filtrage
  const filteredTickets = useMemo(() => {
    const ticketsArray = Array.isArray(currentTickets.data) ? currentTickets.data : [];
    return ticketsArray.filter(ticket => {
      const matchesStatus = filterStatus ? ticket.status === filterStatus : true;
      const matchesSearch = searchQuery
        ? ticket.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [currentTickets.data, filterStatus, searchQuery]);

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredTickets.length / perPage);
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📦 Liste des Tickets</Typography>}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route('ticket.create'))}
            >
              Créer un ticket
            </Button>
          }
        />
        <Box mt={2}>
          {/* 🔍 Filtres */}
          <Stack direction="row" spacing={2} mb={3}>
            <TextField
              label="Recherche client"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <TextField
              label="Statut"
              select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ width: 200 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="canceled">Annulé</MenuItem>
            </TextField>
          </Stack>

          {/* 🧾 Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Voyage</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.client_name}</TableCell>
                    <TableCell>
                      {ticket.trip?.route
  ? `${ticket.trip.route.departure_city} → ${ticket.trip.route.arrival_city}`
  : "—"}
                    </TableCell>
                    <TableCell>{ticket.price?.toLocaleString() || "—"} FCFA</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          ticket.status === "paid"
                            ? "Payé"
                            : ticket.status === "pending"
                            ? "En attente"
                            : "Annulé"
                        }
                        color={
                          ticket.status === "paid"
                            ? "success"
                            : ticket.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => Inertia.get(route("ticket.show", ticket.id))}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="warning" onClick={() => Inertia.get(route("ticket.edit", ticket.id))}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(ticket.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun ticket trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 📄 Pagination */}
          <Stack alignItems="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Stack>
        </Box>
      </Card>
    </GuestLayout>
  );
}
