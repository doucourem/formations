// resources/js/Pages/Parcels/DailySummary.jsx
import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box, Card, CardHeader, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Button
} from '@mui/material';

export default function DailySummary({ parcels }) {

  const dailySummary = parcels?.reduce((acc, colis) => {
    const date = new Date(colis.created_at).toLocaleDateString('fr-FR');
    if (!acc[date]) acc[date] = { count: 0, totalAmount: 0 };
    acc[date].count += 1;
    acc[date].totalAmount += colis.price || 0;
    return acc;
  }, {});

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📊 Résumé quotidien des colis</Typography>}
          action={
            <Button
              variant="outlined"
              onClick={() => window.location.href = route('parcels.daily-summary.export')}
            >
              Export Excel
            </Button>
          }
        />
        <CardContent>
          {dailySummary && Object.keys(dailySummary).length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Nombre de colis</TableCell>
                    <TableCell align="right">Montant total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(dailySummary).map(([date, summary]) => (
                    <TableRow key={date}>
                      <TableCell>{date}</TableCell>
                      <TableCell align="right">{summary.count}</TableCell>
                      <TableCell align="right">{summary.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Aucun colis trouvé.</Typography>
          )}
        </CardContent>
      </Card>
    </GuestLayout>
  );
}