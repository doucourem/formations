import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout'; // Utilisation du Layout sécurisé
import {
  Box, Card, CardHeader, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography, Button,
  TextField, IconButton, Pagination, MenuItem, Stack, Chip, Tooltip
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileDownload as ExportIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { indigo, grey } from '@mui/material/colors';

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
    if (confirm('Voulez-vous vraiment supprimer ce colis ? Cette action est irréversible.')) {
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
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E0E0E0' }}>
          <CardHeader
            sx={{ bgcolor: '#F8F9FA', py: 3 }}
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" fontWeight="800" color={indigo[900]}>
                  📦 Suivi & Gestion des Colis
                </Typography>
              </Stack>
            }
            action={
              <Stack spacing={1} direction="row">
                <Button
                  variant="contained"
                  disableElevation
                  sx={{ bgcolor: indigo[900], '&:hover': { bgcolor: indigo[700] } }}
                  startIcon={<AddIcon />}
                  onClick={() => Inertia.get(route('parcels.create'))}
                >
                  Nouveau colis
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ExportIcon />}
                  onClick={() => window.location.href = route('parcels.export')}
                >
                  Résumé Excel
                </Button>
              </Stack>
            }
          />

          <CardContent>
            {/* Zone de Filtrage */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F4F7FA', borderRadius: 3, border: 'none' }}>
              <Box
                component="form"
                display="flex"
                flexWrap="wrap"
                gap={2}
                alignItems="flex-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  filtrer();
                }}
              >
                <TextField
                  label="N° Tracking"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  size="small"
                  sx={{ bgcolor: 'white' }}
                />

                <TextField
                  select
                  label="Statut"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  size="small"
                  sx={{ width: 180, bgcolor: 'white' }}
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="pending">🟡 En attente</MenuItem>
                  <MenuItem value="in_transit">🟠 En transit</MenuItem>
                  <MenuItem value="delivered">🟢 Livré</MenuItem>
                </TextField>

                <TextField
                  label="Lignes"
                  type="number"
                  value={parPage}
                  onChange={(e) => setParPage(Math.max(1, Number(e.target.value)))}
                  size="small"
                  sx={{ width: 90, bgcolor: 'white' }}
                />

                <Button 
                    variant="contained" 
                    disableElevation 
                    type="submit" 
                    startIcon={<SearchIcon />}
                    sx={{ height: 40, px: 3, bgcolor: indigo[500] }}
                >
                  Rechercher
                </Button>
              </Box>
            </Paper>

            {/* Tableau Logistique */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #EEE' }}>
              <Table>
                <TableHead sx={{ bgcolor: indigo[900] }}>
                  <TableRow>
                    {['Tracking', 'Expéditeur', 'Destinataire', 'Poids', 'Statut', 'Actions'].map((head) => (
                      <TableCell key={head} sx={{ color: 'white', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parcels?.data?.length > 0 ? (
                    parcels.data.map((colis) => (
                      <TableRow key={colis.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#F9F9F9' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {colis.tracking_number}
                          </Typography>
                        </TableCell>
                        <TableCell>{colis.sender_name}</TableCell>
                        <TableCell>{colis.recipient_name}</TableCell>
                        <TableCell>{colis.weight_kg} kg</TableCell>
                        <TableCell>
                          <Chip 
                            label={
                              colis.status === 'pending' ? 'En attente' :
                              colis.status === 'in_transit' ? 'En transit' : 
                              colis.status === 'delivered' ? 'Livré' : colis.status
                            }
                            size="small"
                            sx={{ 
                                fontWeight: 'bold',
                                bgcolor: 
                                    colis.status === 'delivered' ? '#E8F5E9' : 
                                    colis.status === 'in_transit' ? '#FFF3E0' : '#F5F5F5',
                                color: 
                                    colis.status === 'delivered' ? '#2E7D32' : 
                                    colis.status === 'in_transit' ? '#E65100' : '#616161'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Détails">
                                <IconButton size="small" onClick={() => Inertia.get(route('parcels.show', colis.id))}>
                                    <VisibilityIcon fontSize="small" color="info" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                                <IconButton size="small" onClick={() => Inertia.get(route('parcels.edit', colis.id))}>
                                    <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                                <IconButton size="small" onClick={() => handleDelete(colis.id)}>
                                    <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary">Aucun colis enregistré dans la base.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={parcels?.last_page || 1}
                page={parcels?.current_page || 1}
                onChange={(e, page) => handlePage(page)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}