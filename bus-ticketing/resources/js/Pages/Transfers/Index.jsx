import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
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
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Index({ transfers, filters }) {
  const [perPage, setPerPage] = useState(filters?.per_page || 10);
  const [sender, setSender] = useState(filters?.sender || "");
  const [receiver, setReceiver] = useState(filters?.receiver || "");
  const [code, setCode] = useState(filters?.code || "");
  const [status, setStatus] = useState(filters?.status || "");

  // Filtrer la liste
  const filtrer = () => {
    Inertia.get(
      route("transfers.index"),
      { per_page: perPage, sender, receiver, code, status },
      { preserveState: true }
    );
  };

  // Supprimer un transfert
  const handleDelete = (id) => {
    if (confirm("Voulez-vous supprimer ce transfert ?")) {
      Inertia.delete(route("transfers.destroy", id), { preserveState: true });
    }
  };

  // Pagination
  const handlePage = (page) => {
    Inertia.get(
      route("transfers.index"),
      { per_page: perPage, sender, receiver, code, status, page },
      { preserveState: true }
    );
  };

  // Paiement depuis la liste
  const handlePayment = async (transferId, amount) => {
    if (!confirm("Confirmer le paiement ?")) return;

    try {
      const response = await fetch(route("payment.process"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transfer_id: transferId, amount }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Paiement effectué !");
        Inertia.reload(); // rafraîchit la liste
      } else {
        alert("Échec du paiement : " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors du paiement");
    }
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">💸 Transferts d’argent</Typography>}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route("transfers.create"))}
            >
              Nouveau transfert
            </Button>
          }
        />

        <CardContent>
          {/* Filtres */}
          <Box display="flex" gap={2} mb={3} alignItems="flex-end">
            <TextField
              label="Expéditeur"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              fullWidth
            />

            <TextField
              label="Destinataire"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              fullWidth
            />

            <TextField
              label="Code retrait"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Statut"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="sent">Envoyé</MenuItem>
              <MenuItem value="ready">Prêt au retrait</MenuItem>
              <MenuItem value="withdrawn">Retiré</MenuItem>
            </TextField>

            <Button variant="contained" onClick={filtrer}>
              Filtrer
            </Button>
          </Box>

          {/* TABLE */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Expéditeur</TableCell>
                  <TableCell>Destinataire</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Paiement</TableCell>
                  <TableCell>Preuve</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {transfers.data.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.sender_name}</TableCell>
                    <TableCell>{t.receiver_name}</TableCell>
                    <TableCell>{t.amount} CFA</TableCell>
                    <TableCell>{t.code}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>{t.created_at}</TableCell>

                    {/* Paiement */}
                    <TableCell>
                      {t.paid ? (
                        <strong style={{ color: "green" }}>Payé ✅</strong>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handlePayment(t.id, t.amount)}
                        >
                          Payer
                        </Button>
                      )}
                    </TableCell>

                    {/* Preuve */}
                    <TableCell>
                      {t.payment_proof ? (
                        <a
                          href={`/storage/${t.payment_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir
                        </a>
                      ) : (
                        "Aucune"
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => Inertia.get(route("transfers.edit", t.id))}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(t.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={transfers.last_page}
              page={transfers.current_page}
              onChange={(e, page) => handlePage(page)}
            />
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
