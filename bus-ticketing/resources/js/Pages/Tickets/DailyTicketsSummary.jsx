import React, { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import {
  Card,
  CardHeader,
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DailyTicketsSummary({ tickets = [] }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  // 🔹 Calcul résumé par jour (très robuste)
 const dailySummary = useMemo(() => {
  const summary = {};

  tickets.forEach(ticket => {
    if (!ticket.created_at) return;

    // 🔒 Sécurisé pour Laravel
    const dateObj = new Date(ticket.created_at.replace(' ', 'T'));
    if (isNaN(dateObj)) return;

    const key = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD

    if (!summary[key]) {
      summary[key] = {
        date: key,
        timestamp: dateObj.getTime(),
        count: 0,
        total: 0,
      };
    }

    summary[key].count += 1;
    summary[key].total += Number(ticket.price) || 0;
  });

 return Object.values(summary)
  .sort((a, b) => b.timestamp - a.timestamp) // 🔹 Plus récent en premier
  .map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("fr-FR"),
  }));

}, [tickets]);


  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={
            <Typography variant="h5">
              📊 Résumé des Tickets par Jour
            </Typography>
          }
        />

        {/* 📊 Graphique */}
        <Box mt={3} sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailySummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                name="Nombre de tickets"
                fill="#1565c0"
              />
              <Bar
                yAxisId="right"
                dataKey="total"
                name="Montant total (FCFA)"
                fill="#2e7d32"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 🧾 Tableau */}
        <Box mt={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1565c0" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Nombre de tickets
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Montant total (FCFA)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailySummary.map(day => (
                  <TableRow key={day.date}>
                    <TableCell>{day.displayDate}</TableCell>
                    <TableCell>{day.count}</TableCell>
                    <TableCell>{day.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}

                {dailySummary.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucun ticket trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </GuestLayout>
  );
}
