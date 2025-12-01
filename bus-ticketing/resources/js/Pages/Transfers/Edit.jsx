import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Box, Card, CardHeader, CardContent, TextField, Button, MenuItem } from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Edit({ transfer, senders, receivers }) {
  const [form, setForm] = useState({
    sender_id: transfer.sender_id,
    receiver_id: transfer.receiver_id,
    amount: transfer.amount,
    fees: transfer.fees,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = () => {
    if (!form.sender_id || !form.receiver_id || !form.amount) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    Inertia.put(route("transfers.update", transfer.id), {
      ...form,
      amount: parseFloat(form.amount),
      fees: parseFloat(form.fees),
    });
  };

  return (
    <GuestLayout>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <CardHeader title="Modifier le transfert" />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Expéditeur"
              name="sender_id"
              value={form.sender_id}
              onChange={handleChange}
            >
              {senders.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} - {s.phone}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Destinataire"
              name="receiver_id"
              value={form.receiver_id}
              onChange={handleChange}
            >
              {receivers.map(r => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} - {r.phone}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Montant"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
            />

            <TextField
              label="Frais"
              type="number"
              name="fees"
              value={form.fees}
              onChange={handleChange}
            />

            <Button variant="contained" onClick={submit}>
              Mettre à jour
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
