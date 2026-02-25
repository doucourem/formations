import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Grid,
  Divider
} from '@mui/material';
import dayjs from 'dayjs';

export default function Show({ transfer }) {
  const statusFr = {
    pending: "En attente",
    sent: "Envoyé",
    ready: "Prêt au retrait",
    withdrawn: "Retiré",
  };

  const handlePrint = () => window.print();

  const Item = ({ label, value }) => (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value || "-"}
      </Typography>
    </Box>
  );

  return (
    <GuestLayout>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 4 },
          maxWidth: 900,
          mx: "auto"
        }}
      >
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={`Transfert #${transfer.id}`}
            action={
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  "@media print": { display: "none" }
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => Inertia.get(route('transfers.index'))}
                >
                  Retour
                </Button>

                <Button
                  variant="outlined"
                  onClick={handlePrint}
                >
                  Imprimer
                </Button>
              </Stack>
            }
          />

          <Divider />

          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Item label="Expéditeur" value={transfer.sender?.name} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item label="Destinataire" value={transfer.receiver?.name} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item
                  label="Montant"
                  value={`${(transfer.amount ?? 0).toLocaleString()} FCFA`}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item
                  label="Code retrait"
                  value={transfer.withdraw_code}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item
                  label="Statut"
                  value={statusFr[transfer.status]}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Item
                  label="Date"
                  value={
                    transfer.created_at
                      ? dayjs(transfer.created_at).format('DD/MM/YYYY HH:mm')
                      : "-"
                  }
                />
              </Grid>

              {transfer.payment_proof && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Preuve de paiement
                  </Typography>

                  <Button
                    href={`/storage/${transfer.payment_proof}`}
                    target="_blank"
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Voir la preuve
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}