import React, { useState, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";
import { Payments as PaymentsIcon, History } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";

export default function ParcelPayment({ parcel, payments = [] }) {
  const [paidNow, setPaidNow] = useState("");
  const [error, setError] = useState("");

  // Helper pour formater les montants FCFA en toute sécurité
  const formatFCFA = (amount) => Number(amount ?? 0).toLocaleString() + " FCFA";

  // Calcul du reste après le paiement temporaire
  const remaining = useMemo(() => {
    return Math.max(Number(parcel.remaining_amount ?? 0) - Number(paidNow || 0), 0);
  }, [paidNow, parcel.remaining_amount]);

  // Soumission du paiement
  const handleSubmit = (e) => {
    e.preventDefault();

    const remainingAmount = Number(parcel.remaining_amount ?? 0);
    const paid = Number(paidNow || 0);

    if (!paidNow || paid <= 0) {
      setError("Le montant payé est obligatoire.");
      return;
    }

    if (paid > remainingAmount) {
      setError("Le montant dépasse le reste à payer.");
      return;
    }

    Inertia.post(route("parcels.payment.store", parcel.id), {
      paid_amount: paid,
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 650, mx: "auto", mt: 4 }}>
        {/* ================= FORMULAIRE DE PAIEMENT ================= */}
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E0E0" }}>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <PaymentsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Encaissement du colis
                </Typography>
              </Stack>
            }
            sx={{ bgcolor: "#F8F9FA" }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Typography>
                <strong>Tracking :</strong> {parcel.tracking_number ?? "—"}
              </Typography>

              <Divider />

              <Typography>
                💰 <strong>Montant total :</strong> {formatFCFA(parcel.price)}
              </Typography>

              <Typography color="success.main">
                ✅ <strong>Déjà payé :</strong> {formatFCFA(parcel.paid_amount)}
              </Typography>

              <Typography color="warning.main">
                ⏳ <strong>Reste à payer :</strong> {formatFCFA(parcel.remaining_amount)}
              </Typography>

              <Divider />

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Montant encaissé maintenant (FCFA)"
                type="number"
                value={paidNow}
                onChange={(e) => {
                  setPaidNow(e.target.value);
                  setError("");
                }}
                inputProps={{
                  min: 1,
                  max: parcel.remaining_amount ?? 0,
                }}
                fullWidth
                required
              />

              <Typography color="text.secondary">
                Nouveau reste après paiement : <strong>{formatFCFA(remaining)}</strong>
              </Typography>

              <Button
                variant="contained"
                size="large"
                startIcon={<PaymentsIcon />}
                sx={{ bgcolor: indigo[700], mt: 2 }}
                onClick={handleSubmit}
              >
                Valider le paiement
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ================= HISTORIQUE DES PAIEMENTS ================= */}
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E0E0", mt: 4 }}>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <History color="action" />
                <Typography variant="h6" fontWeight="bold">
                  Historique des paiements
                </Typography>
              </Stack>
            }
            sx={{ bgcolor: "#F8F9FA" }}
          />
          <CardContent>
            {payments.length === 0 ? (
              <Alert severity="info">Aucun paiement enregistré.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell>Moyen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>{p.user?.name || "—"}</TableCell>
                      <TableCell align="right">{formatFCFA(p.amount)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={p.payment_method || "cash"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
