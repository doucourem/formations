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
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseData, setExpenseData] = useState({ type: "", amount: "", description: "" });

  const handleDeleteDelivery = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette livraison ?")) {
      Inertia.delete(route("deliveries.destroy", id));
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    Inertia.get(route("deliveries.index", { page: value }), {}, { preserveState: true });
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

    const routeName = selectedExpense
      ? `delivery-expenses.update`
      : `delivery-expenses.store`;

    const method = selectedExpense ? "put" : "post";
    const payload = selectedExpense
      ? { ...expenseData, _method: "put" }
      : { ...expenseData, delivery_id: selectedDelivery.id };

    Inertia[method](route(routeName, selectedExpense?.id || undefined), payload, {
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
          <Box mb={2}>
            <TextField
              label="Rechercher..."
              variant="outlined"
              size="small"
              fullWidth
              onChange={(e) =>
                Inertia.get(route("deliveries.index"), { search: e.target.value }, { preserveState: true })
              }
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "ID",
                    "Véhicule",
                    "Chauffeur",
                    "Produit",
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
                      <TableCell>{d.id}</TableCell>
                      <TableCell>{d.bus.registration_number}</TableCell>
                      <TableCell>{d.driver.first_name}</TableCell>
                      <TableCell>{d.product_name}</TableCell>
                      <TableCell>{d.price}</TableCell>
                      <TableCell>{new Date(d.departure_at).toLocaleString()}</TableCell>
                      <TableCell>{d.arrival_at ? new Date(d.arrival_at).toLocaleString() : "-"}</TableCell>
                      <TableCell>
                        {d.status === "pending" && "🟡 En attente"}
                        {d.status === "in_transit" && "🟠 En transit"}
                        {d.status === "delivered" && "🟢 Livré"}
                      </TableCell>

                      {/* ✅ Dépenses */}
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
                                  {e.type} : {e.amount} CFA
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
                                        Inertia.delete(route("vehicle_rental_expenses.destroy", e.id));
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

                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenExpenseModal(d)}
                          >
                            + Ajouter
                          </Button>
                        </Stack>
                      </TableCell>

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
                    <TableCell colSpan={12} align="center">
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
        <MenuItem value="">Sélectionner</MenuItem>
        <MenuItem value="chauffeur">Chauffeur</MenuItem>
        <MenuItem value="fuel">Carburant</MenuItem>
        <MenuItem value="toll">Péages</MenuItem>
        <MenuItem value="meal">Restauration</MenuItem>
        <MenuItem value="maintenance">Entretien</MenuItem>
        <MenuItem value="other">Autres</MenuItem>
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
