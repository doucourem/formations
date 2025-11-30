// Create.jsx - Formulaire dépôt + expéditeur + destinataire
import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Box, Card, CardHeader, CardContent, TextField, Button, MenuItem } from "@mui/material";

export default function Create({ senders, receivers }) {
  const [form, setForm] = useState({ sender_id: "", receiver_id: "", amount: "", fees: 0 });

  const submit = () => {
    Inertia.post(route("transfers.store"), form);
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <CardHeader title="Créer un transfert" />
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

          <Button variant="contained" onClick={submit}>Enregistrer</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
