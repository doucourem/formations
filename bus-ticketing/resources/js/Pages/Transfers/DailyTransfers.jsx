import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ Import axios
import {
  Card, CardContent, CardHeader, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography,
  Box, TextField, MenuItem, Button
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function DailyTransfers() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilterChange = (value) => {
    setFilter(value);
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
  };

  const fetchData = async () => {
    try {
      let url = "/transfers/daily/data"; // Utilise directement l’URL Laravel

      // Paramètres pour le jour précis ou la période
      const params = {};
      if (filter === "day" && selectedDate) params.date = selectedDate;
      if (filter === "range" && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axios.get(url, { params });
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des transferts :", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader title={<Typography variant="h5">💸 Transferts par jour</Typography>} />
        <CardContent>
          <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
            <TextField
              select
              label="Filtrer"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">Tous les jours</MenuItem>
              <MenuItem value="day">Jour précis</MenuItem>
              <MenuItem value="range">Période</MenuItem>
            </TextField>

            {filter === "day" && (
              <TextField
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}

            {filter === "range" && (
              <>
                <TextField
                  label="Date début"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Date fin"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            <Button variant="contained" onClick={fetchData}>Appliquer</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1565c0" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nombre de transferts</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Montant total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">Aucun transfert</TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.day}</TableCell>
                      <TableCell>{row.total_transfers}</TableCell>
                      <TableCell>{row.total_amount.toLocaleString()} CFA</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
