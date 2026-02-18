import React, { useState, useMemo } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import {
  Box, Button, Chip, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField,
  MenuItem, IconButton, Typography, Card, CardHeader,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Pagination, PaginationItem, Tooltip
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import GuestLayout from "@/Layouts/GuestLayout";
import BaggageForm from "./BaggageForm";

export default function TicketsIndex({ tickets, routes }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [searchRoute, setSearchRoute] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openBaggageModal, setOpenBaggageModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleOpenBaggage = (ticket) => {
    setSelectedTicket(ticket);
    setOpenBaggageModal(true);
  };
  const handleCloseBaggage = () => {
    setSelectedTicket(null);
    setOpenBaggageModal(false);
  };
  const handleDelete = (id) => {
    if(confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      Inertia.delete(route('ticket.destroy', id));
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.data.filter(ticket => {
      const matchesClient = searchQuery
        ? ticket.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesRoute = searchRoute ? ticket.route_id == searchRoute : true;
      const matchesDate =
        (!dateFrom || new Date(ticket.travel_date) >= new Date(dateFrom)) &&
        (!dateTo || new Date(ticket.travel_date) <= new Date(dateTo));
      const matchesStatus = filterStatus ? ticket.status === filterStatus : true;
      return matchesClient && matchesRoute && matchesDate && matchesStatus;
    });
  }, [tickets, searchQuery, searchRoute, dateFrom, dateTo, filterStatus]);

  const applyFilters = () => {
    Inertia.get(route('ticket.index'), {
      search: searchQuery,
      route: searchRoute,
      date_from: dateFrom,
      date_to: dateTo,
      status: filterStatus,
    }, { preserveState: true, replace: true });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSearchRoute('');
    setDateFrom('');
    setDateTo('');
    setFilterStatus('');
    Inertia.get(route('ticket.index'), {}, { preserveState: true });
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📦 Liste des Tickets</Typography>}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => Inertia.get(route('ticket.create'))}>Créer un ticket</Button>
              <Button variant="outlined" color="secondary" onClick={() => Inertia.get(route('tickets.daily-summary'))}>Résumé par jour</Button>
              <Button variant="contained" color="primary" onClick={() => window.location.href = route('ticket.export')}>Exporter Excel</Button>
            </Stack>
          }
        />

        {/* 🔍 Filtres */}
        <Box mt={2}>
          <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
            <TextField label="Recherche client" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

            <TextField select label="Voyage" value={searchRoute} onChange={e => setSearchRoute(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Tous</MenuItem>
              {routes.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.departureCity} → {r.arrivalCity}</MenuItem>
              ))}
            </TextField>

            <TextField label="Date début" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Date fin" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />

            <TextField label="Statut" select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ width: 150 }}>
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="canceled">Annulé</MenuItem>
            </TextField>

            <Button variant="outlined" color="primary" onClick={applyFilters}>Appliquer</Button>
            <Button variant="text" color="secondary" onClick={resetFilters}>Réinitialiser</Button>
          </Stack>

          {/* 🧾 Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1565c0" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Client</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Voyage</TableCell>
                   <TableCell sx={{ color: "white", fontWeight: "bold" }}>Prix</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Statut</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Bagages</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.client_name}</TableCell>
                    <TableCell>{ticket.route_text || "—"}</TableCell>
                    <TableCell>{ticket.price?.toLocaleString() || "—"} FCFA</TableCell>
                    
                    <TableCell>
                      <Chip
                        label={ticket.status === "paid" ? "Payé" : ticket.status === "reserved" ? "Réservé" : "Annulé"}
                        color={ticket.status === "paid" ? "success" : ticket.status === "reserved" ? "warning" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {ticket.baggages?.length > 0 ? ticket.baggages.map((b, idx) => <Chip key={idx} label={`📦 ${b.weight} kg`} size="small" color="primary" />) : <Typography variant="body2" color="text.secondary">Aucun bagage</Typography>}
                        <Tooltip title="Ajouter un bagage">
                          <IconButton size="small" color="primary" onClick={() => handleOpenBaggage(ticket)}><AddIcon /></IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => Inertia.get(route("ticket.show", ticket.id))}><VisibilityIcon /></IconButton>
                      <IconButton color="warning" onClick={() => Inertia.get(route("ticket.edit", ticket.id))}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(ticket.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 📌 Pagination */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={tickets.last_page}
              page={tickets.current_page}
              color="primary"
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  onClick={() => {
                    if(item.page !== tickets.current_page){
                      Inertia.get(route('ticket.index'), {
                        page: item.page,
                        search: searchQuery,
                        route: searchRoute,
                        date_from: dateFrom,
                        date_to: dateTo,
                        status: filterStatus
                      });
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Card>

      {/* Modal Bagage */}
      <Dialog open={openBaggageModal} onClose={handleCloseBaggage} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un bagage pour le ticket #{selectedTicket?.id}</DialogTitle>
        <DialogContent>{selectedTicket && <BaggageForm ticket={selectedTicket} onSuccess={handleCloseBaggage} />}</DialogContent>
        <DialogActions><Button onClick={handleCloseBaggage} color="secondary">Annuler</Button></DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
