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
import PaidIcon from "@mui/icons-material/Paid";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { green } from '@mui/material/colors';


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
    // Récupérer le token CSRF depuis la balise meta
    const token = document.querySelector('meta[name="csrf-token"]').content;

    const response = await fetch(route("payment.process"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": token, // 🔑 obligatoire pour Laravel
      },
      credentials: "same-origin", // 🔑 pour envoyer les cookies de session
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
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => Inertia.get(route("transfers.create"))}
      >
        Nouveau transfert
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        startIcon={<VisibilityIcon />}
        onClick={() => Inertia.get(route("transfers.daily"))} // ← ici
      >
        Transferts par jour
      </Button>
    </Box>
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

          {/* Table des transferts */}
          <TableContainer component={Paper}>
            <Table>
                <TableHead sx={{ bgcolor: "#1565c0" }}>
  <TableRow>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Expéditeur</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Destinataire</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Montant</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Code</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Statut</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Paiement</TableCell>
    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Preuve</TableCell>
    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
      Actions
    </TableCell>
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
                 <TableCell>
  <Box
    sx={{
      display: "inline-flex",
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      fontWeight: "bold",
      color: "white",
      bgcolor:
        t.status === "pending"
          ? "warning.main"
          : t.status === "sent"
          ? "info.main"
          : t.status === "ready"
          ? "primary.main"
          : t.status === "withdrawn"
          ? "success.main"
          : "grey.500",
      textTransform: "capitalize",
    }}
  >
    {t.status === "pending"
      ? "En attente"
      : t.status === "sent"
      ? "Envoyé"
      : t.status === "ready"
      ? "Prêt au retrait"
      : t.status === "withdrawn"
      ? "Retiré"
      : t.status}
  </Box>
</TableCell>

                    <TableCell>{t.created_at}</TableCell>

                    {/* Paiement */}
                    <TableCell>
                      {t.paid ? (
                        

<Box
  sx={{
    display: 'inline-flex',
    alignItems: 'center',
    bgcolor: green[500],
    color: 'white',
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    fontWeight: 'bold',
  }}
>
  <PaidIcon sx={{ mr: 0.5, fontSize: 16 }} />
  Payé
</Box>

                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<PaidIcon />}
                          sx={{
                            fontWeight: "bold",
                            textTransform: "none",
                            boxShadow: 3,
                            "&:hover": { boxShadow: 6 },
                          }}
                          onClick={() => handlePayment(t.id, t.amount)}
                        >
                          Payer
                        </Button>
                      )}
                    </TableCell>

                    {/* Preuve de paiement */}
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
  {/* Voir le détail */}
  <IconButton
    color="info"
    onClick={() => Inertia.get(route("transfers.show", t.id))}
    title="Voir le détail"
  >
    <VisibilityIcon />
  </IconButton>

  {/* Modifier */}
  <IconButton
    color="primary"
    onClick={() => Inertia.get(route("transfers.edit", t.id))}
  >
    <EditIcon />
  </IconButton>

  {/* Supprimer */}
  <IconButton color="error" onClick={() => handleDelete(t.id)}>
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
