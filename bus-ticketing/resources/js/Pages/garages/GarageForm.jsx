import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { Box, Button, Stack, TextField, Typography, Card, CardContent, CardHeader } from "@mui/material";

export default function GarageForm({ garage }) {
    const [name, setName] = useState(garage?.name || "");
    const [address, setAddress] = useState(garage?.address || "");
    const [phone, setPhone] = useState(garage?.phone || "");
    const [email, setEmail] = useState(garage?.email || "");

    const isEdit = Boolean(garage?.id);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = { name, address, phone, email };

        if (isEdit) {
            Inertia.put(route("garages.update", garage.id), payload);
        } else {
            Inertia.post(route("garages.store"), payload);
        }
    };

    return (
        <GuestLayout>
            <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                    <CardHeader
                        title={isEdit ? "Modifier le garage" : "Créer un garage"}
                        sx={{ bgcolor: "#f5f5f5", textAlign: "center" }}
                    />
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField label="Nom du garage" value={name} onChange={e => setName(e.target.value)} required fullWidth />
                                <TextField label="Adresse" value={address} onChange={e => setAddress(e.target.value)} fullWidth />
                                <TextField label="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
                                <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
                                <Box display="flex" justifyContent="space-between" mt={2}>
                                    <Button variant="outlined" onClick={() => Inertia.visit(route("garages.index"))}>Annuler</Button>
                                    <Button type="submit" variant="contained" color="primary">{isEdit ? "Mettre à jour" : "Créer"}</Button>
                                </Box>
                            </Stack>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </GuestLayout>
    );
}
