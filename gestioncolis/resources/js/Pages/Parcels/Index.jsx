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
    Inertia.get(route('parcels.index'),
      { per_page: parPage, tracking, status, sender_phone: senderPhone, date },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce colis ?')) {
      Inertia.delete(route('parcels.destroy', id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(route('parcels.index'),
      { per_page: parPage, tracking, status, sender_phone: senderPhone, date, page },
      { preserveState: true }
    );
  };

  return (
    <GuestLayout>

      <Box sx={{ p: { xs: 1, md: 3 } }}>

        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E0E0E0' }}>

          {/* HEADER RESPONSIVE */}
          <CardHeader
            sx={{ bgcolor: '#F8F9FA', py: 3 }}
            title={
              <Typography variant="h5" fontWeight="800" color={indigo[900]}>
                📦 Suivi & Gestion des Colis
              </Typography>
            }
            action={
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  sx={{ bgcolor: indigo[900] }}
                  startIcon={<AddIcon />}
                  onClick={() => Inertia.get(route('parcels.create'))}
                >
                  Nouveau
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

          <CardContent>

            {/* FILTRES RESPONSIVE */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#F4F7FA', borderRadius: 3 }} elevation={0}>
              <Box
                component="form"
                onSubmit={(e)=>{e.preventDefault();filtrer();}}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: '2fr 2fr 1.5fr 1.5fr 1fr auto'
                  },
                  gap: 2
                }}
              >
                <TextField label="Tracking" value={tracking} onChange={(e)=>setTracking(e.target.value)} size="small" />
                <TextField label="Téléphone expéditeur" value={senderPhone} onChange={(e)=>setSenderPhone(e.target.value)} size="small" />

                <TextField
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e)=>setDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink:true }}
                />

                <TextField select label="Statut" value={status} onChange={(e)=>setStatus(e.target.value)} size="small">
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="in_transit">En transit</MenuItem>
                  <MenuItem value="delivered">Livré</MenuItem>
                </TextField>

                <TextField
                  label="Lignes"
                  type="number"
                  value={parPage}
                  onChange={(e)=>setParPage(Math.max(1,Number(e.target.value)))}
                  size="small"
                />

                <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ bgcolor: indigo[500] }}>
                  Rechercher
                </Button>
              </Box>
            </Paper>

            {/* TABLE RESPONSIVE */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border:'1px solid #EEE', overflowX:'auto' }}
            >
              <Table size="small">

                <TableHead sx={{ bgcolor: indigo[900] }}>
                  <TableRow>
                    <TableCell sx={{color:'white'}}>Tracking</TableCell>
                    <TableCell sx={{color:'white'}}>Expéditeur</TableCell>
                    <TableCell sx={{color:'white'}}>Destinataire</TableCell>

                    <TableCell sx={{color:'white', display:{xs:'none',sm:'table-cell'}}}>
                      Poids
                    </TableCell>

                    <TableCell sx={{color:'white'}}>Montant</TableCell>

                    <TableCell sx={{color:'white', display:{xs:'none',md:'table-cell'}}}>
                      Payé
                    </TableCell>

                    <TableCell sx={{color:'white', display:{xs:'none',md:'table-cell'}}}>
                      Reste
                    </TableCell>

                    <TableCell sx={{color:'white'}}>Paiement</TableCell>
                    <TableCell sx={{color:'white'}}>Statut</TableCell>
                    <TableCell sx={{color:'white'}}>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parcels?.data?.length ? parcels.data.map((c)=>(
                    <TableRow key={c.id} hover>

                      <TableCell>{c.tracking_number}</TableCell>
                      <TableCell>{c.sender_name}</TableCell>
                      <TableCell>{c.recipient_name}</TableCell>

                      <TableCell sx={{display:{xs:'none',sm:'table-cell'}}}>
                        {c.weight_kg} kg
                      </TableCell>

                      <TableCell>{Number(c.price).toLocaleString()} FCFA</TableCell>

                      <TableCell sx={{display:{xs:'none',md:'table-cell'}}}>
                        {Number(c.paid_amount||0).toLocaleString()}
                      </TableCell>

                      <TableCell sx={{display:{xs:'none',md:'table-cell'}}}>
                        {Number(c.remaining_amount||c.price).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <Chip size="small"
                          label={
                            c.payment_type==='partial'?'Partiel':
                            c.payment_type==='full'?'Soldé':'Non payé'
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Chip size="small"
                          label={
                            c.status==='pending'?'En attente':
                            c.status==='in_transit'?'En transit':'Livré'
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={()=>Inertia.get(route('parcels.show',c.id))}>
                            <VisibilityIcon fontSize="small"/>
                          </IconButton>

                          {c.remaining_amount>0 && (
                            <IconButton size="small" color="warning"
                              onClick={()=>Inertia.get(route('parcels.payment.edit',c.id))}>
                              <PaymentsIcon fontSize="small"/>
                            </IconButton>
                          )}

                          <IconButton size="small" onClick={()=>Inertia.get(route('parcels.edit',c.id))}>
                            <EditIcon fontSize="small"/>
                          </IconButton>

                          <IconButton size="small" color="error" onClick={()=>handleDelete(c.id)}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Stack>
                      </TableCell>

                    </TableRow>
                  )):(
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{py:4}}>
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
                count={parcels?.last_page||1}
                page={parcels?.current_page||1}
                onChange={(e,page)=>handlePage(page)}
              />
            </Box>

          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}