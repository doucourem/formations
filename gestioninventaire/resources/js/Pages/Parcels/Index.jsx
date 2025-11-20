import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Pagination,
  MenuItem,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Index({ parcels, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 10);
  const [tracking, setTracking] = useState(filters?.tracking || '');
  const [status, setStatus] = useState(filters?.status || '');

  const filtrer = () => {
    Inertia.get(
      route('parcels.index'),
      { per_page: parPage, tracking, status },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous supprimer ce colis ?")) {
      Inertia.delete(route('parcels.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route('parcels.index'),
      { per_page: parPage, tracking, status, page },
      { preserveState: true }
    );
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">📦 Liste des Colis</Typography>}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route('parcels.create'))}
            >
              Ajouter un colis
            </Button>
          }
        />

        <CardContent>
          {/* Filtres */}
          <Box display="flex" gap={2} mb={3} alignItems="flex-end">
            <TextField
              label="Tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              variant="outlined"
              size="small"
            />

            <TextField
              select
              label="Statut"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              size="small"
              sx={{ width: 180 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="in_transit">En transit</MenuItem>
              <MenuItem value="delivered">Livré</MenuItem>
            </TextField>

            <TextField
              label="Par page"
              type="number"
              value={parPage}
              onChange={(e) => setParPage(Number(e.target.value))}
              variant="outlined"
              size="small"
              sx={{ width: 120 }}
            />

            <Button variant="contained" color="primary" onClick={filtrer} sx={{ height: 40 }}>
              Filtrer
            </Button>
          </Box>

          {/* Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Tracking</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Expéditeur</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Destinataire</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Poids (kg)</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {parcels?.data?.length > 0 ? (
                  parcels.data.map((colis) => (
                    <TableRow key={colis.id}>
                      <TableCell>{colis.id}</TableCell>
                      <TableCell>{colis.tracking_number}</TableCell>
                      <TableCell>{colis.sender_name}</TableCell>
                      <TableCell>{colis.recipient_name}</TableCell>
                      <TableCell>{colis.weight_kg} kg</TableCell>
                      <TableCell>
                        <strong>
                          {colis.status === "pending" && "🟡 En attente"}
                          {colis.status === "in_transit" && "🟠 En transit"}
                          {colis.status === "delivered" && "🟢 Livré"}
                        </strong>
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary" href={route('parcels.edit', colis.id)} size="small">
                          <EditIcon />
                        </IconButton>

                        <IconButton color="error" onClick={() => handleDelete(colis.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun colis trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={parcels?.last_page || 1}
              page={parcels?.current_page || 1}
              onChange={(e, page) => handlePage(page)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
