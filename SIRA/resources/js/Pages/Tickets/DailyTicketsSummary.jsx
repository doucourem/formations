import React, { useMemo, useState } from "react";
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
  TextField,
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

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔹 Résumé par jour
  const dailySummary = useMemo(() => {
    const summary = {};

    tickets.forEach(ticket => {
      if (!ticket.created_at) return;

      const dateObj = new Date(ticket.created_at.replace(" ", "T"));
      if (isNaN(dateObj)) return;

      const key = dateObj.toISOString().slice(0, 10);

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
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(d => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString("fr-FR"),
      }));
  }, [tickets]);

  // 🔍 Filtrage combiné (dates + recherche)
  const filteredSummary = useMemo(() => {
    return dailySummary.filter(day => {
      // 📅 Filtre date début
      if (startDate && day.date < startDate) return false;

      // 📅 Filtre date fin
      if (endDate && day.date > endDate) return false;

      // 🔍 Recherche texte
      if (
        search &&
        !day.displayDate.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [dailySummary, startDate, endDate, search]);

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📊 Résumé des Tickets par Jour</Typography>}
        />

        {/* 🎛️ Filtres */}
        <Box
          mb={3}
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr" }}
          gap={2}
        >
          <TextField
            label="📅 Date début"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />

          <TextField
            label="📅 Date fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />

          <TextField
            label="🔍 Recherche (date affichée)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Box>

        {/* 📊 Graphique */}
        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="Tickets" fill="#1565c0" />
              <Bar yAxisId="right" dataKey="total" name="Montant (FCFA)" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* 🧾 Tableau */}
        <Box mt={4}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1565c0" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Date</TableCell>
                  <TableCell sx={{ color: "white" }}>Tickets</TableCell>
                  <TableCell sx={{ color: "white" }}>Total (FCFA)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSummary.map(day => (
                  <TableRow key={day.date}>
                    <TableCell>{day.displayDate}</TableCell>
                    <TableCell>{day.count}</TableCell>
                    <TableCell>{day.total.toLocaleString("fr-FR")}</TableCell>
                  </TableRow>
                ))}

                {filteredSummary.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucun résultat
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
