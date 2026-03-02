import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function DeliveryIndex({ deliveries }) {
  const [page, setPage] = useState(deliveries.current_page || 1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseData, setExpenseData] = useState({ type: "", amount: "", description: "" });

  const TYPE_LABELS = {
    chauffeur: "Chauffeur",
    carburant: "Carburant",
    peages: "Péages",
    restauration: "Restauration",
    entretien: "Entretien",
    autres: "Autres",
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const handleDeleteDelivery = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette livraison ?")) {
      Inertia.delete(route("deliveries.destroy", id));
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    Inertia.get(
      route("deliveries.index"),
      { search, startDate, endDate, page: value },
      { preserveState: true }
    );
  };

  const applyFilter = () => {
    setPage(1);
    Inertia.get(
      route("deliveries.index"),
      { search, startDate, endDate, page: 1 },
      { preserveState: true, replace: true }
    );
  };

  // 🚀 Modal dépenses
  const handleOpenExpenseModal = (delivery, expense = null) => {
    setSelectedDelivery(delivery);
    setSelectedExpense(expense);
    setExpenseData(expense || { type: "", amount: "", description: "" });
    setOpenExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setSelectedDelivery(null);
    setSelectedExpense(null);
    setExpenseData({ type: "", amount: "", description: "" });
    setOpenExpenseModal(false);
  };

  const handleSaveExpense = () => {
    if (!selectedDelivery) return;

    const method = selectedExpense ? "put" : "post";

    const routeName = selectedExpense
      ? "delivery-expenses.update"
      : "delivery-expenses.store";

    const routeParams = selectedExpense
      ? { delivery: selectedDelivery.id, expense: selectedExpense.id }
      : { delivery: selectedDelivery.id };

    const payload = selectedExpense
      ? { ...expenseData, _method: "put" }
      : { ...expenseData };

    Inertia[method](route(routeName, routeParams), payload, {
      onSuccess: () => handleCloseExpenseModal(),
    });
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Liste des livraisons 🚛</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route("deliveries.create"))}
            >
              Ajouter
            </Button>
          }
        />
        <CardContent>
          {/* Filtres */}
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Rechercher..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <TextField
              label="Date début"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Date fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Button variant="contained" onClick={applyFilter}>
              Filtrer
            </Button>
          </Box>

          {/* Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Véhicule",
                    "Chauffeur",
                    "Prix (CFA)",
                    "Départ",
                    "Arrivée",
                    "Statut",
                    "Dépenses",
                    "Actions",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      sx={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold" }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {deliveries.data.length > 0 ? (
                  deliveries.data.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.bus.registration_number}</TableCell>
                      <TableCell>{d.driver.first_name}</TableCell>
                      <TableCell>{d.price}</TableCell>
                      <TableCell>{formatDateTime(d.departure_at)}</TableCell>
                      <TableCell>{formatDateTime(d.arrival_at)}</TableCell>
                      <TableCell>
                        {d.status === "pending" && "🟡 En attente"}
                        {d.status === "in_transit" && "🟠 En transit"}
                        {d.status === "delivered" && "🟢 Livré"}
                      </TableCell>

                      {/* Dépenses */}
                      <TableCell>
                        <Stack spacing={0.5}>
                          {d.expenses.length > 0 ? (
                            d.expenses.map((e) => (
                              <Box
                                key={e.id}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="body2">
                                  {TYPE_LABELS[e.type] || e.type} : {e.amount} CFA
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenExpenseModal(d, e)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      if (confirm("Supprimer cette dépense ?")) {
                                        Inertia.delete(route("delivery-expenses.destroy", e.id));
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Aucune dépense
                            </Typography>
                          )}
                          <Button size="small" variant="outlined" onClick={() => handleOpenExpenseModal(d)}>
                            + Ajouter
                          </Button>
                        </Stack>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton color="primary" onClick={() => Inertia.get(route("deliveries.show", d.id))}>
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton color="warning" onClick={() => Inertia.get(route("deliveries.edit", d.id))}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteDelivery(d.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucune livraison enregistrée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {deliveries.last_page > 1 && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination count={deliveries.last_page} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal Dépenses */}
      <Dialog open={openExpenseModal} onClose={handleCloseExpenseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedExpense ? "Modifier une dépense" : `Ajouter une dépense pour la livraison #${selectedDelivery?.id}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Type de dépense"
              value={expenseData.type}
              onChange={(e) => setExpenseData({ ...expenseData, type: e.target.value })}
              fullWidth
            >
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Montant"
              type="number"
              value={expenseData.amount}
              onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
              fullWidth
            />

            <TextField
              label="Description"
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExpenseModal} color="secondary">Annuler</Button>
          <Button onClick={handleSaveExpense} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}