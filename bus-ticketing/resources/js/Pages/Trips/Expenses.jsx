import React, { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TripExpenses({ trip, expenses }) {
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expensesForm, setExpensesForm] = useState({
    type: "chauffeur",
    amount: 0,
    description: "",
  });

  // ✅ Mise à jour des champs du formulaire
  const handleExpenseChange = (field, value) => {
    setExpensesForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Soumission du formulaire pour ajout ou modification
  const submitExpense = () => {
    if (!expensesForm.type || !expensesForm.amount) {
      alert("Veuillez renseigner le type et le montant.");
      return;
    }

    if (editingExpense) {
      // Modification
      Inertia.put(
        route("trip-expenses.update", { tripExpense: editingExpense.id }),
        expensesForm,
        {
          onSuccess: () => resetForm(),
        }
      );
    } else {
      // Ajout
      Inertia.post(route("trip-expenses.store", { trip: trip.id }), expensesForm, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const resetForm = () => {
    setExpensesForm({ type: "chauffeur", amount: 0, description: "" });
    setEditingExpense(null);
    setOpenExpenseDialog(false);
  };

  // ✅ Supprimer une dépense
  const deleteExpense = (expenseId) => {
    if (confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
      Inertia.delete(route("trip-expenses.destroy", { tripExpense: expenseId }));
    }
  };

  // ✅ Préparer le modal pour modification
  const editExpense = (expense) => {
    setEditingExpense(expense);
    setExpensesForm({
      type: expense.type,
      amount: expense.amount,
      description: expense.description || "",
    });
    setOpenExpenseDialog(true);
  };

  // ✅ Fonction pour afficher le libellé du type
  const getTypeLabel = (type) => {
    return {
      chauffeur: "Prime V",
      fuel: "Carburant",
      toll: "NTT",
      meal: "Frais de route",
      maintenance: "Entretien",
      other: "Autre",
    }[type] || type;
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        {/* En-tête + bouton ajouter dépense */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">💰 Dépenses du trajet #{trip.id}</Typography>
          <Button variant="contained" onClick={() => setOpenExpenseDialog(true)}>
            ➕ Ajouter une dépense
          </Button>
        </Box>

        {/* Tableau des dépenses */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Montant (FCFA)</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{getTypeLabel(exp.type)}</TableCell>
                    <TableCell>{exp.amount.toLocaleString("fr-FR")}</TableCell>
                    <TableCell>{exp.description || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton color="primary" onClick={() => editExpense(exp)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => deleteExpense(exp.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucune dépense
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Bouton retour aux trajets */}
        <Box mt={2}>
          <Button variant="contained" component={Link} href={route("trips.index")}>
            🔙 Retour aux trajets
          </Button>
        </Box>

        {/* Modal Ajouter / Modifier une dépense */}
        <Dialog open={openExpenseDialog} onClose={resetForm} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingExpense ? "✏️ Modifier une dépense" : "➕ Ajouter une dépense"}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Type de dépense"
                  fullWidth
                  value={expensesForm.type}
                  onChange={(e) => handleExpenseChange("type", e.target.value)}
                >
                  <MenuItem value="chauffeur">Prime V</MenuItem>
                  <MenuItem value="fuel">Carburant</MenuItem>
                  <MenuItem value="toll">NTT</MenuItem>
                  <MenuItem value="meal">Frais de route</MenuItem>
                  <MenuItem value="maintenance">Entretien</MenuItem>
                  <MenuItem value="other">Autres</MenuItem>
                </TextField>

                <TextField
                  label="Montant (FCFA)"
                  type="number"
                  fullWidth
                  value={expensesForm.amount}
                  onChange={(e) => handleExpenseChange("amount", e.target.value)}
                />

                <TextField
                  label="Description (optionnel)"
                  fullWidth
                  multiline
                  rows={2}
                  value={expensesForm.description}
                  onChange={(e) => handleExpenseChange("description", e.target.value)}
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm} color="secondary">
              Annuler
            </Button>
            <Button variant="contained" color="primary" onClick={submitExpense}>
              {editingExpense ? "Modifier" : "Ajouter"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </GuestLayout>
  );
}
