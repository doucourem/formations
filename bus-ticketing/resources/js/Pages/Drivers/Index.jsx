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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';


export default function DriversIndex({ drivers, filters }) {
  const [perPage, setPerPage] = useState(filters?.per_page || 10);
  const [search, setSearch] = useState(filters?.search || '');

  const filtrer = () => {
    Inertia.get(
      route('drivers.index'),
      { per_page: perPage, search },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce chauffeur ?")) {
      Inertia.delete(route('drivers.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route('drivers.index'),
      { per_page: perPage, search, page },
      { preserveState: true }
    );
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">🚍 Chauffeurs</Typography>}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route('drivers.create'))}
            >
              Ajouter Chauffeur
            </Button>
          }
        />
        <CardContent>
          {/* Filtres */}
          <Box display="flex" gap={2} mb={3} alignItems="flex-end">
            <TextField
              label="Recherche"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Par page"
              type="number"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
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
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Téléphone</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Documents</TableCell>
                  <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
           <TableBody>
  {drivers.data.map((driver) => (
    <TableRow key={driver.id}>
      <TableCell>{driver.id}</TableCell>
      <TableCell>{driver.name}</TableCell>
      <TableCell>{driver.phone ?? '-'}</TableCell>
      <TableCell>{driver.email ?? '-'}</TableCell>
      <TableCell>{driver.documents?.length || 0}</TableCell>

      {/* Actions */}
      <TableCell>
        <IconButton
          color="info"
          onClick={() => Inertia.get(route('drivers.show', driver.id))}
        >
          <VisibilityIcon />
        </IconButton>

        <IconButton
          color="primary"
          onClick={() => Inertia.get(route('drivers.edit', driver.id))}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          color="error"
          onClick={() => handleDelete(driver.id)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>


            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={drivers?.last_page || 1}
              page={drivers?.current_page || 1}
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
