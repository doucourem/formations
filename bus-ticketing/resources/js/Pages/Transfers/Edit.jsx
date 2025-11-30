// Edit.jsx - Modifier un transfert d'argent
import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Box, Card, CardHeader, CardContent, TextField, Button, MenuItem } from "@mui/material";

export default function Edit({ transfer, senders, receivers }) {
  const [form, setForm] = useState({
    sender_id: transfer.sender_id,
    receiver_id: transfer.receiver_id,
    amount: transfer.amount,
    fees: transfer.fees,
  });

  const submit = () => {
    Inertia.put(route("transfers.update", transfer.id), form);
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <CardHeader title="Modifier le transfert" />
      <CardContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField select label="Expéditeur" value={form.sender_id} onChange={(e)=>setForm({...form, sender_id: e.target.value})}>
            {senders.map(s => <MenuItem key={s.id} value={s.id}>{s.name} - {s.phone}</MenuItem>)}
          </TextField>

          <TextField select label="Destinataire" value={form.receiver_id} onChange={(e)=>setForm({...form, receiver_id: e.target.value})}>
            {receivers.map(r => <MenuItem key={r.id} value={r.id}>{r.name} - {r.phone}</MenuItem>)}
          </TextField>

          <TextField label="Montant" type="number" value={form.amount} onChange={(e)=>setForm({...form, amount: e.target.value})} />
          <TextField label="Frais" type="number" value={form.fees} onChange={(e)=>setForm({...form, fees: e.target.value})} />

          <Button variant="contained" onClick={submit}>Mettre à jour</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
