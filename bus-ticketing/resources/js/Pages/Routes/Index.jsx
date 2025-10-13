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
  TextField,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function RoutesIndex({ initialRoutes, initialFilters }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [parPage, setParPage] = useState(initialFilters?.per_page || 20);
  const [sortField, setSortField] = useState(initialFilters?.sort_field || 'id');
  const [sortDirection, setSortDirection] = useState(initialFilters?.sort_direction || 'asc');

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field) direction = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    Inertia.get(route('busroutes.index'), {
      per_page: parPage,
      sort_field: field,
      sort_direction: direction,
    }, { preserveState: true, onSuccess: page => setRoutes(page.props.routes) });
  };

  const filtrer = () => {
    Inertia.get(route('busroutes.index'), { per_page: parPage }, { preserveState: true, onSuccess: page => setRoutes(page.props.routes) });
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette route ?")) {
      Inertia.delete(route('busroutes.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (url) => {
    Inertia.get(url, {}, { preserveState: true, onSuccess: page => setRoutes(page.props.routes) });
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
            title={<Typography variant="h5">Routes</Typography>}
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => Inertia.visit(route('routes.create'))}
              >
                Ajouter une route
              </Button>
            }
          />
          <CardContent>
            {/* Filtrage */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="flex-end">
              <TextField
                label="Par page"
                type="number"
                value={parPage}
                onChange={e => setParPage(Number(e.target.value))}
                size="small"
                sx={{ width: 120 }}
              />
              <Button variant="contained" color="primary" onClick={filtrer}>
                Filtrer
              </Button>
            </Stack>

            {/* Tableau */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#1976d2' }}>
                  <TableRow>
                    <TableCell onClick={() => handleSort('id')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      ID {renderSortIcon('id')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('departureCity')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Ville de départ {renderSortIcon('departureCity')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('arrivalCity')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Ville d'arrivée {renderSortIcon('arrivalCity')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('price')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Prix (FCFA) {renderSortIcon('price')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('distance')} sx={{ cursor: 'pointer', color: '#fff' }}>
                      Distance (km) {renderSortIcon('distance')}
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#fff' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {routes.data?.length > 0 ? (
                    routes.data.map(routeItem => (
                      <TableRow key={routeItem.id} hover>
                        <TableCell>{routeItem.id}</TableCell>
                        <TableCell>{routeItem.departureCity?.name || '-'}</TableCell>
                        <TableCell>{routeItem.arrivalCity?.name || '-'}</TableCell>
                        <TableCell>{routeItem.price || '-'}</TableCell>
                        <TableCell>{routeItem.distance || '-'}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Éditer">
                              <IconButton color="primary" size="small" onClick={() => Inertia.visit(routeItem.edit_url)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton color="error" size="small" onClick={() => handleDelete(routeItem.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Aucune route trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
              {routes.links?.map((link, i) => (
                <Button
                  key={i}
                  disabled={!link.url}
                  variant={link.active ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handlePage(link.url)}
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
