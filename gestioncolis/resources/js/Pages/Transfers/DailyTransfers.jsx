import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardContent, CardHeader, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography,
  Box, TextField, MenuItem, Button, CircularProgress
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function DailyTransfers() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false); // indicateur de chargement
  const [error, setError] = useState(null);      // message d'erreur

  const handleFilterChange = (value) => {
    setFilter(value);
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = "/transfers/daily/data"; // ou route('transfers.daily.data') si disponible

      const params = {};
      if (filter === "day" && selectedDate) params.date = selectedDate;
      if (filter === "range" && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await axios.get(url, { params });

      if (response.status === 200 && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        console.error("Réponse invalide :", response);
        setData([]);
        setError("Les données reçues sont invalides.");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des transferts :", err);
      setData([]);
      if (err.response) {
        setError(`Erreur serveur : ${err.response.status}`);
      } else if (err.request) {
        setError("Impossible de contacter le serveur.");
      } else {
        setError("Erreur inconnue lors de la récupération des données.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      filter === "all" ||
      (filter === "day" && selectedDate) ||
      (filter === "range" && startDate && endDate)
    ) {
      fetchData();
    }
  }, [filter, selectedDate, startDate, endDate]);

  return (
    <GuestLayout>
      <Card sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader title={<Typography variant="h5">💸 Transferts par jour</Typography>} />
        <CardContent>
          {/* FILTRES */}
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

            <Button variant="contained" onClick={fetchData} disabled={loading}>
              Appliquer
            </Button>
          </Box>

          {/* INDICATEUR DE CHARGEMENT */}
          {loading && (
            <Box textAlign="center" my={2}>
              <CircularProgress />
            </Box>
          )}

          {/* MESSAGE D'ERREUR */}
          {error && (
            <Typography color="error" align="center" my={2}>
              {error}
            </Typography>
          )}

          {/* TABLEAU DES TRANSFERTS */}
          <TableContainer component={Paper}>
  <Table>
    <TableHead sx={{ bgcolor: "#1565c0" }}>
      <TableRow>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nombre de transferts</TableCell>
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Montant total (CFA)</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {!loading && data.length === 0 && !error ? (
        <TableRow>
          <TableCell colSpan={3} align="center">Aucun transfert</TableCell>
        </TableRow>
      ) : (
        data.map((row, index) => {
          // Conversion de la date en français
          const dateFR = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(row.day));

          return (
            <TableRow key={index}>
              <TableCell>{dateFR}</TableCell>
              <TableCell>{row.total_transfers ?? 0}</TableCell>
              <TableCell>{(row.total_amount ?? 0).toLocaleString()} CFA</TableCell>
            </TableRow>
          )
        })
      )}
    </TableBody>
  </Table>
</TableContainer>

        </CardContent>
      </Card>
    </GuestLayout>
  );
}
