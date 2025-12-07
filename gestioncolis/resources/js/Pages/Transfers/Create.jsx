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

export default function Create({ senders, receivers }) {
  const [form, setForm] = useState({ sender_id: "", receiver_id: "", amount: "", fees: 0,status: "pending", });

  // Listes dynamiques
  const [allSenders, setAllSenders] = useState(senders);
  const [allReceivers, setAllReceivers] = useState(receivers);

  // Dialogs
  const [openSenderDialog, setOpenSenderDialog] = useState(false);
  const [openReceiverDialog, setOpenReceiverDialog] = useState(false);

  // Nouveaux sender/receiver
  const [newSender, setNewSender] = useState({ name: "", phone: "" });
  const [newReceiver, setNewReceiver] = useState({ name: "", phone: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitTransfer = () => {
    if (!form.sender_id || !form.receiver_id || !form.amount) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    Inertia.post(route("transfers.store"), {
      ...form,
      amount: parseFloat(form.amount),
      fees: parseFloat(form.fees)
    });
  };

  const addSender = () => {
    if (!newSender.name || !newSender.phone) {
      alert("Remplissez les informations de l'expéditeur");
      return;
    }

    Inertia.post(route("senders.store"), newSender, {
      onSuccess: (page) => {
        const createdSender = page.props.sender;
        setAllSenders([...allSenders, createdSender]);
        setForm(prev => ({ ...prev, sender_id: createdSender.id }));
        setOpenSenderDialog(false);
        setNewSender({ name: "", phone: "" });
      }
    });
  };

  const addReceiver = () => {
    if (!newReceiver.name || !newReceiver.phone) {
      alert("Remplissez les informations du destinataire");
      return;
    }

    Inertia.post(route("receivers.store"), newReceiver, {
      onSuccess: (page) => {
        const createdReceiver = page.props.receiver;
        setAllReceivers([...allReceivers, createdReceiver]);
        setForm(prev => ({ ...prev, receiver_id: createdReceiver.id }));
        setOpenReceiverDialog(false);
        setNewReceiver({ name: "", phone: "" });
      }
    });
  };

  return (
    <GuestLayout>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <CardHeader title="Créer un transfert" />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Expéditeur */}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                select
                label="Expéditeur"
                name="sender_id"
                value={form.sender_id}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                {allSenders.map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} - {s.phone}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" onClick={() => setOpenSenderDialog(true)}>+ Expéditeur</Button>
            </Box>

            {/* Destinataire */}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                select
                label="Destinataire"
                name="receiver_id"
                value={form.receiver_id}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                {allReceivers.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name} - {r.phone}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" onClick={() => setOpenReceiverDialog(true)}>+ Destinataire</Button>
            </Box>

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

            <Button variant="contained" onClick={submitTransfer}>
              Enregistrer
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog pour créer un expéditeur */}
      <Dialog open={openSenderDialog} onClose={() => setOpenSenderDialog(false)}>
        <DialogTitle>Ajouter un expéditeur</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom"
            fullWidth
            margin="dense"
            value={newSender.name}
            onChange={(e) => setNewSender(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Téléphone"
            fullWidth
            margin="dense"
            value={newSender.phone}
            onChange={(e) => setNewSender(prev => ({ ...prev, phone: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSenderDialog(false)}>Annuler</Button>
          <Button onClick={addSender} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour créer un destinataire */}
      <Dialog open={openReceiverDialog} onClose={() => setOpenReceiverDialog(false)}>
        <DialogTitle>Ajouter un destinataire</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom"
            fullWidth
            margin="dense"
            value={newReceiver.name}
            onChange={(e) => setNewReceiver(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Téléphone"
            fullWidth
            margin="dense"
            value={newReceiver.phone}
            onChange={(e) => setNewReceiver(prev => ({ ...prev, phone: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiverDialog(false)}>Annuler</Button>
          <Button onClick={addReceiver} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
