import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material";

export default function TrimestreDetails({ trimestre }) {
  // calcul total stock start / end
  const totalStockStart = trimestre.stocks.reduce(
    (sum, s) => sum + s.quantity_start * s.value_start,
    0
  );
  const totalStockEnd = trimestre.stocks.reduce(
    (sum, s) => sum + s.quantity_end * s.value_end,
    0
  );

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" mb={3}>
          Bilan du trimestre – {trimestre.boutique.name}
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Typography>
              <strong>Dates :</strong> {trimestre.start_date} → {trimestre.end_date}
            </Typography>
            <Typography>
              <strong>Caisse début :</strong> {trimestre.cash_start.toLocaleString()} FCFA
            </Typography>
            <Typography>
              <strong>Capital début :</strong> {trimestre.capital_start.toLocaleString()} FCFA
            </Typography>
            <Typography>
              <strong>Caisse fin :</strong> {trimestre.cash_end.toLocaleString()} FCFA
            </Typography>
            <Typography>
              <strong>Capital fin :</strong> {trimestre.capital_end.toLocaleString()} FCFA
            </Typography>
            <Typography>
              <strong>Résultat :</strong> {trimestre.result.toLocaleString()} FCFA
            </Typography>
          </Stack>
        </Paper>

        <Typography variant="h5" mb={2}>
          Stocks des produits
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff" }}>Produit</TableCell>
                <TableCell sx={{ color: "#fff" }}>Quantité début</TableCell>
                <TableCell sx={{ color: "#fff" }}>Valeur début</TableCell>
                <TableCell sx={{ color: "#fff" }}>Valeur totale début</TableCell>
                <TableCell sx={{ color: "#fff" }}>Quantité fin</TableCell>
                <TableCell sx={{ color: "#fff" }}>Valeur fin</TableCell>
                <TableCell sx={{ color: "#fff" }}>Valeur totale fin</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {trimestre.stocks.map((s) => (
                <TableRow key={s.produit_id}>
                  <TableCell>{s.produit.name}</TableCell>
                  <TableCell>{s.quantity_start}</TableCell>
                  <TableCell>{s.value_start.toLocaleString()} FCFA</TableCell>
                  <TableCell>{(s.quantity_start * s.value_start).toLocaleString()} FCFA</TableCell>
                  <TableCell>{s.quantity_end}</TableCell>
                  <TableCell>{s.value_end.toLocaleString()} FCFA</TableCell>
                  <TableCell>{(s.quantity_end * s.value_end).toLocaleString()} FCFA</TableCell>
                </TableRow>
              ))}

              {/* Totaux */}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <strong>Total :</strong>
                </TableCell>
                <TableCell>
                  <strong>{totalStockStart.toLocaleString()} FCFA</strong>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell>
                  <strong>{totalStockEnd.toLocaleString()} FCFA</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Typography variant="h6" mt={2}>Dépenses</Typography>
<Table>
  <TableBody>
    {trimestre.depenses.map(d => (
      <TableRow key={d.id}>
        <TableCell>{d.description}</TableCell>
        <TableCell>{d.amount.toLocaleString()} FCFA</TableCell>
      </TableRow>
    ))}
    <TableRow>
      <TableCell>Total</TableCell>
      <TableCell>{trimestre.depenses.reduce((a,b) => a+b.amount,0).toLocaleString()} FCFA</TableCell>
    </TableRow>
  </TableBody>
</Table>

<Typography variant="h6" mt={2}>Crédits</Typography>
<Table>
  <TableBody>
    {trimestre.credits.map(c => (
      <TableRow key={c.id}>
        <TableCell>{c.description}</TableCell>
        <TableCell>{c.amount.toLocaleString()} FCFA</TableCell>
      </TableRow>
    ))}
    <TableRow>
      <TableCell>Total</TableCell>
      <TableCell>{trimestre.credits.reduce((a,b) => a+b.amount,0).toLocaleString()} FCFA</TableCell>
    </TableRow>
  </TableBody>
</Table>

    </GuestLayout>
  );
}
