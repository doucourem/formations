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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Index({ agencies, filters, flash }) {
  const [parPage, setParPage] = useState(filters?.per_page || 10);
  const [cityId, setCityId] = useState(filters?.city_id || '');

  const filtrer = () => {
    Inertia.get(
      route('agencies.index'),
      { per_page: parPage, city_id: cityId },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) {
      Inertia.delete(route('agencies.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route('agencies.index'),
      { per_page: parPage, city_id: cityId, page },
      { preserveState: true }
    );
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Agences</Typography>}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route('agencies.create'))}
            >
              Créer une agence
            </Button>
          }
                  />
        <CardContent>
          {/* Messages flash */}


          {/* Filtres */}
          <Box display="flex" gap={2} mb={3} alignItems="flex-end">
            <TextField
              label="Ville"
              type="number"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: 120 }}
            />
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
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Ville</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Billets vendus</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agencies?.data?.length > 0 ? (
                  agencies.data.map((agence) => (
                    <TableRow key={agence.id}>
                      <TableCell>{agence.id}</TableCell>
                      <TableCell>{agence.name}</TableCell>
                      <TableCell>{agence.city || '-'}</TableCell>
                      <TableCell>{agence.tickets_sold ?? 0}</TableCell>
                      <TableCell>
                        <IconButton color="primary" href={route('agencies.edit', agence.id)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(agence.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucune agence trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={agencies?.last_page || 1}
              page={agencies?.current_page || 1}
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
