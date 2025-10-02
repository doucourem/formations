import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Stack, IconButton, Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function Index({ cities, filters }) {
  const [sortField, setSortField] = useState(filters?.sort_field || 'id');
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDirection(direction);

    Inertia.get(route('cities.index'), {
      per_page: filters.per_page,
      sort_field: field,
      sort_direction: direction,
    }, { preserveState: true });
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette ville ?')) {
      Inertia.delete(route('cities.destroy', id));
    }
  };

  const handlePagination = (url) => {
    if (url) Inertia.get(url);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <GuestLayout>
      <Typography variant="h4" gutterBottom>Villes</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => Inertia.visit(route('cities.create'))}
        >
          Ajouter une ville
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
         <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              <TableCell onClick={() => handleSort('id')} sx={{ cursor: 'pointer' }}>
                ID {renderSortIcon('id')}
              </TableCell>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>
                Nom {renderSortIcon('name')}
              </TableCell>
              <TableCell onClick={() => handleSort('code')} sx={{ cursor: 'pointer' }}>
                Code {renderSortIcon('code')}
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.data?.map(city => (
              <TableRow key={city.id}>
                <TableCell>{city.id}</TableCell>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.code || '-'}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => Inertia.visit(route('cities.edit', city.id))}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(city.id)}
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
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {cities.links?.map((link, i) => (
          <Button
            key={i}
            disabled={!link.url}
            variant={link.active ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handlePagination(link.url)}
          >
            <span dangerouslySetInnerHTML={{ __html: link.label }} />
          </Button>
        ))}
      </Stack>
    </GuestLayout>
  );
}
