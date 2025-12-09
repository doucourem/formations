import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
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
  Stack,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Typography,
  Card,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import { Visibility, Edit, Delete, Add } from "@mui/icons-material";
import GuestLayout from "@/Layouts/GuestLayout";
import BaggageForm from "./BaggageForm";

// 🔹 Utilitaire pour formater le prix
const formatPrice = (value) => (value ? value.toLocaleString("fr-FR") + " FCFA" : "—");

// 🔹 Composant pour chaque ligne de ticket
function TicketRow({ ticket, onOpenBaggage, onDelete }) {
  return (
    <TableRow>
      <TableCell>{ticket.id}</TableCell>
      <TableCell>{ticket.client_name || "—"}</TableCell>
      <TableCell>
        {ticket.trip?.route
          ? `${ticket.trip.route.departure_city || "—"} → ${ticket.trip.route.arrival_city || "—"}`
          : "—"}
      </TableCell>
      <TableCell>{formatPrice(ticket.price)}</TableCell>
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
        <Stack direction="row" spacing={1}>
          {Array.isArray(ticket.baggages) && ticket.baggages.length > 0 ? (
            ticket.baggages.map((bag, idx) => (
              <Chip
                key={idx}
                label={`${bag.weight || 0}kg - ${bag.price?.toLocaleString("fr-FR") || 0} FCFA`}
                color="primary"
                size="small"
              />
            ))
          ) : (
            <Chip label="—" size="small" />
          )}
          <IconButton size="small" color="primary" onClick={() => onOpenBaggage(ticket)}>
            <Add />
          </IconButton>
        </Stack>
      </TableCell>
      <TableCell>
        <IconButton color="primary" onClick={() => Inertia.get(route("ticket.show", ticket.id))}>
          <Visibility />
        </IconButton>
        <IconButton color="warning" onClick={() => Inertia.get(route("ticket.edit", ticket.id))}>
          <Edit />
        </IconButton>
        <IconButton color="error" onClick={() => onDelete(ticket.id)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default function TicketsIndex({ tickets, filters = {} }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  const [filterStatus, setFilterStatus] = useState(filters.status || "");
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [openBaggageModal, setOpenBaggageModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const perPage = filters.per_page || 10;

  // 🔹 Charger les tickets à chaque changement de filtre ou recherche
  useEffect(() => {
    Inertia.get(
      route("ticket.index"),
      { page: 1, per_page: perPage, search: searchQuery, status: filterStatus },
      { preserveState: true }
    );
  }, [searchQuery, filterStatus]);

  const handleOpenBaggage = (ticket) => {
    setSelectedTicket(ticket);
    setOpenBaggageModal(true);
  };

  const handleCloseBaggage = () => {
    setSelectedTicket(null);
    setOpenBaggageModal(false);
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce ticket ?")) {
      Inertia.delete(route("ticket.destroy", id));
    }
  };

  const handleStatusChange = (e) => setFilterStatus(e.target.value);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handlePageChange = (e, page) => {
    Inertia.get(
      route("ticket.index"),
      { page, per_page: perPage, search: searchQuery, status: filterStatus },
      { preserveState: true }
    );
  };

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
                startIcon={<Add />}
                onClick={() => Inertia.get(route("ticket.create"))}
              >
                Créer un ticket
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => Inertia.get(route("tickets.daily-summary"))}
              >
                Résumé par jour
              </Button>
            </Stack>
          }
        />

        <Box mt={2}>
          {/* Filtres */}
          <Stack direction="row" spacing={2} mb={3}>
            <TextField
              label="Recherche client"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <TextField
              label="Statut"
              select
              value={filterStatus}
              onChange={handleStatusChange}
              sx={{ width: 200 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="canceled">Annulé</MenuItem>
            </TextField>
          </Stack>

          {/* Tableau */}
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
                {tickets.data?.length > 0 ? (
                  tickets.data.map((ticket) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onOpenBaggage={handleOpenBaggage}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun ticket trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={tickets.last_page || 1}
              page={tickets.current_page || 1}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
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
          <Button onClick={handleCloseBaggage} color="secondary">
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
