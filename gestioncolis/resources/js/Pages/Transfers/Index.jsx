import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout"; // 🔄 Changé ici

import {
  Box, Card, CardHeader, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, TextField, IconButton,
  Pagination, MenuItem, Chip
} from "@mui/material";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Paid as PaidIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import { green, indigo } from '@mui/material/colors';

export default function Index({ transfers, filters }) {
  const [perPage, setPerPage] = useState(filters?.per_page || 10);
  const [sender, setSender] = useState(filters?.sender || "");
  const [receiver, setReceiver] = useState(filters?.receiver || "");
  const [code, setCode] = useState(filters?.code || "");
  const [status, setStatus] = useState(filters?.status || "");

  const filtrer = () => {
    Inertia.get(route("transfers.index"),
      { per_page: perPage, sender, receiver, code, status },
      { preserveState: true }
    );
  };

  const handlePage = (page) => {
    Inertia.get(route("transfers.index"),
      { per_page: perPage, sender, receiver, code, status, page },
      { preserveState: true }
    );
  };

  const handlePayment = async (transferId, amount) => {
    if (!confirm("Confirmer le paiement ?")) return;
    try {
      const token = document.querySelector('meta[name="csrf-token"]').content;
      const response = await fetch(route("payment.process"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        credentials: "same-origin",
        body: JSON.stringify({ transfer_id: transferId, amount }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Paiement effectué !");
        Inertia.reload();
      } else {
        alert("Échec : " + data.message);
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  return (
    <GuestLayout> {/* 🔑 Utilise maintenant le Layout avec Sidebar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color={indigo[900]}>
          Transferts d'argent
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestion des envois et retraits de fonds
        </Typography>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E0E0E0' }}>
        <CardHeader
          title={<Typography variant="h6">Liste des transactions</Typography>}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                sx={{ bgcolor: indigo[700] }}
                startIcon={<AddIcon />}
                onClick={() => Inertia.get(route("transfers.create"))}
              >
                Nouveau transfert
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<VisibilityIcon />}
                onClick={() => Inertia.get(route("transfers.daily"))}
              >
                Journalier
              </Button>
            </Box>
          }
        />

        <CardContent>
          {/* Section Filtres */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", p: 2, bgcolor: '#F8F9FA', borderRadius: 2 }}>
            <TextField size="small" label="Expéditeur" value={sender} onChange={(e) => setSender(e.target.value)} sx={{ flexGrow: 1 }} />
            <TextField size="small" label="Destinataire" value={receiver} onChange={(e) => setReceiver(e.target.value)} sx={{ flexGrow: 1 }} />
            <TextField size="small" label="Code" value={code} onChange={(e) => setCode(e.target.value)} sx={{ width: 150 }} />
            <TextField
              select size="small" label="Statut" value={status}
              onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="ready">Prêt</MenuItem>
              <MenuItem value="withdrawn">Retiré</MenuItem>
            </TextField>
            <Button variant="contained" onClick={filtrer} sx={{ bgcolor: indigo[500] }}>Filtrer</Button>
          </Box>

          {/* Tableau */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #EEE' }}>
            <Table>
              <TableHead sx={{ bgcolor: indigo[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Réf</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Expéditeur</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Destinataire</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Montant</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Paiement</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.data.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>#{t.id}</TableCell>
                    <TableCell>{t.sender_name}</TableCell>
                    <TableCell>{t.receiver_name}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t.amount.toLocaleString()} CFA</TableCell>
                    <TableCell><Chip label={t.code} size="small" sx={{ fontWeight: 'bold', bgcolor: '#FFF9C4' }} /></TableCell>
                    <TableCell>
                       <Chip 
                        label={t.status} 
                        size="small"
                        color={t.status === 'withdrawn' ? 'success' : t.status === 'pending' ? 'warning' : 'primary'}
                       />
                    </TableCell>
                    <TableCell>
                      {t.paid ? (
                        <Chip icon={<PaidIcon />} label="Payé" size="small" sx={{ bgcolor: green[100], color: green[800] }} />
                      ) : (
                        <Button
                          variant="contained" color="success" size="small"
                          onClick={() => handlePayment(t.id, t.amount)}
                        >
                          Payer
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="info" onClick={() => Inertia.get(route("transfers.show", t.id))}><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="primary" onClick={() => Inertia.get(route("transfers.edit", t.id))}><EditIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3} display="flex" justifyContent="center">
            <Pagination count={transfers.last_page} page={transfers.current_page} onChange={(e, page) => handlePage(page)} color="primary" />
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}