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
  Divider,
} from "@mui/material";

export default function TrimestreForm({ boutique, trimestre, produits }) {
  // initial state
  const [form, setForm] = useState({
    start_date: trimestre?.start_date || "",
    end_date: trimestre?.end_date || "",
    cash_start: trimestre?.cash_start || 0,
    capital_start: trimestre?.capital_start || 0,
    stocks: produits.map((p) => ({
      produit_id: p.id,
      name: p.name,
      quantity_start: trimestre?.stocks?.find((s) => s.produit_id === p.id)?.quantity_start || 0,
      value_start: trimestre?.stocks?.find((s) => s.produit_id === p.id)?.value_start || 0,
    })),
  });

  // handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // handle stock changes
  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...form.stocks];
    updatedStocks[index][field] = value;
    setForm({ ...form, stocks: updatedStocks });
  };

  // submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const routeName = trimestre ? "trimestres.update" : "boutiques.trimestres.store";
    const routeParams = trimestre ? [trimestre.id] : [boutique.id];

    Inertia.post(
      routeName, 
      form,
      {
        onSuccess: () => console.log("Trimestre sauvegardé"),
        onError: (errors) => console.log(errors),
      }
    );
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

              {/* Cash & Capital */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Caisse de départ"
                  type="number"
                  name="cash_start"
                  value={form.cash_start}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Capital de départ"
                  type="number"
                  name="capital_start"
                  value={form.capital_start}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Stack>

              <Divider />

              {/* Stocks produits */}
              <Typography variant="h6">Stocks des produits</Typography>
              {form.stocks.map((s, index) => (
                <Stack direction="row" spacing={2} key={s.produit_id} mb={1}>
                  <TextField
                    label="Produit"
                    value={s.name}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                  <TextField
                    label="Quantité début"
                    type="number"
                    value={s.quantity_start}
                    onChange={(e) => handleStockChange(index, "quantity_start", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Valeur début"
                    type="number"
                    value={s.value_start}
                    onChange={(e) => handleStockChange(index, "value_start", e.target.value)}
                    fullWidth
                  />
                </Stack>
              ))}

              <Divider />

              {/* Submit */}
              <Button type="submit" variant="contained" color="primary">
                {trimestre ? "Mettre à jour" : "Créer"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </GuestLayout>
  );
}
