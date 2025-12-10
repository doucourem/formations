import React, { useState, useMemo } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';

import {
  Box,
  Button,
  Chip,
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
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  PaginationItem,
  Tooltip
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import GuestLayout from "@/Layouts/GuestLayout";
import BaggageForm from "./BaggageForm";

export default function TicketsIndex({ tickets }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      Inertia.delete(route('ticket.destroy', id));
    }
  };

  // 🔍 Filtrage sur tickets.data (pagination Laravel)
  const filteredTickets = useMemo(() => {
    return tickets.data.filter(ticket => {
      const matchesStatus = filterStatus ? ticket.status === filterStatus : true;
      const matchesSearch = searchQuery
        ? ticket.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [tickets, filterStatus, searchQuery]);

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📦 Liste des Tickets</Typography>}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => Inertia.get(route('ticket.create'))}
              >
                Créer un ticket
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => Inertia.get(route('tickets.daily-summary'))}
              >
                Résumé par jour
              </Button>
            </Stack>
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

                    <TableCell>
                      {ticket.route_text
                        ? `${ticket.route_text}`
                        : "—"}
                    </TableCell>

                    <TableCell>
                      {ticket.price?.toLocaleString() || "—"} FCFA
                    </TableCell>

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
  <Stack direction="row" spacing={1} flexWrap="wrap">
    {ticket.baggages?.length > 0 ? (
      ticket.baggages.map((bag, idx) => (
        <Chip
          key={idx}
          label={`📦 ${bag.weight} kg | ${bag.price?.toLocaleString("fr-FR")} FCFA`}
          color="primary"
          size="small"
        />
      ))
    ) : (
      <Typography variant="body2" color="text.secondary">Aucun bagage</Typography>
    )}

    {/* Bouton d'ajout */}
    <Tooltip title="Ajouter un bagage">
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleOpenBaggage(ticket)}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  </Stack>
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
              </TableBody>
            </Table>
          </TableContainer>

          {/* 📌 PAGINATION */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={tickets.last_page}
              page={tickets.current_page}
              color="primary"
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  onClick={() => {
                    if (item.page !== tickets.current_page) {
                      Inertia.get(route('ticket.index'), {
                        page: item.page,
                        search: searchQuery,
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
        <DialogContent>
          {selectedTicket && <BaggageForm ticket={selectedTicket} onSuccess={handleCloseBaggage} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBaggage} color="secondary">Annuler</Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
