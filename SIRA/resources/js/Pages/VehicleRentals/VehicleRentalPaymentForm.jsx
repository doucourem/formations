import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

export default function VehicleRentalPaymentForm({ rental }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    Inertia.post(
      route("vehicle-rentals.payments.store", rental.id),
      { amount, method, note },
      {
        onFinish: () => setSubmitting(false),
      }
    );
  };

  const paymentMethods = [
    { value: "cash", label: "Espèces" },
    { value: "mobile", label: "Mobile Money" },
    { value: "bank", label: "Virement Bancaire" },
    { value: "cheque", label: "Chèque" },
  ];

  return (
    <Box mt={4} p={2} sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ajouter un paiement 💰
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Montant"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            select
            label="Méthode de paiement"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
          >
            {paymentMethods.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Note (optionnel)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Enregistrement..." : "Ajouter paiement"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}