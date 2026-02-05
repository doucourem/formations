import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
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
  Search as SearchIcon,
  Payments as PaymentsIcon
} from '@mui/icons-material';
import { indigo } from '@mui/material/colors';

export default function Index({ parcels, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 10);
  const [tracking, setTracking] = useState(filters?.tracking || '');
  const [status, setStatus] = useState(filters?.status || '');
  const [senderPhone, setSenderPhone] = useState(filters?.sender_phone || '');
  const [date, setDate] = useState(filters?.date || '');

  const filtrer = () => {
    Inertia.get(
      route('parcels.index'),
      {
        per_page: parPage,
        tracking,
        status,
        sender_phone: senderPhone,
        date,
      },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce colis ?')) {
      Inertia.delete(route('parcels.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route('parcels.index'),
      {
        per_page: parPage,
        tracking,
        status,
        sender_phone: senderPhone,
        date,
        page,
      },
      { preserveState: true }
    );
  };

  return (
    <GuestLayout>
      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E0E0E0' }}>
          {/* HEADER */}
          <CardHeader
            sx={{ bgcolor: '#F8F9FA', py: 3 }}
            title={
              <Typography variant="h5" fontWeight="800" color={indigo[900]}>
                📦 Suivi & Gestion des Colis
              </Typography>
            }
            action={
              <Stack spacing={1} direction="row">
                <Button
                  variant="contained"
                  sx={{ bgcolor: indigo[900] }}
                  startIcon={<AddIcon />}
                  onClick={() => Inertia.get(route('parcels.create'))}
                >
                  Nouveau colis
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={() => window.location.href = route('parcels.export')}
                >
                  Excel
                </Button>
              </Stack>
            }
          />

          {/* FILTRES */}
          <CardContent>
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#F4F7FA', borderRadius: 3 }} elevation={0}>
              <Box
                component="form"
                display="flex"
                flexWrap="wrap"
                gap={2}
                alignItems="flex-end"
                onSubmit={(e) => { e.preventDefault(); filtrer(); }}
              >
                <TextField
                  label="Tracking"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  size="small"
                />

                <TextField
                  label="Téléphone expéditeur"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  size="small"
                />

                <TextField
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  size="small"
                  sx={{ width: 180 }}
                  InputLabelProps={{ shrink: true }}
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
                  label="Lignes"
                  type="number"
                  value={parPage}
                  onChange={(e) => setParPage(Math.max(1, Number(e.target.value)))}
                  size="small"
                  sx={{ width: 90 }}
                />

                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SearchIcon />}
                  sx={{ bgcolor: indigo[500] }}
                >
                  Rechercher
                </Button>
              </Box>
            </Paper>

            {/* TABLEAU */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #EEE' }}>
              <Table>
                <TableHead sx={{ bgcolor: indigo[900] }}>
                  <TableRow>
                    {[
                      'Tracking', 'Expéditeur', 'Destinataire', 'Poids',
                      'Montant', 'Payé', 'Reste', 'Paiement', 'Statut', 'Actions'
                    ].map((h) => (
                      <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parcels?.data?.length ? parcels.data.map((colis) => (
                    <TableRow key={colis.id} hover>
                      <TableCell>{colis.tracking_number}</TableCell>
                      <TableCell>{colis.sender_name}</TableCell>
                      <TableCell>{colis.recipient_name}</TableCell>
                      <TableCell>{colis.weight_kg} kg</TableCell>

                      <TableCell>{Number(colis.price).toLocaleString()} FCFA</TableCell>
                      <TableCell>{Number(colis.paid_amount || 0).toLocaleString()} FCFA</TableCell>
                      <TableCell>{Number(colis.remaining_amount || colis.price).toLocaleString()} FCFA</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            colis.payment_type === 'partial' ? 'Partiel' :
                            colis.payment_type === 'full' ? 'Soldé' : 'Non payé'
                          }
                          sx={{
                            fontWeight: 'bold',
                            bgcolor:
                              colis.payment_type === 'partial' ? '#FFF3E0' :
                              colis.payment_type === 'full' ? '#E8F5E9' : '#FBE9E7',
                            color:
                              colis.payment_type === 'partial' ? '#E65100' :
                              colis.payment_type === 'full' ? '#2E7D32' : '#BF360C'
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            colis.status === 'pending' ? 'En attente' :
                            colis.status === 'in_transit' ? 'En transit' : 'Livré'
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Détails">
                            <IconButton size="small" onClick={() => Inertia.get(route('parcels.show', colis.id))}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {colis.remaining_amount > 0 && (
                            <Tooltip title="Compléter paiement">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => Inertia.get(route('parcels.payment.edit', colis.id))}
                              >
                                <PaymentsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => Inertia.get(route('parcels.edit', colis.id))}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error" onClick={() => handleDelete(colis.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        Aucun colis enregistré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={parcels?.last_page || 1}
                page={parcels?.current_page || 1}
                onChange={(e, page) => handlePage(page)}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
