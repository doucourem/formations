import React, { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography, Stack, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function StockTrimestreTable({ produits, initialStocks = [], onChange }) {
  const [stocks, setStocks] = useState(() => {
    if (initialStocks.length > 0) return initialStocks;
    // initialiser avec tous les produits à zéro
    return produits.map((p) => ({
      produit_id: p.id,
      name: p.name,
      quantity_start: 0,
      value_start: 0,
    }));
  });

  // calcul total
  const totalValue = stocks.reduce((sum, s) => sum + s.quantity_start * s.value_start, 0);

  // notifier parent à chaque changement
  useEffect(() => {
    if (onChange) onChange(stocks);
  }, [stocks]);

  const handleChange = (index, field, value) => {
    const updated = [...stocks];
    updated[index][field] = Number(value);
    setStocks(updated);
  };

  const handleAddProduct = (produit) => {
    if (stocks.find((s) => s.produit_id === produit.id)) return;
    setStocks([...stocks, { produit_id: produit.id, name: produit.name, quantity_start: 0, value_start: 0 }]);
  };

  const handleRemoveProduct = (index) => {
    const updated = [...stocks];
    updated.splice(index, 1);
    setStocks(updated);
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Stocks des produits
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>Produit</TableCell>
              <TableCell sx={{ color: "#fff" }}>Quantité début</TableCell>
              <TableCell sx={{ color: "#fff" }}>Valeur début</TableCell>
              <TableCell sx={{ color: "#fff" }}>Valeur totale</TableCell>
              <TableCell sx={{ color: "#fff" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stocks.map((s, index) => (
              <TableRow key={s.produit_id}>
                <TableCell>{s.name}</TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    value={s.quantity_start}
                    onChange={(e) => handleChange(index, "quantity_start", e.target.value)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    value={s.value_start}
                    onChange={(e) => handleChange(index, "value_start", e.target.value)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography>{(s.quantity_start * s.value_start).toLocaleString()} FCFA</Typography>
                </TableCell>

                <TableCell>
                  <IconButton color="error" size="small" onClick={() => handleRemoveProduct(index)}>
                    <RemoveIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Total général */}
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography fontWeight="bold">Total :</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight="bold">{totalValue.toLocaleString()} FCFA</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ajouter un produit */}
      <Box mt={2}>
        <Typography>Ajouter un produit :</Typography>
        <Stack direction="row" spacing={1} mt={1}>
          {produits.map((p) => (
            <Button
              key={p.id}
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleAddProduct(p)}
              disabled={stocks.some((s) => s.produit_id === p.id)}
            >
              {p.name}
            </Button>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
