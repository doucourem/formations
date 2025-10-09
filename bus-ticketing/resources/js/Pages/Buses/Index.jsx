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
  Stack,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function BusesIndex({ buses, filters }) {
  const [sortField, setSortField] = useState(filters?.sort_field || 'id');
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDirection(direction);

    Inertia.get(route('buses.index'), {
      per_page: filters.per_page,
      sort_field: field,
      sort_direction: direction,
    }, { preserveState: true });
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce bus ?')) {
      Inertia.delete(route('buses.destroy', id));
    }
  };

  const handlePagination = (url) => {
    if (url) Inertia.get(url, {}, { preserveState: true });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h5">Bus</Typography>}
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => Inertia.visit(route('buses.create'))}
              >
                Ajouter un bus
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#1976d2' }}>
                  <TableRow>
                    <TableCell onClick={() => handleSort('id')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      ID {renderSortIcon('id')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('model')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Modèle {renderSortIcon('model')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('capacity')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Capacité {renderSortIcon('capacity')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('registration_number')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Immatriculation {renderSortIcon('registration_number')}
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#fff' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buses.data?.map(bus => (
                    <TableRow key={bus.id}>
                      <TableCell>{bus.id}</TableCell>
                      <TableCell>{bus.model}</TableCell>
                      <TableCell>{bus.capacity}</TableCell>
                      <TableCell>{bus.registration_number || '-'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Éditer">
                            <IconButton color="primary" size="small" onClick={() => Inertia.visit(route('buses.edit', bus.id))}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton color="error" size="small" onClick={() => handleDelete(bus.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
              {buses.links?.map((link, i) => (
                <Button
                  key={i}
                  disabled={!link.url}
                  variant={link.active ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handlePagination(link.url)}
                >
                  <span dangerouslySetInnerHTML={{ __html: link.label.replace(/<[^>]*>?/gm, '') }} />
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
