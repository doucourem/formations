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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Stack } from '@mui/material';



export default function Index({ parcels, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 10);
  const [tracking, setTracking] = useState(filters?.tracking || '');
  const [status, setStatus] = useState(filters?.status || '');

  const statusMap = {
    pending: '🟡 En attente',
    in_transit: '🟠 En transit',
    delivered: '🟢 Livré',
  };

  const filtrer = () => {
    Inertia.get(
      route('parcels.index'),
      { per_page: parPage, tracking, status },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous supprimer ce colis ?')) {
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
           <Stack spacing={2} direction="row">
  <Button
    variant="contained"
    color="primary"
    startIcon={<AddIcon />}
    onClick={() => Inertia.get(route('parcels.create'))}
  >
    Ajouter un colis
  </Button>

  <Button
    variant="outlined"
    onClick={() => window.location.href = route('parcels.export')}
  >
    Export Résumé Excel
  </Button>

  <Button
    variant="outlined"
    onClick={() => window.location.href = route('parcels.export-detailed')}
  >
    Export Détail Excel
  </Button>
</Stack>

          }
        />

        <CardContent>
          {/* Filtres */}
          <Box
            component="form"
            display="flex"
            gap={2}
            mb={3}
            alignItems="flex-end"
            onSubmit={(e) => {
              e.preventDefault();
              filtrer();
            }}
          >
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
              onChange={(e) => setParPage(Math.max(1, Number(e.target.value)))}
              variant="outlined"
              size="small"
              sx={{ width: 120 }}
            />

            <Button variant="contained" color="primary" sx={{ height: 40 }} type="submit">
              Filtrer
            </Button>
          </Box>

          {/* Tableau */}
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {[ 'Tracking', 'Expéditeur', 'Destinataire', 'Poids (kg)', 'Statut', 'Actions'].map(
                    (col) => (
                      <TableCell
                        key={col}
                        sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}
                      >
                        {col}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {parcels?.data?.length > 0 ? (
                  parcels.data.map((colis) => (
                    <TableRow key={colis.id} hover>
                      <TableCell>{colis.tracking_number}</TableCell>
                      <TableCell>{colis.sender_name}</TableCell>
                      <TableCell>{colis.recipient_name}</TableCell>
                      <TableCell>{colis.weight_kg} kg</TableCell>
                      <TableCell>
                        <strong>{statusMap[colis.status] || colis.status}</strong>
                      </TableCell>
                      <TableCell>
  <IconButton
    color="primary"
    href={route('parcels.show', colis.id)}
    size="small"
    title="Voir le détail"
  >
    <VisibilityIcon />
  </IconButton>

  <IconButton
    color="primary"
    href={route('parcels.edit', colis.id)}
    size="small"
    title="Modifier"
  >
    <EditIcon />
  </IconButton>

  <IconButton
    color="error"
    onClick={() => handleDelete(colis.id)}
    size="small"
    title="Supprimer"
  >
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
