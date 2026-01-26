import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Stack,
  TextField,
  Pagination,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

export default function VehicleRentalIndex({ rentals }) {
  const [page, setPage] = useState(rentals.current_page || 1);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseData, setExpenseData] = useState({ type: "", amount: "", description: "" });

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette location ?")) {
      Inertia.delete(route("vehicle-rentals.destroy", id));
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    Inertia.get(
      route("vehicle-rentals.index", { page: value }),
      {},
      { preserveState: true }
    );
  };

  const handleSearch = (event) => {
    Inertia.get(
      route("vehicle-rentals.index"),
      { search: event.target.value },
      { preserveState: true }
    );
  };

  const translateStatus = (status) => {
    switch (status) {
      case "active": return "Active";
      case "completed": return "Terminée";
      case "cancelled": return "Annulée";
      default: return status;
    }
  };

  // Modal dépenses
  const handleOpenExpenseModal = (rental, expense = null) => {
    setSelectedRental(rental);
    setSelectedExpense(expense);
    setExpenseData(expense || { type: "", amount: "", description: "" });
    setOpenExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setSelectedRental(null);
    setSelectedExpense(null);
    setExpenseData({ type: "", amount: "", description: "" });
    setOpenExpenseModal(false);
  };

  const handleSaveExpense = () => {
    if (!selectedRental) return;

    const routeName = selectedExpense
      ? `vehicle_rental_expenses.update`
      : `vehicle_rental_expenses.store`;

    const method = selectedExpense ? "put" : "post";
    const payload = selectedExpense
      ? { ...expenseData, _method: "put" }
      : { ...expenseData, vehicle_rental_id: selectedRental.id };

    Inertia[method](route(routeName, selectedExpense?.id || undefined), payload, {
      onSuccess: () => handleCloseExpenseModal(),
    });
  };
const TYPE_LABELS = {
  chauffeur: "Chauffeur",
  carburant: "Carburant",
  peages: "Péages",
  restauration: "Restauration",
  entretien: "Entretien",
  autres: "Autres",
};
  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Locations de Véhicules 🚗</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route("vehicle-rentals.create"))}
            >
              Nouvelle Location
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
              onChange={handleSearch}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                   
                    "Véhicule",
                    "Client",
                    "Début",
                    "Fin",
                    "Prix",
                    "Statut",
                    "Dépenses",
                    "Actions",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {rentals.data.length > 0 ? (
                  rentals.data.map((rental) => (
                    <TableRow key={rental.id}>
                     
                      <TableCell>{rental.bus?.registration_number || "-"}</TableCell>
                      <TableCell>{rental.client_name}</TableCell>
                      <TableCell>{new Date(rental.rental_start).toLocaleString()}</TableCell>
                      <TableCell>{new Date(rental.rental_end).toLocaleString()}</TableCell>
                      <TableCell>{rental.rental_price}</TableCell>
                      <TableCell>{translateStatus(rental.status)}</TableCell>

                      {/* Colonne Dépenses */}
                      <TableCell>
                        <Stack spacing={0.5}>
                          {rental.expenses?.length > 0 ? (
                            rental.expenses.map((e) => (
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
                                    onClick={() => handleOpenExpenseModal(rental, e)}
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
                            onClick={() => handleOpenExpenseModal(rental)}
                          >
                            + Ajouter
                          </Button>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton color="primary" onClick={() => Inertia.get(route("vehicle-rentals.show", rental.id))}>
                            <VisibilityIcon />
                          </IconButton>
                         <IconButton color="warning" onClick={() => Inertia.get(route("vehicle-rentals.edit", { vehicle_rental: rental.id }))}>
  <EditIcon />
</IconButton>

                          <IconButton color="error" onClick={() => handleDelete(rental.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Aucune location enregistrée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {rentals.last_page > 1 && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={rentals.last_page}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal Dépenses */}
    
<Dialog open={openExpenseModal} onClose={handleCloseExpenseModal} maxWidth="sm" fullWidth>
  <DialogTitle>
    {selectedExpense ? "Modifier une dépense" : `Ajouter une dépense pour la location #${selectedRental?.id}`}
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
  <MenuItem value="carburant">Carburant</MenuItem>
  <MenuItem value="peages">Péages</MenuItem>
  <MenuItem value="restauration">Restauration</MenuItem>
  <MenuItem value="entretien">Entretien</MenuItem>
  <MenuItem value="autres">Autres</MenuItem>
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
