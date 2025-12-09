import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box, Card, CardHeader, CardContent,
  TextField, Button, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Edit({ transfer, senders, receivers, thirdParties }) {
  const [form, setForm] = useState({
    sender_id: transfer.sender_id,
    receiver_id: transfer.receiver_id,
    third_party_id: transfer.third_party_id || "",
    amount: transfer.amount,
    fees: transfer.fees,
  });

  // Listes dynamiques
  const [allSenders, setAllSenders] = useState(senders || []);
  const [allReceivers, setAllReceivers] = useState(receivers || []);
  const [allThirds, setAllThirds] = useState(thirdParties || []);

  // Dialogs séparés
  const [openSenderDialog, setOpenSenderDialog] = useState(false);
  const [openReceiverDialog, setOpenReceiverDialog] = useState(false);
  const [openThirdDialog, setOpenThirdDialog] = useState(false);

  // Nouveaux objets
  const [newSender, setNewSender] = useState({ name: "", phone: "" });
  const [newReceiver, setNewReceiver] = useState({ name: "", phone: "" });
  const [newThird, setNewThird] = useState({ name: "", phone: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Calcul automatique des frais 2%
  useEffect(() => {
    const amount = parseFloat(form.amount) || 0;
    setForm(prev => ({ ...prev, fees: amount * 0.02 }));
  }, [form.amount]);

  const submit = () => {
    if (!form.sender_id || !form.receiver_id || !form.third_party_id || !form.amount) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    Inertia.put(route("transfers.update", transfer.id), {
      ...form,
      amount: parseFloat(form.amount),
      fees: parseFloat(form.fees),
    });
  };

  // Fonctions pour ajouter dans chaque table
  const addSender = () => {
    if (!newSender.name || !newSender.phone) return alert("Remplissez l'expéditeur");
    Inertia.post(route("senders.store"), newSender, {
      onSuccess: (page) => {
        const created = page.props.sender;
        setAllSenders([...allSenders, created]);
        setForm(prev => ({ ...prev, sender_id: created.id }));
        setNewSender({ name: "", phone: "" });
        setOpenSenderDialog(false);
      }
    });
  };

  const addReceiver = () => {
    if (!newReceiver.name || !newReceiver.phone) return alert("Remplissez le destinataire");
    Inertia.post(route("receivers.store"), newReceiver, {
      onSuccess: (page) => {
        const created = page.props.receiver;
        setAllReceivers([...allReceivers, created]);
        setForm(prev => ({ ...prev, receiver_id: created.id }));
        setNewReceiver({ name: "", phone: "" });
        setOpenReceiverDialog(false);
      }
    });
  };

  const addThird = () => {
    if (!newThird.name || !newThird.phone) return alert("Remplissez le tiers");
    Inertia.post(route("third_parties.store"), newThird, {
      onSuccess: (page) => {
        const created = page.props.third_party;
        setAllThirds([...allThirds, created]);
        setForm(prev => ({ ...prev, third_party_id: created.id }));
        setNewThird({ name: "", phone: "" });
        setOpenThirdDialog(false);
      }
    });
  };

  const renderSelect = (label, valueKey, list, openDialogFunc) => (
    <Box display="flex" gap={1} alignItems="center" mt={1}>
      <TextField
        select
        label={label}
        name={valueKey}
        value={form[valueKey]}
        onChange={handleChange}
        sx={{ flex: 1 }}
      >
        {list.map(c => (
          <MenuItem key={c.id} value={c.id}>
            {c.name} - {c.phone}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" onClick={openDialogFunc}>+ Ajouter</Button>
    </Box>
  );

  return (
    <GuestLayout>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <CardHeader title="Modifier le transfert" />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {renderSelect("Expéditeur", "sender_id", allSenders, () => setOpenSenderDialog(true))}
            {renderSelect("Destinataire", "receiver_id", allReceivers, () => setOpenReceiverDialog(true))}
            {renderSelect("Tiers", "third_party_id", allThirds, () => setOpenThirdDialog(true))}

            <TextField
              label="Montant"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
            />

            <TextField
              label="Frais (calcul automatique 2%)"
              type="number"
              name="fees"
              value={form.fees}
              InputProps={{ readOnly: true }}
            />

            <Button variant="contained" onClick={submit}>Mettre à jour</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialogues séparés */}
      <Dialog open={openSenderDialog} onClose={() => setOpenSenderDialog(false)}>
        <DialogTitle>Ajouter un expéditeur</DialogTitle>
        <DialogContent>
          <TextField label="Nom" fullWidth margin="dense" value={newSender.name} onChange={e => setNewSender(prev => ({ ...prev, name: e.target.value }))} />
          <TextField label="Téléphone" fullWidth margin="dense" value={newSender.phone} onChange={e => setNewSender(prev => ({ ...prev, phone: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSenderDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={addSender}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReceiverDialog} onClose={() => setOpenReceiverDialog(false)}>
        <DialogTitle>Ajouter un destinataire</DialogTitle>
        <DialogContent>
          <TextField label="Nom" fullWidth margin="dense" value={newReceiver.name} onChange={e => setNewReceiver(prev => ({ ...prev, name: e.target.value }))} />
          <TextField label="Téléphone" fullWidth margin="dense" value={newReceiver.phone} onChange={e => setNewReceiver(prev => ({ ...prev, phone: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiverDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={addReceiver}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openThirdDialog} onClose={() => setOpenThirdDialog(false)}>
        <DialogTitle>Ajouter un tiers</DialogTitle>
        <DialogContent>
          <TextField label="Nom" fullWidth margin="dense" value={newThird.name} onChange={e => setNewThird(prev => ({ ...prev, name: e.target.value }))} />
          <TextField label="Téléphone" fullWidth margin="dense" value={newThird.phone} onChange={e => setNewThird(prev => ({ ...prev, phone: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenThirdDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={addThird}>Ajouter</Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
