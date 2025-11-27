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
  Button,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";

// Helper pour formater les dates en français
const formatDateFR = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function TrimestreDetails({ trimestre }) {
  const totalStockStart = trimestre.stocks.reduce(
    (sum, s) => sum + s.quantity_start * s.value_start,
    0
  );
  const totalStockEnd = trimestre.stocks.reduce(
    (sum, s) => sum + s.quantity_end * s.value_end,
    0
  );
  const totalDepenses = trimestre.depenses.reduce((sum, d) => sum + d.amount, 0);
  const totalCredits = trimestre.credits.reduce((sum, c) => sum + c.amount, 0);

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Bilan du trimestre – {trimestre.boutique.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open(route("trimestres.pdf", trimestre.id))}
          >
            Télécharger PDF
          </Button>
        </Stack>

        {/* Informations financières */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Informations financières" />
          <CardContent>
            <Stack spacing={1}>
              <Typography>
                <strong>Dates :</strong> {formatDateFR(trimestre.start_date)} → {formatDateFR(trimestre.end_date)}
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
              <Typography variant="h6" color="primary">
                <strong>Résultat net :</strong> {trimestre.result.toLocaleString()} FCFA
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Stocks */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Stocks des produits" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#1976d2" }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff" }}>Produit</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Quantité début</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Valeur début</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Total début</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Quantité fin</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Valeur fin</TableCell>
                    <TableCell sx={{ color: "#fff" }}>Total fin</TableCell>
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
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Total :</strong></TableCell>
                    <TableCell><strong>{totalStockStart.toLocaleString()} FCFA</strong></TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell><strong>{totalStockEnd.toLocaleString()} FCFA</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dépenses */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Dépenses" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableBody>
                  {trimestre.depenses.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.description}</TableCell>
                      <TableCell>{d.amount.toLocaleString()} FCFA</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>{totalDepenses.toLocaleString()} FCFA</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Crédits */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Crédits" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableBody>
                  {trimestre.credits.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.description}</TableCell>
                      <TableCell>{c.amount.toLocaleString()} FCFA</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>{totalCredits.toLocaleString()} FCFA</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
