import React, { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import {
  Card,
  CardHeader,
  Box,
  Stack,
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

export default function DailyTicketsSummary({ tickets }) {
  const { auth } = usePage().props;
  const user = auth?.user || {};

  // Calcul résumé par jour
  const dailySummary = useMemo(() => {
    const summary = {};
    tickets.forEach(ticket => {
      const date = new Date(ticket.created_at).toLocaleDateString();
      if (!summary[date]) summary[date] = { count: 0, total: 0 };
      summary[date].count += 1;
      summary[date].total += ticket.price || 0;
    });
    return Object.entries(summary)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [tickets]);

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📊 Résumé des Tickets par Jour</Typography>}
        />

        {/* 📊 Graphique */}
        <Box mt={3} sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailySummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
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
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nombre de tickets</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Montant total (FCFA)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailySummary.map(day => (
                  <TableRow key={day.date}>
                    <TableCell>{day.date}</TableCell>
                    <TableCell>{day.count}</TableCell>
                    <TableCell>{day.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </GuestLayout>
  );
}
