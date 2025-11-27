import React, { useState } from "react";
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
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
      quantity_start:
        trimestre?.stocks?.find((s) => s.produit_id === p.id)?.quantity_start ||
        0,
      value_start:
        trimestre?.stocks?.find((s) => s.produit_id === p.id)?.value_start || 0,
      quantity_end:
        trimestre?.stocks?.find((s) => s.produit_id === p.id)?.quantity_end || 0,
      value_end:
        trimestre?.stocks?.find((s) => s.produit_id === p.id)?.value_end || 0,
    })),
    depenses: trimestre?.depenses || [],
    credits: trimestre?.credits || [],
  });

  const num = (v) => Number(v) || 0;

  const totalStockStart = form.stocks.reduce(
    (sum, s) => sum + num(s.quantity_start) * num(s.value_start),
    0
  );
  const totalStockEnd = form.stocks.reduce(
    (sum, s) => sum + num(s.quantity_end) * num(s.value_end),
    0
  );
  const totalDepenses = form.depenses.reduce((sum, d) => sum + num(d.amount), 0);
  const totalCredits = form.credits.reduce((sum, c) => sum + num(c.amount), 0);

  const resultNet =
    num(form.cash_end) +
    num(form.capital_end) +
    totalStockEnd +
    totalCredits -
    (num(form.cash_start) +
      num(form.capital_start) +
      totalStockStart +
      totalDepenses);

  // Handlers
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleStockChange = (index, field, value) => {
    const updated = [...form.stocks];
    updated[index][field] = Number(value);
    setForm({ ...form, stocks: updated });
  };

  const handleDepenseChange = (index, field, value) => {
    const updated = [...form.depenses];
    updated[index][field] = value;
    setForm({ ...form, depenses: updated });
  };
  const addDepense = () =>
    setForm({
      ...form,
      depenses: [...form.depenses, { description: "", amount: 0 }],
    });
  const removeDepense = (index) => {
    const updated = [...form.depenses];
    updated.splice(index, 1);
    setForm({ ...form, depenses: updated });
  };

  const handleCreditChange = (index, field, value) => {
    const updated = [...form.credits];
    updated[index][field] = value;
    setForm({ ...form, credits: updated });
  };
  const addCredit = () =>
    setForm({
      ...form,
      credits: [...form.credits, { description: "", amount: 0 }],
    });
  const removeCredit = (index) => {
    const updated = [...form.credits];
    updated.splice(index, 1);
    setForm({ ...form, credits: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      depenses: form.depenses.map((d) => ({
        description: d.description?.trim() || "Sans description",
        amount: Number(d.amount) || 0,
      })),
      credits: form.credits.map((c) => ({
        description: c.description?.trim() || "Sans description",
        amount: Number(c.amount) || 0,
      })),
    };

    const routeName = trimestre ? "trimestres.update" : "boutiques.trimestres.store";
    const routeParams = trimestre ? trimestre.id : boutique.id;

    if (trimestre) {
      Inertia.put(route(routeName, routeParams), payload);
    } else {
      Inertia.post(route(routeName, routeParams), payload);
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" mb={3}>
          {trimestre ? "Modifier le trimestre" : "Ajouter un trimestre"} – {boutique.name}
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Dates & Capital */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Informations générales" />
            <CardContent>
              <Stack spacing={2} direction="row">
                <TextField
                  label="Date début"
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="Date fin"
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Stack>

              <Stack spacing={2} direction="row" mt={2}>
                <TextField
                  label="Caisse début"
                  type="number"
                  name="cash_start"
                  value={form.cash_start}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Caisse fin"
                  type="number"
                  name="cash_end"
                  value={form.cash_end}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Capital début"
                  type="number"
                  name="capital_start"
                  value={form.capital_start}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Capital fin"
                  type="number"
                  name="capital_end"
                  value={form.capital_end}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Stocks */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Stocks" />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#1976d2" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Produit</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Quantité début</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Valeur début</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Quantité fin</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Valeur fin</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Total fin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.stocks.map((s, i) => (
                      <TableRow key={s.produit_id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={s.quantity_start}
                            onChange={(e) =>
                              handleStockChange(i, "quantity_start", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={s.value_start}
                            onChange={(e) =>
                              handleStockChange(i, "value_start", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={s.quantity_end}
                            onChange={(e) =>
                              handleStockChange(i, "quantity_end", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={s.value_end}
                            onChange={(e) =>
                              handleStockChange(i, "value_end", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {(s.quantity_end * s.value_end).toLocaleString()} FCFA
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Dépenses */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Dépenses" />
            <CardContent>
              {form.depenses.map((d, i) => (
                <Stack key={i} direction="row" spacing={1} mb={1}>
                  <TextField
                    label="Description"
                    value={d.description}
                    onChange={(e) =>
                      handleDepenseChange(i, "description", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Montant"
                    type="number"
                    value={d.amount}
                    onChange={(e) => handleDepenseChange(i, "amount", e.target.value)}
                    fullWidth
                  />
                  <IconButton color="error" onClick={() => removeDepense(i)}>
                    ❌
                  </IconButton>
                </Stack>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addDepense}
              >
                Ajouter une dépense
              </Button>
            </CardContent>
          </Card>

          {/* Crédits */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Crédits" />
            <CardContent>
              {form.credits.map((c, i) => (
                <Stack key={i} direction="row" spacing={1} mb={1}>
                  <TextField
                    label="Description"
                    value={c.description}
                    onChange={(e) =>
                      handleCreditChange(i, "description", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Montant"
                    type="number"
                    value={c.amount}
                    onChange={(e) => handleCreditChange(i, "amount", e.target.value)}
                    fullWidth
                  />
                  <IconButton color="error" onClick={() => removeCredit(i)}>
                    ❌
                  </IconButton>
                </Stack>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addCredit}
              >
                Ajouter un crédit
              </Button>
            </CardContent>
          </Card>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">
              Résultat net : {resultNet.toLocaleString()} FCFA
            </Typography>
          </Paper>

          <Button type="submit" variant="contained" color="primary">
            Enregistrer le trimestre
          </Button>
        </form>
      </Box>
    </GuestLayout>
  );
}
