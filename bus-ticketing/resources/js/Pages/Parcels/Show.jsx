import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import {
  Download as DownloadIcon,
  LocalShipping,
  Person,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import ParcelTicket80mm from './ParcelTicket80mm'; // adapte le chemin


/* ===============================
   CONSTANTES
================================ */
const STATUS_FR = {
  pending: "En attente",
  in_transit: "En transit",
  delivered: "Livré",
};

const BLUE_MUI = [63, 81, 181];

/* ===============================
   UTILITAIRES
================================ */
const getBase64ImageFromURL = (url) =>
  new Promise((resolve, reject) => {
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

const getQRCodeBase64 = async (text) => {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    text
  )}`;
  return await getBase64ImageFromURL(url);
};

const numberToWordsFR = (n) => {
  const u = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const d = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];

  const conv = (x) => {
    if (x < 10) return u[x];
    if (x < 20)
      return (
        ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"][x - 10] ||
        `dix-${u[x - 10]}`
      );
    if (x < 70)
      return d[Math.floor(x / 10)] + (x % 10 ? "-" + u[x % 10] : "");
    if (x < 80) return "soixante-" + conv(x - 60);
    return "quatre-vingt" + (x % 20 ? "-" + conv(x - 80) : "");
  };

  let r = "";
  if (n >= 1_000_000) {
    r += conv(Math.floor(n / 1_000_000)) + " million ";
    n %= 1_000_000;
  }
  if (n >= 1_000) {
    r += conv(Math.floor(n / 1_000)) + " mille ";
    n %= 1_000;
  }
  if (n >= 100) {
    r += u[Math.floor(n / 100)] + " cent ";
    n %= 100;
  }
  if (n > 0) r += conv(n);

  return r.trim() || "zéro";
};

/* ===============================
   COMPONENT
================================ */
export default function ParcelDetail({ parcel }) {
    const amount = Number(parcel.price) || 0;
  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    

    /* HEADER */
    doc.setFillColor(...BLUE_MUI);
    doc.rect(0, 0, 210, 35, "F");
    doc.setFontSize(20);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("REÇU DE TRANSPORT - COLIS", 20, 23);

    let y = 50;
    doc.setTextColor(40);
    doc.setFontSize(12);
    doc.text(`Tracking : ${parcel.tracking_number || parcel.id}`, 20, y);
    doc.setFontSize(10);
    doc.text(`Émis le : ${new Date().toLocaleString("fr-FR")}`, 140, y);

    /* IMAGE */
    if (parcel.parcel_image) {
      try {
        const img = await getBase64ImageFromURL(`/storage/${parcel.parcel_image}`);
        doc.addImage(img, "PNG", 150, 60, 40, 40);
      } catch {}
    }

    y += 20;
    doc.line(20, y, 190, y);

    /* EXP / DEST */
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("EXPÉDITEUR", 20, y);
    doc.text("DESTINATAIRE", 110, y);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text(parcel.sender_name || "-", 20, y);
    doc.text(parcel.recipient_name || "-", 110, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Agence : ${parcel.senderAgency?.name || "-"}`, 20, y);
    doc.text(`Agence : ${parcel.recipientAgency?.name || "-"}`, 110, y);

    /* DETAILS */
    y += 15;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Poids : ${parcel.weight_kg ?? "-"} kg`, 20, y);
    y += 6;
    doc.text(`Statut : ${STATUS_FR[parcel.status]}`, 20, y);

    /* MONTANT */
    y += 12;
    doc.setFillColor(240);
    doc.rect(20, y, 170, 15, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `MONTANT PAYÉ : ${amount.toLocaleString("fr-FR")} FCFA`,
      25,
      y + 10
    );

    y += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const words = doc.splitTextToSize(
      `Arrêté le présent reçu à la somme de : ${numberToWordsFR(
        amount
      )} francs CFA`,
      170
    );
    doc.text(words, 20, y);

    /* QR CODE */
    const qr = await getQRCodeBase64(parcel.tracking_number || parcel.id);
    doc.addImage(qr, "PNG", 85, 240, 40, 40);
    doc.setFontSize(8);
    doc.text("Scanner pour le suivi", 105, 283, { align: "center" });

    doc.save(`recu_colis_${parcel.tracking_number || parcel.id}.pdf`);
  };

  /* ===============================
     UI
  ================================ */
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
                                    <Typography><strong>Nbre :</strong> {parcel.weight_kg}</Typography>
                                    <Typography variant="h6" color="primary"><strong>{parcel.price?.toLocaleString()} FCFA</strong></Typography>
                                </Box>

                                <Typography variant="subtitle2" gutterBottom>Description du contenu :</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                    {parcel.description || "Aucune description fournie."}
                                </Typography>
                            </Grid>
                        </Grid>
                        <ParcelTicket80mm parcel={parcel} />
                    </CardContent>
                </Card>
            </Box>
        </GuestLayout>

  );
}
