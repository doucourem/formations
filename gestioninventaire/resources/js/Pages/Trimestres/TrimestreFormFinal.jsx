import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Card, CardHeader } from "@mui/material";
export default function TrimestreFormFinal({ boutique, trimestre, produits }) {
  const [form, setForm] = useState({
    start_date: trimestre?.start_date || "",
    end_date: trimestre?.end_date || "",
    cash_start: trimestre?.cash_start || 0,
    cash_end: trimestre?.cash_end || 0,
    capital_start: trimestre?.capital_start || 0,
    capital_end: trimestre?.capital_end || 0,
    stocks: produits.map((p) => ({
      produit_id: p.id,
      name: p.name,
      quantity_start: trimestre?.stocks?.find((s) => s.produit_id === p.id)?.quantity_start || 0,
      value_start: trimestre?.stocks?.find((s) => s.produit_id === p.id)?.value_start || 0,
      quantity_end: trimestre?.stocks?.find((s) => s.produit_id === p.id)?.quantity_end || 0,
      value_end: trimestre?.stocks?.find((s) => s.produit_id === p.id)?.value_end || 0,
    })),
    depenses: trimestre?.depenses || [],
    credits: trimestre?.credits || [],
  });

  // Calcul résultat net
  // SECURISATION des valeurs numériques
const num = (v) => Number(v) || 0;

// Stocks
const totalStockStart = form.stocks.reduce(
  (sum, s) => sum + num(s.quantity_start) * num(s.value_start),
  0
);

const totalStockEnd = form.stocks.reduce(
  (sum, s) => sum + num(s.quantity_end) * num(s.value_end),
  0
);

// Dépenses & crédits
const totalDepenses = form.depenses.reduce(
  (sum, d) => sum + num(d.amount),
  0
);

const totalCredits = form.credits.reduce(
  (sum, c) => sum + num(c.amount),
  0
);

// RESULTAT NET
const resultNet =
  num(form.cash_end) +
  num(form.capital_end) +
  totalStockEnd +
  totalCredits -
  (
    num(form.cash_start) +
    num(form.capital_start) +
    totalStockStart +
    totalDepenses
  );


  // Handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleStockChange = (index, field, value) => {
    const updated = [...form.stocks];
    updated[index][field] = Number(value);
    setForm({ ...form, stocks: updated });
  };

  // Dépenses
  const handleDepenseChange = (index, field, value) => {
    const updated = [...form.depenses];
    updated[index][field] = value;
    setForm({ ...form, depenses: updated });
  };
  const addDepense = () => setForm({ ...form, depenses: [...form.depenses, { description: "", amount: 0 }] });
  const removeDepense = (index) => {
    const updated = [...form.depenses]; updated.splice(index, 1);
    setForm({ ...form, depenses: updated });
  };

  // Crédits
  const handleCreditChange = (index, field, value) => {
    const updated = [...form.credits];
    updated[index][field] = value;
    setForm({ ...form, credits: updated });
  };
  const addCredit = () => setForm({ ...form, credits: [...form.credits, { description: "", amount: 0 }] });
  const removeCredit = (index) => {
    const updated = [...form.credits]; updated.splice(index, 1);
    setForm({ ...form, credits: updated });
  };
const handleSubmit = (e) => {
  e.preventDefault();

  // On sécurise depenses et credits
  const payload = {
    ...form,
    depenses: form.depenses.map(d => ({
      description: d.description?.trim() || "Sans description",
      amount: Number(d.amount) || 0,
    })),
    credits: form.credits.map(c => ({
      description: c.description?.trim() || "Sans description",
      amount: Number(c.amount) || 0,
    })),
  };

  const routeName = trimestre ? "trimestres.update" : "boutiques.trimestres.store";
  const routeParams = trimestre ? trimestre.id : boutique.id;

  if (trimestre) {
    // UPDATE → méthode PUT
    Inertia.put(route(routeName, routeParams), payload, {
      onSuccess: () => console.log("Trimestre mis à jour"),
    });
  } else {
    // CREATE → méthode POST
    Inertia.post(route(routeName, routeParams), payload, {
      onSuccess: () => console.log("Trimestre créé"),
    });
  }
};



  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" mb={3}>
          {trimestre ? "Modifier le trimestre" : "Ajouter un trimestre"} – {boutique.name}
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>

              {/* Dates */}
              <Stack direction="row" spacing={2}>
                <TextField label="Date début" type="date" name="start_date" value={form.start_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
                <TextField label="Date fin" type="date" name="end_date" value={form.end_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
              </Stack>

              {/* Cash & Capital */}
              <Stack direction="row" spacing={2}>
                <TextField label="Caisse début" type="number" name="cash_start" value={form.cash_start} onChange={handleChange} fullWidth required />
                <TextField label="Caisse fin" type="number" name="cash_end" value={form.cash_end} onChange={handleChange} fullWidth required />
                <TextField label="Capital début" type="number" name="capital_start" value={form.capital_start} onChange={handleChange} fullWidth required />
                <TextField label="Capital fin" type="number" name="capital_end" value={form.capital_end} onChange={handleChange} fullWidth required />
              </Stack>

              <Divider />

              {/* Stocks */}
              <Typography variant="h6">Stocks</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: "#1976d2" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Produit</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Quantité début</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Valeur début</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Quantité fin</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Valeur fin</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Valeur totale fin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.stocks.map((s, i) => (
                      <TableRow key={s.produit_id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell><TextField type="number" value={s.quantity_start} onChange={(e) => handleStockChange(i, "quantity_start", e.target.value)} size="small" /></TableCell>
                        <TableCell><TextField type="number" value={s.value_start} onChange={(e) => handleStockChange(i, "value_start", e.target.value)} size="small" /></TableCell>
                        <TableCell><TextField type="number" value={s.quantity_end} onChange={(e) => handleStockChange(i, "quantity_end", e.target.value)} size="small" /></TableCell>
                        <TableCell><TextField type="number" value={s.value_end} onChange={(e) => handleStockChange(i, "value_end", e.target.value)} size="small" /></TableCell>
                        <TableCell>{(s.quantity_end * s.value_end).toLocaleString()} FCFA</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider />

              {/* Dépenses */}
              <Box>
                <Typography variant="h6">Dépenses</Typography>
                {form.depenses.map((d, i) => (
                  <Stack direction="row" spacing={1} key={i} mb={1}>
                    <TextField label="Description" value={d.description} onChange={(e) => handleDepenseChange(i, "description", e.target.value)} fullWidth />
                    <TextField label="Montant" type="number" value={d.amount} onChange={(e) => handleDepenseChange(i, "amount", e.target.value)} fullWidth />
                    <IconButton color="error" onClick={() => removeDepense(i)}>❌</IconButton>
                  </Stack>
                ))}
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addDepense}>+ Ajouter une dépense</Button>
              </Box>

              {/* Crédits */}
              <Box>
                <Typography variant="h6">Crédits</Typography>
                {form.credits.map((c, i) => (
                  <Stack direction="row" spacing={1} key={i} mb={1}>
                    <TextField label="Description" value={c.description} onChange={(e) => handleCreditChange(i, "description", e.target.value)} fullWidth />
                    <TextField label="Montant" type="number" value={c.amount} onChange={(e) => handleCreditChange(i, "amount", e.target.value)} fullWidth />
                    <IconButton color="error" onClick={() => removeCredit(i)}>❌</IconButton>
                  </Stack>
                ))}
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addCredit}>+ Ajouter un crédit</Button>
              </Box>

              <Divider />

              {/* Résultat net */}
              <Typography variant="h6">
                Résultat net (calculé) : {resultNet.toLocaleString()} FCFA
              </Typography>

              <Button type="submit" variant="contained" color="primary">Enregistrer le trimestre</Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </GuestLayout>
  );
}
