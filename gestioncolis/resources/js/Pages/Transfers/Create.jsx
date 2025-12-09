import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ senders: initialSenders, receivers: initialReceivers, thirdParties: initialThirds }) {
  const [form, setForm] = useState({
    sender_id: "",
    receiver_id: "",
    third_party_id: "",
    amount: "",
    fees: 0,
    status: "pending",
  });

  // Tables séparées
  const [senders, setSenders] = useState(initialSenders || []);
  const [receivers, setReceivers] = useState(initialReceivers || []);
  const [thirdParties, setThirdParties] = useState(initialThirds || []);

  // Dialogs
  const [openSenderDialog, setOpenSenderDialog] = useState(false);
  const [openReceiverDialog, setOpenReceiverDialog] = useState(false);
  const [openThirdDialog, setOpenThirdDialog] = useState(false);

  // Nouveaux éléments
  const [newSender, setNewSender] = useState({ name: "", phone: "" });
  const [newReceiver, setNewReceiver] = useState({ name: "", phone: "" });
  const [newThird, setNewThird] = useState({ name: "", phone: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitTransfer = () => {
    const { sender_id, receiver_id, third_party_id, amount, fees } = form;
    if (!sender_id || !receiver_id || !third_party_id || !amount) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    Inertia.post(route("transfers.store"), {
      ...form,
      amount: parseFloat(amount),
      fees: parseFloat(fees)
    });
  };

  // Fonctions pour ajouter chaque type
  const addSender = () => {
    if (!newSender.name || !newSender.phone) return alert("Remplissez toutes les informations de l'expéditeur.");
    Inertia.post(route("senders.store"), newSender, {
      onSuccess: (page) => {
        const created = page.props.sender;
        setSenders([...senders, created]);
        setForm(prev => ({ ...prev, sender_id: created.id }));
        setNewSender({ name: "", phone: "" });
        setOpenSenderDialog(false);
      }
    });
  };

  const addReceiver = () => {
    if (!newReceiver.name || !newReceiver.phone) return alert("Remplissez toutes les informations du destinataire.");
    Inertia.post(route("receivers.store"), newReceiver, {
      onSuccess: (page) => {
        const created = page.props.receiver;
        setReceivers([...receivers, created]);
        setForm(prev => ({ ...prev, receiver_id: created.id }));
        setNewReceiver({ name: "", phone: "" });
        setOpenReceiverDialog(false);
      }
    });
  };

  const addThird = () => {
    if (!newThird.name || !newThird.phone) return alert("Remplissez toutes les informations du tiers.");
    Inertia.post(route("third_parties.store"), newThird, {
      onSuccess: (page) => {
        const created = page.props.third_party;
        setThirdParties([...thirdParties, created]);
        setForm(prev => ({ ...prev, third_party_id: created.id }));
        setNewThird({ name: "", phone: "" });
        setOpenThirdDialog(false);
      }
    });
  };

  const renderSelect = (label, roleKey, data, openDialogFunc) => (
    <Box display="flex" gap={1} alignItems="center" mt={1}>
      <TextField
        select
        label={label}
        name={roleKey}
        value={form[roleKey]}
        onChange={handleChange}
        sx={{ flex: 1 }}
      >
        {data.map(item => (
          <MenuItem key={item.id} value={item.id}>{item.name} - {item.phone}</MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" onClick={openDialogFunc}>+ {label}</Button>
    </Box>
  );

  return (
    <GuestLayout>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <CardHeader title="Créer un transfert" />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {renderSelect("Expéditeur", "sender_id", senders, () => setOpenSenderDialog(true))}
            {renderSelect("Destinataire", "receiver_id", receivers, () => setOpenReceiverDialog(true))}
            {renderSelect("Tiers", "third_party_id", thirdParties, () => setOpenThirdDialog(true))}

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

            <Button variant="contained" onClick={submitTransfer}>Enregistrer</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={openSenderDialog} onClose={() => setOpenSenderDialog(false)}>
        <DialogTitle>Ajouter un expéditeur</DialogTitle>
        <DialogContent>
          <TextField label="Nom" fullWidth margin="dense" value={newSender.name} onChange={e => setNewSender(prev => ({...prev, name: e.target.value}))} />
          <TextField label="Téléphone" fullWidth margin="dense" value={newSender.phone} onChange={e => setNewSender(prev => ({...prev, phone: e.target.value}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSenderDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={addSender}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReceiverDialog} onClose={() => setOpenReceiverDialog(false)}>
        <DialogTitle>Ajouter un destinataire</DialogTitle>
        <DialogContent>
          <TextField label="Nom" fullWidth margin="dense" value={newReceiver.name} onChange={e => setNewReceiver(prev => ({...prev, name: e.target.value}))} />
          <TextField label="Téléphone" fullWidth margin="dense" value={newReceiver.phone} onChange={e => setNewReceiver(prev => ({...prev, phone: e.target.value}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiverDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={addReceiver}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openThirdDialog} onClose={() => setOpenThirdDialog(false)}>
        <DialogTitle>Ajouter un client</DialogTitle>
        <DialogContent>
          <TextField label="Nom" fullWidth margin="dense" value={newThird.name} onChange={e => setNewThird(prev => ({...prev, name: e.target.value}))} />
          <TextField label="Téléphone" fullWidth margin="dense" value={newThird.phone} onChange={e => setNewThird(prev => ({...prev, phone: e.target.value}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenThirdDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={addThird}>Ajouter</Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
