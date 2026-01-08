import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Card, CardHeader, CardContent, Typography, Box, Button, Divider, Grid } from '@mui/material';
import { Download as DownloadIcon, LocalShipping, Person } from '@mui/icons-material';
import { jsPDF } from "jspdf";

const STATUS_FR = {
    pending: "En attente",
    in_transit: "En transit",
    delivered: "Livré",
};

const BLUE_MUI = [63, 81, 181];

export default function ParcelDetail({ parcel }) {

    const getBase64ImageFromURL = (url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = url;
    });

    const addPDFHeader = (doc) => {
        doc.setFillColor(...BLUE_MUI);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.text("REÇU DE TRANSPORT - COLIS", 20, 25);
    };

    const addPDFDetails = async (doc) => {
        let yPos = 55;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Émis le : ${new Date().toLocaleString()}`, 140, yPos);
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text(`Tracking : ${parcel.tracking_number || parcel.id}`, 20, yPos);

        if (parcel.image_url) {
            try {
                const imgData = await getBase64ImageFromURL(parcel.image_url);
                doc.addImage(imgData, 'PNG', 150, 65, 40, 40);
            } catch {
                console.warn("L'image n'a pas pu être chargée pour le PDF");
            }
        }

        yPos += 30;
        doc.setDrawColor(200);
        doc.line(20, yPos, 190, yPos);

        yPos += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EXPÉDITEUR", 20, yPos);
        doc.text("DESTINATAIRE", 110, yPos);

        yPos += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`${parcel.sender_name || "-"}`, 20, yPos);
        doc.text(`${parcel.recipient_name || "-"}`, 110, yPos);

        yPos += 6;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Agence : ${parcel.senderAgency?.name || "-"}`, 20, yPos);
        doc.text(`Agence : ${parcel.recipientAgency?.name || "-"}`, 110, yPos);

        return yPos + 25;
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();
        addPDFHeader(doc);
        let yPos = await addPDFDetails(doc);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("DÉTAILS TECHNIQUES", 20, yPos);

        yPos += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        [
            `Poids : ${parcel.weight_kg ?? "-" } kg`,
            `Statut : ${STATUS_FR[parcel.status] || "-" }`,
            `Description : ${parcel.description || "N/A"}`
        ].forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 7;
        });

        yPos += 10;
        doc.setFillColor(240);
        doc.rect(20, yPos, 170, 15, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(`MONTANT PAYÉ : ${(parcel.price ?? 0).toLocaleString()} FCFA`, 25, yPos + 10);

        if (parcel.trip) {
            yPos += 30;
            doc.setFontSize(12);
            doc.text("INFORMATIONS DE TRANSIT", 20, yPos);
            yPos += 8;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Trajet : ${parcel.trip.departureCity} -> ${parcel.trip.arrivalCity}`, 20, yPos);
            yPos += 6;
            doc.text(`Véhicule : ${parcel.trip.bus?.registration_number || "Non assigné"}`, 20, yPos);
        }

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Ce document sert de preuve officielle de dépôt de colis.", 105, 285, { align: "center" });

        doc.save(`recu_colis_${parcel.tracking_number || parcel.id}.pdf`);
    };

    return (
        <GuestLayout>
            <Box p={4} sx={{ maxWidth: 900, mx: 'auto' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" fontWeight="bold">Détails de l'expédition</Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<DownloadIcon />} 
                        onClick={handleDownloadPDF}
                        size="large"
                    >
                        Exporter en PDF
                    </Button>
                </Box>

                <Card elevation={4} sx={{ borderRadius: 4 }}>
                    <CardHeader 
                        avatar={<LocalShipping color="primary" />}
                        title={<Typography variant="h6">Colis #{parcel.tracking_number || parcel.id}</Typography>}
                        subheader={`Statut actuel : ${STATUS_FR[parcel.status]}`}
                        sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}
                    />
                    <CardContent>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Box
                                    component="img"
                                    src={parcel.parcel_image || ''}
                                    alt="Image du colis"
                                    sx={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 2, boxShadow: 1, mb: 3 }}
                                />
                                {parcel.trip && (
                                    <Box p={2} sx={{ bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                        <Typography variant="subtitle2" color="primary" gutterBottom>Voyage Associé</Typography>
                                        <Typography variant="body2"><strong>{parcel.trip.departureCity}</strong></Typography>
                                        <Typography variant="body2" sx={{ my: 0.5 }}>↓</Typography>
                                        <Typography variant="body2"><strong>{parcel.trip.arrivalCity}</strong></Typography>
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    {['sender', 'recipient'].map((role, idx) => (
                                        <Grid item xs={6} key={role}>
                                            <Typography color="textSecondary" variant="caption" display="block">
                                                <Person fontSize="inherit" /> {role === 'sender' ? 'EXPÉDITEUR' : 'DESTINATAIRE'}
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">{parcel[`${role}_name`]}</Typography>
                                            <Typography variant="body2">{parcel[`${role}Agency`]?.name}</Typography>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography><strong>Poids :</strong> {parcel.weight_kg} kg</Typography>
                                    <Typography variant="h6" color="primary"><strong>{parcel.price?.toLocaleString()} FCFA</strong></Typography>
                                </Box>

                                <Typography variant="subtitle2" gutterBottom>Description du contenu :</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                    {parcel.description || "Aucune description fournie."}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </GuestLayout>
    );
}
