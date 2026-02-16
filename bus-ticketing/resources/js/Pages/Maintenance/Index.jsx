import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
// Format FCFA
const formatMoney = (n) =>
  Number(n || 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 });

// Format date FR
const formatDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return `${date.getDate().toString().padStart(2, "0")}/${
    (date.getMonth() + 1).toString().padStart(2, "0")
  }/${date.getFullYear()}`;
};

export default function MaintenanceIndex({ maintenances, buses, garages, filters }) {
  // Valeurs par défaut pour éviter les erreurs
  const maintList = maintenances || [];
  const busList = buses || [];
  const garageList = garages || [];

  const [filterState, setFilterState] = useState(filters || {});

  const applyFilters = () => {
    Inertia.get(route("maintenance.index"), filterState, { preserveState: true });
  };

  return (
    <GuestLayout>
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Liste des maintenances
      </Typography>

      {/* ---- Filtres ---- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Bus"
            value={filterState.bus_id || ""}
            onChange={(e) => setFilterState({ ...filterState, bus_id: e.target.value })}
          >
            <MenuItem value="">Tous</MenuItem>
            {busList?.map((bus) => (
              <MenuItem key={bus.id} value={bus.id}>
                {bus.model} ({bus.registration_number})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Type"
            value={filterState.type || ""}
            onChange={(e) => setFilterState({ ...filterState, type: e.target.value })}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="routine">Routine</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="inspection">Inspection</MenuItem>
          </TextField>

          <TextField
            select
            label="Garage"
            value={filterState.garage_id || ""}
            onChange={(e) => setFilterState({ ...filterState, garage_id: e.target.value })}
          >
            <MenuItem value="">Tous</MenuItem>
            {garageList?.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="date"
            label="Date début"
            InputLabelProps={{ shrink: true }}
            value={filterState.from_date || ""}
            onChange={(e) => setFilterState({ ...filterState, from_date: e.target.value })}
          />

          <TextField
            type="date"
            label="Date fin"
            InputLabelProps={{ shrink: true }}
            value={filterState.to_date || ""}
            onChange={(e) => setFilterState({ ...filterState, to_date: e.target.value })}
          />

          <Button variant="contained" onClick={applyFilters}>
            Filtrer
          </Button>
        </Stack>
      </Paper>

      {/* ---- Tableau ---- */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead sx={{ bgcolor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Bus</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Plan</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Garage</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Coût (FCFA)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {maintList.length > 0 ? (
              maintList.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    {m.bus?.model || "-"} ({m.bus?.registration_number || "-"})
                  </TableCell>
                  <TableCell>{formatDateFR(m.maintenance_date)}</TableCell>
                  <TableCell>{m.type || "-"}</TableCell>
                  <TableCell>{m.maintenance_plan?.name || "-"}</TableCell>
                  <TableCell>{m.garage?.name || "-"}</TableCell>
                  <TableCell>{formatMoney(m.cost)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune maintenance trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Total coûts */}
      <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
        Coût total société :{" "}
        {formatMoney(maintList.reduce((sum, m) => sum + Number(m.cost || 0), 0))} FCFA
      </Typography>
    </Box>
    </GuestLayout>
  );
}
