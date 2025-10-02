import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Index({ buses, filters, agencies }) {
  const [parPage, setParPage] = useState(filters?.per_page || 20);
  const [agenceId, setAgenceId] = useState(filters?.agency_id || '');

  const handleFilter = () => {
    Inertia.get(
      route('buses.index'),
      { per_page: parPage, agency_id: agenceId },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce bus ?")) {
      Inertia.delete(route('buses.destroy', id), { preserveState: true });
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        {/* Header avec titre + bouton créer */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">Liste des bus</Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            href={route('buses.create')}
          >
            Créer un bus
          </Button>
        </Stack>

        {/* Filtrage */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Agence"
              value={agenceId}
              onChange={(e) => setAgenceId(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Toutes les agences</MenuItem>
              {agencies?.map((agency) => (
                <MenuItem key={agency.id} value={agency.id}>
                  {agency.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Par page"
              type="number"
              inputProps={{ min: 1 }}
              value={parPage}
              onChange={(e) => setParPage(e.target.value)}
              sx={{ width: 120 }}
            />

            <Button variant="contained" color="primary" onClick={handleFilter}>
              Filtrer
            </Button>
          </Stack>
        </Paper>

        {/* Tableau */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#1976d2' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Modèle</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Places</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agence</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buses?.data?.map((bus, index) => (
                <TableRow
                  key={bus.id}
                  sx={{
                    bgcolor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  <TableCell>{bus.id}</TableCell>
                  <TableCell>{bus.model}</TableCell>
                  <TableCell>{bus.seats}</TableCell>
                  <TableCell>{bus.agency?.name ?? '-'}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        color="primary"
                        href={route('buses.edit', bus.id)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(bus.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {buses?.links?.map((link, i) => (
            <Button
              key={i}
              disabled={!link.url}
              variant={link.active ? 'contained' : 'outlined'}
              size="small"
              onClick={() => link.url && Inertia.get(link.url)}
            >
              {typeof link.label === 'string' ? (
                <span dangerouslySetInnerHTML={{ __html: link.label }} />
              ) : (
                String(link.label)
              )}
            </Button>
          ))}
        </Stack>
      </Box>
    </GuestLayout>
  );
}
