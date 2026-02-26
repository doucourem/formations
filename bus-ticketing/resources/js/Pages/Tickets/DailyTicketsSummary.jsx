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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

export default function TicketsSummary({ tickets = [] }) {
  const { auth } = usePage().props;

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("day"); // day, month, year

  // 🔹 Fonction pour formater la date selon le niveau de regroupement
  const getDateKey = (dateObj) => {
    switch (groupBy) {
      case "month":
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      case "year":
        return `${dateObj.getFullYear()}`;
      default:
        return dateObj.toISOString().slice(0, 10); // jour
    }
  };

  const getDisplayDate = (key) => {
    const parts = key.split("-");
    switch (groupBy) {
      case "month":
        return `${parts[1]}/${parts[0]}`; // MM/YYYY
      case "year":
        return parts[0];
      default:
        return new Date(key).toLocaleDateString("fr-FR"); // JJ/MM/YYYY
    }
  };

  // 🔹 Résumé calculé
  const summary = useMemo(() => {
    const summaryObj = {};

    tickets.forEach(ticket => {
      if (!ticket.created_at) return;

      const dateObj = new Date(ticket.created_at.replace(" ", "T"));
      if (isNaN(dateObj)) return;

      const key = getDateKey(dateObj);
      if (!summaryObj[key]) {
        summaryObj[key] = { key, count: 0, total: 0 };
      }

      summaryObj[key].count += 1;
      summaryObj[key].total += Number(ticket.price) || 0;
    });

    return Object.values(summaryObj)
      .sort((a, b) => b.key.localeCompare(a.key))
      .map(d => ({ ...d, displayDate: getDisplayDate(d.key) }));
  }, [tickets, groupBy]);

  // 🔹 Filtrage combiné
  const filteredSummary = useMemo(() => {
    return summary.filter(d => {
      if (startDate && d.key < startDate) return false;
      if (endDate && d.key > endDate) return false;
      if (search && !d.displayDate.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [summary, startDate, endDate, search]);

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📊 Résumé des Tickets</Typography>}
        />

        {/* 🎛️ Filtres */}
        <Box
          mb={3}
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(4, 1fr)" }}
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
            label="🔍 Recherche"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <FormControl>
            <InputLabel>📊 Regrouper par</InputLabel>
            <Select
              value={groupBy}
              label="Regrouper par"
              onChange={e => setGroupBy(e.target.value)}
            >
              <MenuItem value="day">Jour</MenuItem>
              <MenuItem value="month">Mois</MenuItem>
              <MenuItem value="year">Année</MenuItem>
            </Select>
          </FormControl>
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
                {filteredSummary.map(d => (
                  <TableRow key={d.key}>
                    <TableCell>{d.displayDate}</TableCell>
                    <TableCell>{d.count}</TableCell>
                    <TableCell>{d.total.toLocaleString("fr-FR")}</TableCell>
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