import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import { Card, CardHeader, CardContent, Typography, Box, Button, Stack } from '@mui/material';
import dayjs from 'dayjs'; // Pour formater la date

export default function Show({ transfer }) {
  const statusFr = {
    pending: "En attente",
    sent: "Envoyé",
    ready: "Prêt au retrait",
    withdrawn: "Retiré",
  };

  // Fonction pour imprimer la page
  const handlePrint = () => {
    window.print();
  };

  return (
    <GuestLayout>
      <Box p={3}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={`Transfert #${transfer.id}`}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => Inertia.get(route('transfers.index'))}
                >
                  Retour à la liste
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handlePrint}
                >
                  Imprimer
                </Button>
              </Stack>
            }
          />
          <CardContent>
            <Typography>
              <strong>Expéditeur :</strong> {transfer.sender?.name || "-"}
            </Typography>
            <Typography>
              <strong>Destinataire :</strong> {transfer.receiver?.name || "-"}
            </Typography>
            <Typography>
              <strong>Montant :</strong> {(transfer.amount ?? 0).toLocaleString()} FCFA
            </Typography>
            <Typography>
              <strong>Code retrait :</strong> {transfer.withdraw_code || "-"}
            </Typography>
            <Typography>
              <strong>Statut :</strong> {statusFr[transfer.status] || "-"}
            </Typography>
            <Typography>
              <strong>Date :</strong> {transfer.created_at ? dayjs(transfer.created_at).format('DD/MM/YYYY HH:mm') : "-"}
            </Typography>

            {transfer.payment_proof && (
              <Typography mt={2}>
                <strong>Preuve :</strong>{" "}
                <a
                  href={`/storage/${transfer.payment_proof}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir
                </a>
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
